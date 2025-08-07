import { useConnectWallet } from "@web3-onboard/react";
import { useCallback, useEffect } from "react";
import { PulseChainConfig, EthereumConfig } from "../config/chainConfig";

const useWallet = () => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const account = wallet ? wallet.accounts[0].address : "";

  // Function to switch to a specific chain
  const switchToChain = useCallback(
    async (chainId: number) => {
      if (!wallet?.provider) {
        return;
      }

      const chainConfig = chainId === 1 ? EthereumConfig : PulseChainConfig;

      try {
        const provider = wallet.provider;
        if (provider && provider.request) {
          // Check if we're already on the target chain
          const currentChainId = await provider.request({
            method: "eth_chainId",
          });

          // Convert chainId to hex for comparison
          const targetChainIdHex = "0x" + chainId.toString(16);

          if (
            currentChainId !== chainConfig.chainIdHex &&
            currentChainId !== targetChainIdHex
          ) {
            // Switch to the target chain
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: chainConfig.chainIdHex }],
            });
          } else {
          }
        }
      } catch (error) {
        console.error(`Failed to switch to chain ${chainId}:`, error);
        // If the chain is not added, try to add it
        try {
          const provider = wallet.provider;
          if (provider && provider.request) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainConfig.chainIdHex,
                  chainName: chainConfig.chainName,
                  nativeCurrency: {
                    name: chainConfig.chainSymbol,
                    symbol: chainConfig.chainSymbol,
                    decimals: 18,
                  },
                  rpcUrls: chainConfig.providerList,
                  blockExplorerUrls: [chainConfig.explorerUrl],
                },
              ],
            });
          }
        } catch (addError) {
          console.error(`Failed to add chain ${chainId}:`, addError);
        }
      }
    },
    [wallet]
  );

  // Function to switch to Pulsechain (for backward compatibility)
  const switchToPulsechain = useCallback(async () => {
    await switchToChain(PulseChainConfig.chainId);
  }, [switchToChain]);

  // Function to switch to Ethereum
  const switchToEthereum = useCallback(async () => {
    await switchToChain(EthereumConfig.chainId);
  }, [switchToChain]);

  // Set provider whenever wallet changes
  useEffect(() => {
    if (wallet && wallet.provider) {
      (window as any).provider = wallet.provider;
    } else {
      delete (window as any).provider;
    }
  }, [wallet]);

  // Auto-switch to Pulsechain when wallet is connected (for backward compatibility)
  useEffect(() => {
    if (wallet?.provider) {
      switchToPulsechain();
    }
  }, [wallet, switchToPulsechain]);

  const connectWallet = useCallback(async () => {
    const wallets = await connect();
    if (wallets[0] != null) {
      (window as any).provider = wallets[0].provider as any;

      // Automatically switch to Pulsechain after connection (for backward compatibility)
      try {
        const provider = wallets[0].provider;
        if (provider && provider.request) {
          // Check if we're already on Pulsechain
          const chainId = await provider.request({ method: "eth_chainId" });

          if (chainId !== PulseChainConfig.chainIdHex) {
            // Switch to Pulsechain
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: PulseChainConfig.chainIdHex }],
            });
          }
        }
      } catch (error) {
        console.error("Failed to switch to Pulsechain:", error);
        // If the chain is not added, try to add it
        try {
          const provider = wallets[0].provider;
          if (provider && provider.request) {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: PulseChainConfig.chainIdHex,
                  chainName: PulseChainConfig.chainName,
                  nativeCurrency: {
                    name: PulseChainConfig.chainSymbol,
                    symbol: PulseChainConfig.chainSymbol,
                    decimals: 18,
                  },
                  rpcUrls: PulseChainConfig.providerList,
                  blockExplorerUrls: [PulseChainConfig.explorerUrl],
                },
              ],
            });
          }
        } catch (addError) {
          console.error("Failed to add Pulsechain:", addError);
        }
      }
    }
  }, [connect]);

  const disconnectWallet = useCallback(async () => {
    if (wallet?.label) {
      await disconnect({ label: wallet.label });
    }
  }, [disconnect, wallet]);

  return {
    account,
    connectWallet,
    disconnectWallet,
    switchToPulsechain,
    switchToEthereum,
    switchToChain,
    wallet,
  };
};

export default useWallet;
