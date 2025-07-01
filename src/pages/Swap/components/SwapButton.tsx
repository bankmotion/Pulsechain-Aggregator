import { motion } from "framer-motion";
import React from "react";
import { ZeroAddress } from "../../../const/swap";
import { TokenType } from "../../../types/Swap";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useAppSelector } from "../../../store/hooks";

interface SwapButtonProps {
  fromToken: TokenType | null;
  toToken: TokenType | null;
  fromAmount: string;
  outputAmount: number;
  quote: any;
  onSwap: () => void;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  fromToken,
  toToken,
  fromAmount,
  outputAmount,
  quote,
  onSwap,
}) => {
  const { isSwapping, isApproved, isApproving } = useAppSelector(
    (state) => state.swap
  );
  const getButtonText = () => {
    if (isSwapping || isApproving) {
      return "Processing...";
    }
    if (
      fromToken &&
      toToken &&
      (fromToken.blockchainNetwork !== "pulsechain" ||
        toToken.blockchainNetwork !== "pulsechain")
    ) {
      return "Only Pulsechain is supported";
    }
    if (fromToken && toToken && Number(fromAmount) > 0 && quote?.calldata) {
      return fromToken.address !== ZeroAddress
        ? isApproved
          ? "Swap"
          : "Approve Token"
        : "Swap";
    }
    if (fromToken && toToken && Number(fromAmount) > 0) {
      return "Waiting for quote...";
    }
    if (fromToken && toToken) {
      return "Enter an Amount";
    }
    return "Select Tokens";
  };

  const isDisabled =
    !fromToken ||
    !toToken ||
    fromToken.blockchainNetwork !== "pulsechain" ||
    toToken.blockchainNetwork !== "pulsechain" ||
    Number(fromAmount) <= 0 ||
    Number(outputAmount) <= 0 ||
    !quote?.calldata ||
    isSwapping ||
    isApproving;

  return (
    <div className="flex items-center mt-3 sm:mt-4">
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
        whileTap={{ scale: 0.95 }}
        disabled={isDisabled}
        onClick={onSwap}
        className="flex-1 bg-green-500 text-black px-3 sm:px-4 py-2.5 sm:py-3 rounded-[16px] sm:rounded-[20px] min-w-[160px] sm:min-w-[200px] font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText()}
      </motion.button>
    </div>
  );
};

export default SwapButton;
