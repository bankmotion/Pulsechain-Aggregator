import { motion } from "framer-motion";
import React from "react";
import { SupportTypes, ZeroAddress } from "../../../const/swap";
import { TokenType } from "../../../types/Swap";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useAppSelector } from "../../../store/hooks";
import useWallet from "../../../hooks/useWallet";
import { isBridgeOrPulse } from "../../../utils";

import { ExchangeRateType } from "../../../types/Swap";

interface SwapButtonProps {
  fromToken: TokenType | null;
  toToken: TokenType | null;
  fromAmount: string;
  outputAmount: number;
  quote: any;
  onSwap: () => void;
  hasSufficientBalance: boolean;
  exchangeRate?: ExchangeRateType | null;
}

const SwapButton: React.FC<SwapButtonProps> = ({
  fromToken,
  toToken,
  fromAmount,
  outputAmount,
  quote,
  onSwap,
  hasSufficientBalance,
  exchangeRate,
}) => {
  const { account } = useWallet();
  const { isSwapping, isApproved, isApproving } = useAppSelector(
    (state) => state.swap
  );

  // Check if it's a bridge exchange
  const isBridgeExchange =
    exchangeRate &&
    fromToken &&
    toToken &&
    isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge;

  const getButtonText = () => {
    if (isSwapping || isApproving) {
      return {
        text: "Processing...",
        disabled: true,
      };
    }
    if (fromToken && toToken) {
      if (isBridgeOrPulse(fromToken, toToken) === SupportTypes.NotSupported) {
        return {
          text: "This is not supported",
          disabled: true,
        };
      }
    }
    if (!account) {
      return {
        text: "Connect Wallet",
        disabled: false,
      };
    }
    if (
      fromToken &&
      toToken &&
      Number(fromAmount) > 0 &&
      !hasSufficientBalance
    ) {
      return {
        text: "Insufficient Balance",
        disabled: true,
      };
    }

    if (
      fromToken &&
      toToken &&
      Number(fromAmount) > 0 &&
      (quote?.calldata || isBridgeExchange)
    ) {
      return fromToken.address !== ZeroAddress
        ? isApproved
          ? {
              text: "Swap",
              disabled: false,
            }
          : {
              text: "Approve Token",
              disabled: false,
            }
        : { text: "Swap", disabled: false };
    }
    if (fromToken && toToken && Number(fromAmount) > 0) {
      return {
        text: "Waiting for quote...",
        disabled: true,
      };
    }
    if (fromToken && toToken) {
      return {
        text: "Enter an Amount",
        disabled: true,
      };
    }
    return {
      text: "Select Tokens",
      disabled: true,
    };
  };

  return (
    <div className="flex items-center mt-3 sm:mt-4">
      <motion.button
        whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
        whileTap={{ scale: 0.95 }}
        disabled={getButtonText().disabled}
        onClick={onSwap}
        className="flex-1 bg-green-500 text-black px-3 sm:px-4 py-2.5 sm:py-3 rounded-[16px] sm:rounded-[20px] min-w-[160px] sm:min-w-[200px] font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {getButtonText().text}
      </motion.button>
    </div>
  );
};

export default SwapButton;
