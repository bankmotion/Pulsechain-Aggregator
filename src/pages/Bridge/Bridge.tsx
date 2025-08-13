import React, { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchTokenPairs,
  setSelectedToken,
  setAmount,
  swapChains,
  bridgeTokens,
  fetchBridgeEstimate,
  fetchBalance,
  clearTransactionHash,
  setNeedsApproval,
} from "../../store/bridgeSlice";
import { checkTokenApproval } from "../../contracts/BridgeContract";
import { initializeBridgeManager } from "../../contracts/BridgeContract";
import BridgeHeader from "./components/BridgeHeader";
import BridgeCard from "./components/BridgeCard";
import useWallet from "../../hooks/useWallet";

const Bridge: React.FC = () => {
  const dispatch = useAppDispatch();
  const { account } = useWallet();
  const {
    tokens,
    tokenPairs,
    loading,
    error,
    fromChainId,
    toChainId,
    selectedToken,
    amount,
    isBridging,
    estimate,
    estimateLoading,
    estimateError,
    balance,
    balanceLoading,
    balanceError,
    transactionHash,
    isApproving,
    approvalTxHash,
    needsApproval,
    bridgeTransaction,
    bridgeTransactionLoading,
    bridgeTransactionError,
  } = useAppSelector((state) => state.bridge);

  useEffect(() => {
    dispatch(fetchTokenPairs());
  }, [dispatch]);

  // Debounced function to fetch bridge estimate
  const debouncedFetchEstimate = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (tokenAddress: string, networkId: number, amount: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          dispatch(fetchBridgeEstimate({ tokenAddress, networkId, amount }));
        }, 300);
      };
    })(),
    [dispatch]
  );

  // Helper function to convert amount to wei as string without scientific notation
  const convertToWei = (amount: string, decimals: number): string => {
    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat <= 0) return "0";
    
    // Convert to string to avoid scientific notation
    const amountStr = amountFloat.toString();
    const parts = amountStr.split('.');
    const wholePart = parts[0];
    const decimalPart = parts[1] || '';
    
    // Pad decimal part with zeros if needed
    const paddedDecimalPart = decimalPart.padEnd(decimals, '0').slice(0, decimals);
    
    // Combine whole and decimal parts
    const weiStr = wholePart + paddedDecimalPart;
    
    // Remove leading zeros but keep at least one digit
    return weiStr.replace(/^0+/, '') || '0';
  };

  // Fetch estimate when token, network, or amount changes
  useEffect(() => {
    if (selectedToken && amount && parseFloat(amount) > 0) {
      const amountInWei = convertToWei(amount, selectedToken.decimals);
      debouncedFetchEstimate(selectedToken.address, fromChainId, amountInWei);
    }
  }, [selectedToken, fromChainId, amount, debouncedFetchEstimate]);

  // Fetch balance when token or chain changes
  useEffect(() => {
    if (selectedToken && account) {
      dispatch(fetchBalance({
        tokenAddress: selectedToken.address,
        account: account,
        chainId: fromChainId,
        decimals: selectedToken.decimals
      }));
    }
  }, [selectedToken, fromChainId, account, dispatch]);

  // Check if approval is needed when token or amount changes
  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (selectedToken && amount && parseFloat(amount) > 0 && account) {
        try {
          // Only check for ERC20 tokens (non-native tokens)
          if (selectedToken.address !== "0x0000000000000000000000000000000000000000") {
            const { bridgeManagerAddress } = initializeBridgeManager(fromChainId, selectedToken.address);
            const amountInWei = convertToWei(amount, selectedToken.decimals);
            
            const needsApproval = await checkTokenApproval(
              selectedToken.address,
              bridgeManagerAddress,
              amountInWei,
              fromChainId,
              account
            );
            
            dispatch(setNeedsApproval(needsApproval));
          } else {
            // Native tokens don't need approval
            dispatch(setNeedsApproval(false));
          }
        } catch (error) {
          console.error('Error checking approval status:', error);
          dispatch(setNeedsApproval(false));
        }
      } else {
        dispatch(setNeedsApproval(false));
      }
    };

    checkApprovalStatus();
  }, [selectedToken, amount, account, fromChainId, dispatch]);

  const handleNetworkSwap = () => {
    dispatch(swapChains());
  };

  const handleAmountChange = (value: string) => {
    dispatch(setAmount(value));
  };

  const handleTokenSelect = (token: any) => {
    dispatch(setSelectedToken(token));
  };

  const handleBridge = async () => {
    if (!selectedToken || !amount || parseFloat(amount) <= 0) return;

    if (!account) {
      console.error("No account connected");
      return;
    }
    
    // Clear any previous transaction hash
    dispatch(clearTransactionHash());
    
    dispatch(
      bridgeTokens({
        fromChainId,
        toChainId,
        token: selectedToken,
        amount,
        userAddress: account,
      })
    );
  };

  const getNetworkName = (chainId: number): 'ETH' | 'PLS' => {
    return chainId === 1 ? 'ETH' : 'PLS';
  };

  const getNetworkDisplayName = (chainId: number) => {
    return chainId === 1 ? "Ethereum" : "PulseChain";
  };

  const getCorrespondingToken = (selectedTokenSymbol: string, toChainId: number) => {
    if (!selectedToken || !tokenPairs.length || !selectedTokenSymbol) return "";
    
    const pair = tokenPairs.find(pair => 
      pair.ethereum.symbol === selectedTokenSymbol || 
      pair.pulsechain.symbol === selectedTokenSymbol
    );
    
    if (!pair) {
      return selectedTokenSymbol;
    }
    
    const correspondingToken = toChainId === 1 ? pair.ethereum.symbol : pair.pulsechain.symbol;
    return correspondingToken;
  };

  const correspondingToken = getCorrespondingToken(selectedToken?.symbol || "", toChainId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-[#1a1c2c] via-[#1e2030] to-[#1a1c2c] text-white flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 font-['Red_Hat_Display'] relative overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-4xl mx-auto pt-8 sm:pt-12 lg:pt-16 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-[#2b2e4a] to-[#1e2030] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-[#3a3f5a]/50 backdrop-blur-sm"
          >
            <BridgeHeader />
            
            <div className="mt-6 sm:mt-8">
              <BridgeCard
                fromNetwork={getNetworkName(fromChainId)}
                toNetwork={getNetworkName(toChainId)}
                fromChainId={fromChainId}
                toChainId={toChainId}
                amount={amount}
                selectedToken={selectedToken?.symbol || ""}
                correspondingToken={correspondingToken}
                onNetworkSwap={handleNetworkSwap}
                onAmountChange={handleAmountChange}
                onTokenSelect={handleTokenSelect}
                tokens={tokens}
                loading={loading}
                error={error}
                isBridging={isBridging}
                onBridge={handleBridge}
                estimate={estimate}
                estimateLoading={estimateLoading}
                estimateError={estimateError}
                balance={balance}
                balanceLoading={balanceLoading}
                balanceError={balanceError}
                transactionHash={transactionHash}
                isApproving={isApproving}
                approvalTxHash={approvalTxHash}
                needsApproval={needsApproval}
                bridgeTransaction={bridgeTransaction}
                bridgeTransactionLoading={bridgeTransactionLoading}
                bridgeTransactionError={bridgeTransactionError}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Bridge;
