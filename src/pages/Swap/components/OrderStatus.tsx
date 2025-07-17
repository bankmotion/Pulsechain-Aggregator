import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OrderType, TokenType } from "../../../types/Swap";
import { isBridgeOrPulse } from "../../../utils";
import { SupportTypes } from "../../../const/swap";

interface OrderStatusProps {
  orderType: OrderType;
  fromToken: TokenType | null;
  toToken: TokenType | null;
}

const OrderStatus: React.FC<OrderStatusProps> = ({
  orderType,
  fromToken,
  toToken,
}) => {
  // Check if this is a bridge order
  const isBridgeOrder =
    fromToken &&
    toToken &&
    isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge;

  if (!isBridgeOrder) {
    return null;
  }

  const getStatusStep = (status: string) => {
    switch (status.toLowerCase()) {
      case "waiting":
        return 1;
      case "confirming":
        return 2;
      case "exchanging":
        return 3;
      case "sending":
        return 4;
      case "finished":
        return 5;
      default:
        return 1;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "finished":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "sending":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "exchanging":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "confirming":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "waiting":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "finished":
        return "✅";
      case "sending":
        return "📤";
      case "exchanging":
        return "🔄";
      case "confirming":
        return "⏳";
      case "waiting":
        return "⏰";
      default:
        return "⏳";
    }
  };

  const getStepIcon = (step: number, currentStep: number) => {
    if (step < currentStep) return "✅";
    if (step === 5) return "✅";
    if (step === currentStep) return "⏳";
    return "⭕";
  };

  const getStepColor = (step: number, currentStep: number) => {
    if (step < currentStep) return "text-emerald-400 bg-emerald-400/10";
    if (step === currentStep) return "text-yellow-400 bg-yellow-400/10 border-2 border-yellow-400/50 shadow-lg shadow-yellow-400/20";
    return "text-gray-400 bg-gray-400/10";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (currency: string) => {
    return currency.toUpperCase();
  };

  const formatAmount = (amount: number, decimals: number = 18) => {
    if (amount === 0 || !amount) return "0.000000";
    
    // Handle different decimal places
    if (decimals === 18) {
      return amount.toFixed(6);
    } else if (decimals === 6) {
      return amount.toFixed(6);
    } else if (decimals === 8) {
      return amount.toFixed(8);
    } else {
      return amount.toFixed(6);
    }
  };

  const currentStep = getStatusStep(orderType.status);
  const steps = [
    { name: "Waiting", icon: "⏰" },
    { name: "Confirming", icon: "⏳" },
    { name: "Exchanging", icon: "🔄" },
    { name: "Sending", icon: "📤" },
    { name: "Finished", icon: "✅" }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-6 p-6 bg-gradient-to-br from-[#1a1b2e] via-[#1e2030] to-[#2b2e4a] rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm"
      >
        {/* Header with enhanced styling */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white text-lg">🌉</span>
            </motion.div>
            <div>
              <h3 className="text-white font-bold text-lg">Bridge Order</h3>
              <p className="text-gray-400 text-sm">ID: {orderType.id}</p>
            </div>
          </div>
          <motion.div
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              orderType.status
            )}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {getStatusIcon(orderType.status)} {orderType.status}
          </motion.div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.name} className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${getStepColor(index + 1, currentStep)}`}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: index + 1 === currentStep && currentStep !== 5 ? [1, 1.2, 1] : 1,
                    rotate: index + 1 === currentStep && currentStep !== 5 ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ 
                    delay: 0.4 + index * 0.1,
                    duration: index + 1 === currentStep && currentStep !== 5 ? 0.6 : 0.3,
                    repeat: index + 1 === currentStep && currentStep !== 5 ? Infinity : 0,
                    repeatDelay: 2
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {getStepIcon(index + 1, currentStep)}
                </motion.div>
                <motion.span 
                  className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                    index + 1 <= currentStep ? "text-white" : "text-gray-500"
                  }`}
                  animate={index + 1 === currentStep && currentStep !== 5 ? {
                    scale: [1, 1.1, 1],
                    color: ["#fbbf24", "#f59e0b", "#fbbf24"]
                  } : {}}
                  transition={{
                    duration: 0.6,
                    repeat: index + 1 === currentStep && currentStep !== 5 ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  {step.name}
                </motion.span>
                {index < steps.length - 1 && (
                  <motion.div 
                    className={`w-16 h-0.5 mt-2 transition-all duration-500 ${
                      index + 1 < currentStep ? "bg-emerald-400" : "bg-gray-600"
                    }`}
                    animate={index + 1 === currentStep && currentStep !== 5 ? {
                      backgroundColor: ["#6b7280", "#fbbf24", "#6b7280"]
                    } : {}}
                    transition={{
                      duration: 0.6,
                      repeat: index + 1 === currentStep && currentStep !== 5 ? Infinity : 0,
                      repeatDelay: 2
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          
          {/* Current Step Highlight */}
          <motion.div
            className="mt-4 p-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-xl border border-yellow-400/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2">
              {currentStep !== 5 && <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-yellow-400 text-lg"
              >
                ⏳
              </motion.div>}
              <span className="text-white font-semibold text-sm">
                Currently: {steps[currentStep - 1]?.name}
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-yellow-400 text-lg"
              >
                ✨
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Order Details with enhanced layout */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-blue-400">📤</span> From
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Amount:</span>
                <span className="text-white font-mono text-sm">
                  {formatAmount(orderType.fromAmount)} {formatCurrency(orderType.fromCurrency)}
                </span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-green-400">📥</span> To
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Amount:</span>
                <span className="text-white font-mono text-sm">
                  {orderType.toAmount
                    ? `${formatAmount(orderType.toAmount)} ${formatCurrency(orderType.toCurrency)}`
                    : "Calculating..."}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <span className="text-yellow-400">🕒</span> Timeline
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">
                    {formatDate(orderType.createdAt)}
                  </span>
                </div>
                {orderType.completedAt && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Completed:</span>
                    <span className="text-white">
                      {formatDate(orderType.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transaction Hashes with enhanced styling */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {orderType.payinHash && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="text-blue-400">🔗</span> Payin Hash
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Transaction:</span>
                <span className="text-white font-mono text-xs bg-slate-900/50 px-2 py-1 rounded">
                  {orderType.payinHash.slice(0, 12)}...{orderType.payinHash.slice(-8)}
                </span>
              </div>
            </div>
          )}
          
          {orderType.payoutHash && (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <span className="text-green-400">🔗</span> Payout Hash
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Transaction:</span>
                <span className="text-white font-mono text-xs bg-slate-900/50 px-2 py-1 rounded">
                  {orderType.payoutHash.slice(0, 12)}...{orderType.payoutHash.slice(-8)}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderStatus;
