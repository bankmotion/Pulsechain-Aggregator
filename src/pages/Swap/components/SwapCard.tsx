import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { TokenType } from "../../../types/Swap";
import AmountInput from "./AmountInput";
import TokenSelector from "./TokenSelector";
import TokenSwapButton from "./TokenSwapButton";
import AddToWalletButton from "../../../components/AddToWalletButton";
import { TokenInfo } from "../../../utils/walletUtils";
import useWallet from "../../../hooks/useWallet";

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
  const { wallet } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Get current network from wallet
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

    // Listen for chain changes
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

  // Check if user is on PulseChain (required for swap)
  const isOnPulseChain = () => {
    return currentChainId === 369;
  };

  // Get current network name
  const getCurrentNetworkName = () => {
    if (!currentChainId) return "Unknown";
    if (currentChainId === 1) return "Ethereum";
    if (currentChainId === 369) return "PulseChain";
    return `Chain ID ${currentChainId}`;
  };

  // Convert TokenType to TokenInfo for AddToWalletButton
  const convertToTokenInfo = (token: TokenType): TokenInfo => ({
    address: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId: 369, // PulseChain only
    image: token.image,
  });

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
        <AmountInput
          amount={fromAmount}
          token={fromToken}
          onAmountChange={onFromAmountChange}
          isOutput={false}
        />
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
        <AmountInput
          amount=""
          token={toToken}
          onAmountChange={() => {}}
          isOutput={true}
          outputAmount={outputAmount}
          isLoading={isLoadingQuote}
        />
      </div>

      {/* Network Status and Add to Wallet Section */}
      {wallet && (
        <>
          {/* Add to Wallet Buttons */}
          <div className="mt-4 space-y-3">
            {/* From Token Add to Wallet */}
            {fromToken && (
              <div className="flex items-center justify-between p-3 bg-[#2b2e4a]/50 rounded-lg border border-[#3a3f5a]/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Add {fromToken.symbol} to your wallet
                    </p>
                    <p className="text-gray-400 text-xs">
                      Click the button to add {fromToken.symbol} to PulseChain
                    </p>
                  </div>
                </div>
                <AddToWalletButton
                  token={convertToTokenInfo(fromToken)}
                  variant="outline"
                  size="sm"
                />
              </div>
            )}

            {/* To Token Add to Wallet */}
            {toToken && (
              <div className="flex items-center justify-between p-3 bg-[#2b2e4a]/50 rounded-lg border border-[#3a3f5a]/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      Add {toToken.symbol} to your wallet
                    </p>
                    <p className="text-gray-400 text-xs">
                      Click the button to add {toToken.symbol} to PulseChain
                    </p>
                  </div>
                </div>
                <AddToWalletButton
                  token={convertToTokenInfo(toToken)}
                  variant="secondary"
                  size="sm"
                />
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SwapCard;
