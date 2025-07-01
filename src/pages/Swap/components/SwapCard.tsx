import { motion } from "framer-motion";
import React from "react";
import { TokenType } from "../../../types/Swap";
import AmountInput from "./AmountInput";
import TokenSelector from "./TokenSelector";
import TokenSwapButton from "./TokenSwapButton";

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
    </motion.div>
  );
};

export default SwapCard; 