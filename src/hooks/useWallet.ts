import { useConnectWallet } from "@web3-onboard/react";
import { useCallback, useEffect } from "react";
import { PulseChainConfig, EthereumConfig } from "../config/chainConfig";

const useWallet = () => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const account = wallet ? wallet.accounts[0].address : "";

  // Function to switch to a specific network
  const switchToNetwork = useCallback(async (blockchainNetwork: string) => {
    if (!wallet?.provider) return;
    
    const config = blockchainNetwork === "ethereum" ? EthereumConfig : PulseChainConfig;
    
    try {
      const provider = wallet.provider;
      if (provider && provider.request) {
        // Check if we're already on the target network
        const chainId = await provider.request({ method: 'eth_chainId' });
        
        if (chainId !== config.chainIdHex) {
          // Switch to the target network
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: config.chainIdHex }],
          });
        }
      }
    } catch (error) {
      console.error(`Failed to switch to ${config.chainName}:`, error);
      // If the chain is not added, try to add it
      try {
        const provider = wallet.provider;
        if (provider && provider.request) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: config.chainIdHex,
              chainName: config.chainName,
              nativeCurrency: {
                name: config.chainSymbol,
                symbol: config.chainSymbol,
                decimals: 18,
              },
              rpcUrls: config.providerList,
              blockExplorerUrls: [config.explorerUrl],
            }],
          });
        }
      } catch (addError) {
        console.error(`Failed to add ${config.chainName}:`, addError);
      }
    }
  }, [wallet]);

  // Function to switch to Pulsechain (for backward compatibility)
  const switchToPulsechain = useCallback(async () => {
    await switchToNetwork("pulsechain");
  }, [switchToNetwork]);

  // Set provider whenever wallet changes
  useEffect(() => {
    if (wallet && wallet.provider) {
      (window as any).provider = wallet.provider;
    } else {
      delete (window as any).provider;
    }
  }, [wallet]);

  // Network switching is now handled in the Swap component based on selected tokens

  const connectWallet = useCallback(async () => {
    const wallets = await connect();
    if (wallets[0] != null) {
      (window as any).provider = wallets[0].provider as any;
      // Network switching will be handled automatically when tokens are selected
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    if (wallet?.label) {
      await disconnect({ label: wallet.label });
    }
  }, [disconnect, wallet]);

  return { account, connectWallet, disconnectWallet, switchToPulsechain, switchToNetwork };
};

export default useWallet;
