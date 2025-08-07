import React from 'react';
import { motion } from 'framer-motion';

const BridgeHeader: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8"
    >
      <div className="flex flex-col">
        <h2 className="font-bold text-2xl sm:text-3xl text-white mb-2">
          Bridge
        </h2>
      </div>
    </motion.div>
  );
};

export default BridgeHeader; 