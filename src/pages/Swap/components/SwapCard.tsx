import { motion } from "framer-motion";
import React from "react";
import { TokenType, ExchangeRateType } from "../../../types/Swap";
import AmountInput from "./AmountInput";
import TokenSelector from "./TokenSelector";
import TokenSwapButton from "./TokenSwapButton";
import MinimumAmountWarning from "./MinimumAmountWarning";
import { isBridgeOrPulse } from "../../../utils";
import { SupportTypes } from "../../../const/swap";

interface SwapCardProps {
  fromToken: TokenType | null;
  toToken: TokenType | null;
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
  exchangeRate?: ExchangeRateType | null;
  isNetworkSwitching?: boolean;
  exchangeRateError?: string | null;
}

const SwapCard: React.FC<SwapCardProps> = ({
  fromToken,
  toToken,
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
  exchangeRate,
  isNetworkSwitching = false,
  exchangeRateError,
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

  // Calculate output amount based on whether it's a bridge exchange or regular swap
  const getOutputAmount = () => {
    if (exchangeRate) {
      // For bridge exchanges, use the exchange rate data
      return exchangeRate.toAmount || 0;
    }
    // For regular swaps, use the outputAmount prop
    return outputAmount;
  };

  return (
    <motion.div className="bg-[#1e2030] rounded-xl p-3 sm:p-4 flex-grow relative gap-2 flex flex-col">
      {/* From Token Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col gap-2">
          <TokenSelector
            token={fromToken}
            type="from"
            onSelect={onFromTokenSelect}
          />
          {fromToken && !isNetworkSwitching && (
            <div className="text-xs text-gray-400 ml-2">
              Balance: {getFromTokenBalance()} {fromToken.symbol}
            </div>
          )}
          {fromToken && isNetworkSwitching && (
            <div className="text-xs text-gray-400 ml-2">Loading balance...</div>
          )}
        </div>
        <AmountInput
          amount={fromAmount}
          token={fromToken}
          onAmountChange={onFromAmountChange}
          isOutput={false}
        />
      </div>

      {/* Minimum Amount Warning */}
      <MinimumAmountWarning
        error={exchangeRateError || null}
        fromToken={fromToken}
      />

      {/* Swap Button */}
      <TokenSwapButton onSwap={onTokenSwap} />

      {/* To Token Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex flex-col gap-2">
          <TokenSelector token={toToken} type="to" onSelect={onToTokenSelect} />
          {toToken &&
            fromToken &&
            isBridgeOrPulse(fromToken, toToken) !== SupportTypes.Bridge &&
            !isNetworkSwitching && (
              <div className="text-xs text-gray-400 ml-2">
                Balance: {getToTokenBalance()} {toToken.symbol}
              </div>
            )}
          {toToken &&
            fromToken &&
            isBridgeOrPulse(fromToken, toToken) !== SupportTypes.Bridge &&
            isNetworkSwitching && (
              <div className="text-xs text-gray-400 ml-2">
                Loading balance...
              </div>
            )}
        </div>
        <AmountInput
          amount=""
          token={toToken}
          onAmountChange={() => {}}
          isOutput={true}
          outputAmount={getOutputAmount()}
          isLoading={isLoadingQuote}
        />
      </div>
    </motion.div>
  );
};

export default SwapCard;
