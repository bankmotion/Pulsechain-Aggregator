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
}) => {
  return (
    <motion.div className="bg-[#1e2030] rounded-xl p-4 flex-grow relative gap-2 flex flex-col">
      {/* From Token Section */}
      <div className="flex items-center justify-between">
        <TokenSelector
          token={fromToken}
          allChains={allChains}
          type="from"
          onSelect={onFromTokenSelect}
        />
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
      <div className="flex items-center justify-between">
        <TokenSelector
          token={toToken}
          allChains={allChains}
          type="to"
          onSelect={onToTokenSelect}
        />
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