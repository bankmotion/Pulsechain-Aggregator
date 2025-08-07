import React from 'react';
import { motion } from 'framer-motion';
import { BridgeTransaction } from '../../../store/bridgeSlice';

interface BridgeTransactionProgressProps {
  bridgeTransaction: BridgeTransaction | null;
  isPolling: boolean;
}

const BridgeTransactionProgress: React.FC<BridgeTransactionProgressProps> = ({
  bridgeTransaction,
  isPolling,
}) => {
  if (!bridgeTransaction) return null;

  // Helper function to format amount by removing trailing zeros
  const formatAmount = (amount: string, decimals: number) => {
    const num = parseInt(amount) / Math.pow(10, decimals);
    // Convert to string with fixed precision first
    const formatted = num.toFixed(6);
    
    // Remove trailing zeros
    let result = formatted;
    while (result.includes('.') && result.endsWith('0')) {
      result = result.slice(0, -1);
    }
    // Remove trailing decimal point if it exists
    if (result.endsWith('.')) {
      result = result.slice(0, -1);
    }
    
    return result;
  };

  // Calculate progress based on status and timestamps
  const getProgressStep = () => {
    if (bridgeTransaction.status === 'executed') return 4;
    if (bridgeTransaction.status === 'pending') {
      // Calculate progress based on time elapsed for steps 1-4 (Waiting, Confirming, Exchanging, Sending)
      const createdAt = new Date(bridgeTransaction.createdAt).getTime();
      const now = Date.now();
      const elapsed = now - createdAt;
      const totalExpectedTime = 96 * 12 * 1000; // 96 blocks * 12 seconds in milliseconds
      const progress = Math.min(elapsed / totalExpectedTime, 1);
      
      // Map progress to steps (0-1 to 1-4)
      // Each step represents ~25% of the total time (since we're only going up to Sending)
      if (progress < 0.35) return 0; // Waiting (0-35%)
      if (progress < 0.65) return 1; // Confirming (35-65%)
      if (progress < 0.90) return 2; // Exchanging (65-90%)
      return 3; // Sending (90-100%) - Stay here until API returns 'executed'
    }
    return 0;
  };

  const currentStep = getProgressStep();

  const steps = [
    { name: 'Waiting', key: 'waiting' },
    { name: 'Confirming', key: 'confirming' },
    { name: 'Exchanging', key: 'exchanging' },
    { name: 'Sending', key: 'sending' },
    { name: 'Finished', key: 'finished' },
  ];

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'pending';
  };

  const getStepColor = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'current':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'pending':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  const getStepIcon = (status: 'completed' | 'current' | 'pending') => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'current':
        return (
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-yellow-300">
            {isPolling && (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#1e2030] to-[#2b2e4a] rounded-2xl p-6 border border-[#3a3f5a]/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Bridge Order</h3>
            <p className="text-gray-400 text-sm">ID: {bridgeTransaction.id}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          bridgeTransaction.status === 'executed' 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
        }`}>
          {bridgeTransaction.status === 'executed' ? 'Finished' : 'In Progress'}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isLast = index === steps.length - 1;
            
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  {getStepIcon(status)}
                  <span className={`mt-2 text-xs font-medium ${
                    status === 'completed' ? 'text-green-400' :
                    status === 'current' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {!isLast && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#1e2030] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">From</span>
          </div>
          <div className="text-white font-medium">
            Amount: {formatAmount(bridgeTransaction.amount, bridgeTransaction.tokenDecimals)} {bridgeTransaction.tokenSymbol}
          </div>
        </div>

        <div className="bg-[#1e2030] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm">To</span>
          </div>
          <div className="text-white font-medium">
            Amount: {formatAmount(bridgeTransaction.amount, bridgeTransaction.tokenDecimals)} {bridgeTransaction.tokenSymbol}
          </div>
        </div>

        <div className="bg-[#1e2030] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400 text-sm">Timeline</span>
          </div>
          <div className="text-white text-sm">
            <div>Created: {new Date(bridgeTransaction.createdAt).toLocaleString()}</div>
            {bridgeTransaction.targetTimestamp && (
              <div>Completed: {new Date(bridgeTransaction.targetTimestamp).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div className="bg-[#1e2030] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-gray-400 text-sm">Payin Hash</span>
          </div>
          <div className="text-white text-sm font-mono">
            {bridgeTransaction.sourceTxHash.slice(0, 10)}...{bridgeTransaction.sourceTxHash.slice(-8)}
          </div>
        </div>
      </div>

      {bridgeTransaction.targetTxHash && (
        <div className="mt-4 bg-[#1e2030] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-gray-400 text-sm">Payout Hash</span>
          </div>
          <div className="text-white text-sm font-mono">
            {bridgeTransaction.targetTxHash.slice(0, 10)}...{bridgeTransaction.targetTxHash.slice(-8)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BridgeTransactionProgress; 