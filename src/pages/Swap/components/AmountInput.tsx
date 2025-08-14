import { motion } from "framer-motion";
import React from "react";
import { TokenType } from "../../../types/Swap";

interface AmountInputProps {
  amount: string;
  token: TokenType | null;
  onAmountChange: (value: string) => void;
  isOutput?: boolean;
  outputAmount?: number;
  isLoading?: boolean;
  balance?: string;
  balanceLoading?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  token,
  onAmountChange,
  isOutput = false,
  outputAmount = 0,
  isLoading = false,
  balance = "0",
  balanceLoading = false,
}) => {
  const formatAmount = (value: string) => {
    if (!value) return "";
    if (value.includes(".")) {
      const parts = value.split(".");
      return (
        parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + parts[1]
      );
    }
    return Number(value).toLocaleString();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isOutput) return; // Output field is read-only
    
    const value = e.target.value.replace(/[^0-9.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) {
      onAmountChange(parts[0] + "." + parts.slice(1).join(""));
    } else {
      onAmountChange(value);
    }
  };

  const handleMaxClick = () => {
    if (isOutput) return; // Don't allow max click on output field
    
    // Use actual balance from props
    if (balance && !balanceLoading && parseFloat(balance) > 0) {
      onAmountChange(balance);
    }
  };

  const getDisplayValue = () => {
    if (isOutput) {
      if (outputAmount) {
        return formatAmount(outputAmount.toString());
      }
      return "0.00";
    }
    return formatAmount(amount);
  };

  const getPriceDisplay = () => {
    if (!token?.price) return "0.00$";
    
    const priceValue = isOutput 
      ? Number(token.price) * Number(outputAmount)
      : Number(token.price) * Number(amount);
    
    return `$${priceValue.toFixed(3)}`;
  };

  return (
    <motion.div className="flex flex-col items-end justify-center gap-2 w-full sm:w-auto">
      {isOutput ? (
        <div className="text-base sm:text-lg font-medium">
          {isLoading ? (
            <div className="flex items-center justify-end">
              <div className="w-20 sm:w-28 h-5 sm:h-6 bg-gray-600 rounded-full animate-pulse opacity-30"></div>
            </div>
          ) : (
            getDisplayValue()
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Enter an Amount"
            value={getDisplayValue()}
            onChange={handleInputChange}
            className="bg-transparent text-right w-full outline-none text-lg sm:text-xl placeholder-gray-400 font-medium"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMaxClick}
            disabled={balanceLoading || parseFloat(balance || "0") <= 0}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#3a3f5a] to-[#2b2e4a] text-gray-300 rounded-lg hover:from-[#4a4f6a] hover:to-[#3a3f5a] hover:text-white transition-all duration-200 font-medium flex-shrink-0 ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            MAX
          </motion.button>
        </div>
      )}
      <div className="text-xs sm:text-sm text-gray-400">
        {isLoading ? (
          <div className="w-12 sm:w-16 h-5 sm:h-6 bg-gray-600 rounded-full animate-pulse opacity-30"></div>
        ) : (
          getPriceDisplay()
        )}
      </div>
    </motion.div>
  );
};

export default AmountInput; 