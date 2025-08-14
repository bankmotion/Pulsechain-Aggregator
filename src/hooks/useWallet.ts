import { useConnectWallet } from "@web3-onboard/react";
import { useCallback, useEffect } from "react";
import { PulseChainConfig, EthereumConfig } from "../config/chainConfig";

const useWallet = () => {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const account = wallet ? wallet.accounts[0].address : "";

  const switchToChain = useCallback(
    async (chainId: number) => {
      if (!wallet?.provider) return;

      const chainConfig = chainId === 1 ? EthereumConfig : PulseChainConfig;

      try {
        await wallet.provider.request({
              method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
      } catch (error) {
        console.error(`Failed to switch to chain ${chainId}:`, error);
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

  const switchToPulsechain = useCallback(async () => {
    await switchToChain(PulseChainConfig.chainId);
  }, [switchToChain]);

  const switchToEthereum = useCallback(async () => {
    await switchToChain(EthereumConfig.chainId);
  }, [switchToChain]);

  useEffect(() => {
    if (wallet && wallet.provider) {
      (window as any).provider = wallet.provider;
    } else {
      delete (window as any).provider;
    }
  }, [wallet]);

  const connectWallet = useCallback(async () => {
    const wallets = await connect();
    if (wallets[0] != null) {
      (window as any).provider = wallets[0].provider as any;
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
