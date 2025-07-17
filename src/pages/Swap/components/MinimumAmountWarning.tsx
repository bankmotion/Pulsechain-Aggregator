import React from "react";
import { motion } from "framer-motion";

interface MinimumAmountWarningProps {
  error: string | null;
  fromToken: any;
}

const MinimumAmountWarning: React.FC<MinimumAmountWarningProps> = ({
  error,
  fromToken,
}) => {
  if (!error || !fromToken) return null;

  // Extract minimum amount from error message if it contains "minimum"
  const isMinimumAmountError = error.toLowerCase().includes("minimum") || error.toLowerCase().includes("maximum");
  
  if (!isMinimumAmountError) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-2 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <div className="text-amber-400 text-sm">⚠️</div>
        <span className="text-amber-200 text-sm font-medium">
          {error}
        </span>
      </div>
    </motion.div>
  );
};

export default MinimumAmountWarning; 