import { useConnectWallet } from "@web3-onboard/react";
import { useCallback, useEffect } from "react";
import { PulseChainConfig } from "../config/chainConfig";

const useWallet = () => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const account = wallet ? wallet.accounts[0].address : "";

  // Function to switch to Pulsechain
  const switchToPulsechain = useCallback(async () => {
    if (!wallet?.provider) return;
    
    try {
      const provider = wallet.provider;
      if (provider && provider.request) {
        // Check if we're already on Pulsechain
        const chainId = await provider.request({ method: 'eth_chainId' });
        
        if (chainId !== PulseChainConfig.chainIdHex) {
          // Switch to Pulsechain
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: PulseChainConfig.chainIdHex }],
          });
        }
      }
    } catch (error) {
      console.error('Failed to switch to Pulsechain:', error);
      // If the chain is not added, try to add it
      try {
        const provider = wallet.provider;
        if (provider && provider.request) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: PulseChainConfig.chainIdHex,
              chainName: PulseChainConfig.chainName,
              nativeCurrency: {
                name: PulseChainConfig.chainSymbol,
                symbol: PulseChainConfig.chainSymbol,
                decimals: 18,
              },
              rpcUrls: PulseChainConfig.providerList,
              blockExplorerUrls: [PulseChainConfig.explorerUrl],
            }],
          });
        }
      } catch (addError) {
        console.error('Failed to add Pulsechain:', addError);
      }
    }
  }, [wallet]);

  // Set provider whenever wallet changes
  useEffect(() => {
    if (wallet && wallet.provider) {
      (window as any).provider = wallet.provider;
    } else {
      delete (window as any).provider;
    }
  }, [wallet]);

  // Auto-switch to Pulsechain when wallet is connected
  useEffect(() => {
    if (wallet?.provider) {
      switchToPulsechain();
    }
  }, [wallet, switchToPulsechain]);

  const connectWallet = useCallback(async () => {
    const wallets = await connect();
    if (wallets[0] != null) {
      (window as any).provider = wallets[0].provider as any;
      
      // Automatically switch to Pulsechain after connection
      try {
        const provider = wallets[0].provider;
        if (provider && provider.request) {
          // Check if we're already on Pulsechain
          const chainId = await provider.request({ method: 'eth_chainId' });
          
          if (chainId !== PulseChainConfig.chainIdHex) {
            // Switch to Pulsechain
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: PulseChainConfig.chainIdHex }],
            });
          }
        }
      } catch (error) {
        console.error('Failed to switch to Pulsechain:', error);
        // If the chain is not added, try to add it
        try {
          const provider = wallets[0].provider;
          if (provider && provider.request) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: PulseChainConfig.chainIdHex,
                chainName: PulseChainConfig.chainName,
                nativeCurrency: {
                  name: PulseChainConfig.chainSymbol,
                  symbol: PulseChainConfig.chainSymbol,
                  decimals: 18,
                },
                rpcUrls: PulseChainConfig.providerList,
                blockExplorerUrls: [PulseChainConfig.explorerUrl],
              }],
            });
          }
        } catch (addError) {
          console.error('Failed to add Pulsechain:', addError);
        }
      }
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    if (wallet?.label) {
      await disconnect({ label: wallet.label });
    }
  }, [disconnect, wallet]);

  return { account, connectWallet, disconnectWallet, switchToPulsechain };
};

export default useWallet;
