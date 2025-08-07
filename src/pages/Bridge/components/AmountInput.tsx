import React from 'react';
import { motion } from 'framer-motion';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedToken: string;
  balance: string;
  balanceLoading: boolean;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  selectedToken,
  balance,
  balanceLoading,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(inputValue) || inputValue === '') {
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
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="0.00"
          className="flex-1 bg-transparent text-white text-xl font-semibold placeholder-gray-500 focus:outline-none min-w-0"
        />
        <div className="flex items-center space-x-3 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMaxClick}
            className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#3a3f5a] to-[#2b2e4a] text-gray-300 rounded-lg hover:from-[#4a4f6a] hover:to-[#3a3f5a] hover:text-white transition-all duration-200 font-medium flex-shrink-0"
          >
            MAX
          </motion.button>
          <span className="text-gray-300 font-semibold text-base max-w-[80px] truncate flex-shrink-0">{selectedToken}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AmountInput; 