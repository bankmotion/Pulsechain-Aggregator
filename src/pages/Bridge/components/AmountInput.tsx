import React from "react";
import { motion } from "framer-motion";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedToken: string;
  balance: string;
  balanceLoading: boolean;
  tokenAddress?: string;
  onCopyAddress?: () => void;
  onAddToWallet?: () => void;
  showButtons?: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  selectedToken,
  balance,
  balanceLoading,
  tokenAddress,
  onCopyAddress,
  onAddToWallet,
  showButtons = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(inputValue) || inputValue === "") {
      onChange(inputValue);
    }
  };

  const handleMaxClick = () => {
    // Use actual balance from contract
    if (balance && !balanceLoading && parseFloat(balance) > 0) {
      onChange(balance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#2b2e4a] to-[#1e2030] rounded-xl border border-[#3a3f5a] hover:border-[#4a4f6a] transition-all duration-200 shadow-lg">
        <div className="flex-1 min-w-0 mr-4">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="0.00"
            className="w-full bg-transparent text-white text-xl font-semibold placeholder-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center min-w-0 w-32 justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMaxClick}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#3a3f5a] to-[#2b2e4a] text-gray-300 rounded-lg hover:from-[#4a4f6a] hover:to-[#3a3f5a] hover:text-white transition-all duration-200 font-medium flex-shrink-0"
          >
            MAX
          </motion.button>

          {showButtons && tokenAddress && (
            <>
              <button
                onClick={onCopyAddress}
                className="p-1 hover:bg-[#3a3f5a]/50 rounded-lg transition-colors duration-200 flex-shrink-0 w-8 h-8 flex items-center justify-center"
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
                onClick={onAddToWallet}
                className="p-1 hover:bg-[#3a3f5a]/50 rounded-lg transition-colors duration-200 flex-shrink-0 w-8 h-8 flex items-center justify-center"
                title="Add to MetaMask"
              >
                <img src="/metamask.png" alt="MetaMask" className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AmountInput;
