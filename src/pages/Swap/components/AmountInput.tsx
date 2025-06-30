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
}

const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  token,
  onAmountChange,
  isOutput = false,
  outputAmount = 0,
  isLoading = false,
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
    <motion.div className="flex flex-col items-end justify-center gap-2">
      {isOutput ? (
        <div className="text-lg font-medium">
          {isLoading ? (
            <div className="flex items-center justify-end">
              <div className="w-28 h-6 bg-gray-600 rounded-full animate-pulse opacity-30"></div>
            </div>
          ) : (
            getDisplayValue()
          )}
        </div>
      ) : (
        <motion.input
          whileFocus={{ scale: 1.02 }}
          type="text"
          placeholder="Enter an Amount"
          value={getDisplayValue()}
          onChange={handleInputChange}
          className="bg-transparent text-right w-full outline-none text-xl placeholder-gray-400 font-medium"
        />
      )}
      <div className="text-sm text-gray-400">
        {isLoading ? (
          <div className="w-16 h-6 bg-gray-600 rounded-full animate-pulse opacity-30"></div>
        ) : (
          getPriceDisplay()
        )}
      </div>
    </motion.div>
  );
};

export default AmountInput; 