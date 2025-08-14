import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { TokenType } from "../../../types/Swap";
import AmountInput from "./AmountInput";
import TokenSelector from "./TokenSelector";
import TokenSwapButton from "./TokenSwapButton";

import { addTokenToWallet } from "../../../utils/walletUtils";
import useWallet from "../../../hooks/useWallet";
import { toast } from "react-toastify";

interface SwapCardProps {
  fromToken: TokenType | null;
  toToken: TokenType | null;
  allChains: TokenType[];
  fromAmount: string;
  outputAmount: number;
  onFromTokenSelect: () => void;
  onToTokenSelect: () => void;
  onFromAmountChange: (value: string) => void;
  onTokenSwap: () => void;
  isLoadingQuote: boolean;
  fromTokenBalance: string;
  toTokenBalance: string;
  nativeBalance: string;
}

const SwapCard: React.FC<SwapCardProps> = ({
  fromToken,
  toToken,
  allChains,
  fromAmount,
  outputAmount,
  onFromTokenSelect,
  onToTokenSelect,
  onFromAmountChange,
  onTokenSwap,
  isLoadingQuote,
  fromTokenBalance,
  toTokenBalance,
  nativeBalance,
}) => {
  const { wallet, switchToChain } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  useEffect(() => {
    const getCurrentChainId = async () => {
      if (wallet?.provider) {
        try {
          const chainId = await wallet.provider.request({
            method: "eth_chainId",
          });
          setCurrentChainId(parseInt(chainId, 16));
        } catch (error) {
          console.error("Failed to get current chain ID:", error);
        }
      }
    };

    getCurrentChainId();

    if (wallet?.provider) {
      const handleChainChanged = (chainId: string) => {
        setCurrentChainId(parseInt(chainId, 16));
      };

      wallet.provider.on("chainChanged", handleChainChanged);

      return () => {
        wallet.provider.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [wallet]);

  const isOnPulseChain = () => {
    return currentChainId === 369;
  };

  const getCurrentNetworkName = () => {
    if (!currentChainId) return "Unknown";
    if (currentChainId === 1) return "Ethereum";
    if (currentChainId === 369) return "PulseChain";
    return `Chain ID ${currentChainId}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return "0";
    if (num < 0.0001) return "< 0.0001";
    return num.toFixed(4);
  };

  const getFromTokenBalance = () => {
    if (!fromToken) return "0";
    return fromToken.address === "0x0000000000000000000000000000000000000000"
      ? formatBalance(nativeBalance)
      : formatBalance(fromTokenBalance);
  };

  const getToTokenBalance = () => {
    if (!toToken) return "0";
    return toToken.address === "0x0000000000000000000000000000000000000000"
      ? formatBalance(nativeBalance)
      : formatBalance(toTokenBalance);
  };

  return (
    <motion.div className="bg-[#1e2030] rounded-xl p-3 sm:p-4 flex-grow relative gap-2 flex flex-col">
      {/* From Token Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col gap-2">
          <TokenSelector
            token={fromToken}
            allChains={allChains}
            type="from"
            onSelect={onFromTokenSelect}
          />
          {fromToken && (
            <div className="text-xs text-gray-400 ml-2">
              Balance: {getFromTokenBalance()} {fromToken.symbol}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <AmountInput
            amount={fromAmount}
            token={fromToken}
            onAmountChange={onFromAmountChange}
            isOutput={false}
            balance={
              fromToken?.address ===
              "0x0000000000000000000000000000000000000000"
                ? nativeBalance
                : fromTokenBalance
            }
            balanceLoading={false}
          />
          {fromToken && (
            <>
              <button
                onClick={() => {
                  if (fromToken?.address) {
                    navigator.clipboard.writeText(fromToken.address);
                    toast.success("Token address copied to clipboard");
                  }
                }}
                className="p-1 hover:bg-[#3a3f5a]/50 rounded-lg transition-colors duration-200 flex-shrink-0 w-8 h-8 flex items-center justify-center ml-2"
                title="Copy token address"
              >
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={async () => {
                  if (!wallet) return;

                  try {
                    if (!isOnPulseChain()) {
                      await switchToChain(369);
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                    }

                    const success = await addTokenToWallet(
                      {
                        address: fromToken.address,
                        symbol: fromToken.symbol,
                        decimals: fromToken.decimals,
                        chainId: 369,
                        image: fromToken.image,
                      },
                      wallet
                    );

                    if (success) {
                      // Show success feedback
                    }
                  } catch (error) {
                    console.error("Error adding token:", error);
                  }
                }}
                className="p-1.5 sm:p-2 hover:bg-[#3a3f5a]/50 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0 border border-transparent hover:border-[#4a4f6a]/30"
                title={`Add ${fromToken.symbol} to MetaMask`}
              >
                <img
                  src="/metamask.png"
                  alt="MetaMask"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <TokenSwapButton onSwap={onTokenSwap} />

      {/* To Token Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col gap-2">
          <TokenSelector
            token={toToken}
            allChains={allChains}
            type="to"
            onSelect={onToTokenSelect}
          />
          {toToken && (
            <div className="text-xs text-gray-400 ml-2">
              Balance: {getToTokenBalance()} {toToken.symbol}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <AmountInput
            amount=""
            token={toToken}
            onAmountChange={() => {}}
            isOutput={true}
            outputAmount={outputAmount}
            isLoading={isLoadingQuote}
            balance={
              toToken?.address === "0x0000000000000000000000000000000000000000"
                ? nativeBalance
                : toTokenBalance
            }
            balanceLoading={false}
          />
          {toToken && (
            <>
              <button
                onClick={() => {
                  if (toToken?.address) {
                    navigator.clipboard.writeText(toToken.address);
                    toast.success("Token address copied to clipboard");
                  }
                }}
                className="p-1 hover:bg-[#3a3f5a]/50 rounded-lg transition-colors duration-200 flex-shrink-0 w-8 h-8 flex items-center justify-center ml-2"
                title="Copy token address"
              >
                <svg
                  className="w-4 h-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={async () => {
                  if (!wallet) return;

                  try {
                    if (!isOnPulseChain()) {
                      await switchToChain(369);
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                    }

                    const success = await addTokenToWallet(
                      {
                        address: toToken.address,
                        symbol: toToken.symbol,
                        decimals: toToken.decimals,
                        chainId: 369,
                        image: toToken.image,
                      },
                      wallet
                    );

                    if (success) {
                      // Show success feedback
                    }
                  } catch (error) {
                    console.error("Error adding token:", error);
                  }
                }}
                className="p-1.5 sm:p-2 hover:bg-[#3a3f5a]/50 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0 border border-transparent hover:border-[#4a4f6a]/30"
                title={`Add ${toToken.symbol} to MetaMask`}
              >
                <img
                  src="/metamask.png"
                  alt="MetaMask"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SwapCard;
