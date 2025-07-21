import { ethers } from "ethers";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import * as toastify from "react-toastify";
import { SupportTypes, TokenGlobTag, ZeroAddress } from "../../const/swap";
import useWallet from "../../hooks/useWallet";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  approveTokenAction,
  checkTokenAllowance,
  exchangeTrade,
  executeSwapAction,
  getExchangeOrderStatus,
  getExchangeRate,
  getNativeBalance,
  getQuote,
  getTokenBalance,
  getTokenPrice,
  sendTokensToPayinAddressAction,
  setExchangeRate,
  setFromAmount,
  setFromToken,
  setFromTokenBalance,
  setNativeBalance,
  setQuote,
  setToToken,
  setToTokenBalance,
  resetBridgeState,
  clearExchangeRateError,
} from "../../store/swapSlice";
import { isBridgeOrPulse } from "../../utils";
import Header from "../Header";
import QuotePanel from "./QuotePanel";
import SlippagePopup from "./SlippagePopup";
import TokenPopup from "./TokenPopup";
import {
  ApprovalStatus,
  SwapButton,
  SwapCard,
  SwapHeader,
  OrderStatus,
} from "./components";

const { toast } = toastify;

const Swap: React.FC = () => {
  const dispatch = useAppDispatch();
  const { account, switchToNetwork, connectWallet } = useWallet();

  const [isTokenPopupOpen, setIsTokenPopupOpen] = useState(false);
  const [isSlippagePopupOpen, setIsSlippagePopupOpen] = useState(false);
  const [tokenGlobTag, setTokenGlobTag] = useState<TokenGlobTag>(
    TokenGlobTag.All
  );
  const [selectType, setSelectType] = useState<"from" | "to" | null>(null);
  const [searchChain, setSearchChain] = useState<string>("");
  const [searchToken, setSearchToken] = useState<string>("");
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);

  const {
    fromToken,
    toToken,
    quote,
    fromAmount,
    slippage,
    availableTokens,
    isApproving,
    isSwapping,
    isApproved,
    transactionHash,
    fromTokenBalance,
    toTokenBalance,
    nativeBalance,
    exchangeRate,
    transaction,
    orderType,
    exchangeRateError,
  } = useAppSelector((state) => state.swap);

  const prevIsSwappingRef = useRef(isSwapping);

  const outputAmount = exchangeRate
    ? exchangeRate.toAmount || 0
    : quote?.outputAmount && toToken?.decimals
    ? Number(ethers.formatUnits(quote.outputAmount, toToken.decimals))
    : 0;

  // Check if user has sufficient balance
  const hasSufficientBalance = () => {
    if (!fromToken || !fromAmount) return false;

    const requiredAmount = parseFloat(fromAmount);
    const currentBalance =
      fromToken.address === ZeroAddress
        ? parseFloat(nativeBalance)
        : parseFloat(fromTokenBalance);

    return currentBalance >= requiredAmount;
  };

  // Reset bridge state when tokens or amounts change
  const resetBridgeStateIfNeeded = () => {
    if (
      fromToken &&
      toToken &&
      isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge
    ) {
      dispatch(resetBridgeState());
    }
  };

  // Reset form after successful bridge exchange
  const resetFormAfterBridgeExchange = () => {
    dispatch(setFromToken(null));
    dispatch(setToToken(null));
    dispatch(setFromAmount(""));
    dispatch(resetBridgeState());
  };

  // Reset form after successful regular swap
  const resetFormAfterSwap = () => {
    dispatch(setFromToken(null));
    dispatch(setToToken(null));
    dispatch(setFromAmount(""));
    dispatch(setQuote(null));
  };

  // Reset entire form state
  const resetEntireForm = () => {
    dispatch(setFromToken(null));
    dispatch(setToToken(null));
    dispatch(setFromAmount(""));
    dispatch(setQuote(null));
    dispatch(resetBridgeState());
  };

  const handleExchangeTokenPlace = () => {
    if (fromToken && toToken) {
      // Store the tokens we're swapping to
      const newFromToken = { ...toToken };
      const newToToken = { ...fromToken };

      // Clear any existing exchange rate/quote first
      dispatch(resetBridgeState());
      dispatch(setQuote(null));

      // Update tokens
      dispatch(setFromToken(newFromToken));
      dispatch(setToToken(newToToken));
    }
  };

  const handleSwap = async () => {
    if (!account) {
      connectWallet();
      return;
    }
    // Check if it's a bridge exchange
    const isBridgeExchange =
      exchangeRate &&
      fromToken &&
      toToken &&
      isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge;

    // For bridge exchanges, we need exchange rate data; for regular swaps, we need quote calldata
    if (
      !fromToken ||
      !toToken ||
      (!isBridgeExchange && !quote?.calldata) ||
      (isBridgeExchange && !exchangeRate)
    ) {
      return;
    }

    try {
      // Check balance before proceeding
      if (!hasSufficientBalance()) {
        toast.error("Insufficient balance");
        return;
      }

      if (isBridgeExchange) {
        // Handle bridge exchange
        try {
          const result = await dispatch(
            exchangeTrade({
              fromCurrency: fromToken.symbol.toLowerCase(),
              toCurrency: toToken.symbol.toLowerCase(),
              fromNetwork:
                fromToken.blockchainNetwork === "ethereum" ? "eth" : "pulse",
              toNetwork:
                toToken.blockchainNetwork === "ethereum" ? "eth" : "pulse",
              fromAmount: Number(fromAmount),
              userAddress: account || "",
              refundAddress: account || "",
            })
          ).unwrap();

          const { payinAddress, transactionId } = result;

          const result2 = await dispatch(
            sendTokensToPayinAddressAction({
              payinAddress: payinAddress,
              amount: fromAmount,
              tokenAddress: fromToken.address,
              account: account || "",
              decimals: fromToken.decimals,
            })
          )
            .unwrap()
            .then(() => {
              // resetFormAfterBridgeExchange();
            });
        } catch (error) {
          console.error("Bridge exchange error:", error);
          toast.error("Bridge exchange failed. Please try again.");
        }
      } else {
        // Handle regular swap
        // Check if token is native (PLS) or needs approval
        if (fromToken.address !== ZeroAddress && !isApproved) {
          // Non-native token - handle approval
          toast.info("Approving token...");
          await dispatch(
            approveTokenAction({
              tokenAddress: fromToken.address,
              amount: fromAmount,
              decimals: fromToken.decimals,
              account: account || "",
            })
          )
            .unwrap()
            .then(() => {
              toast.success("Token approved successfully!");
              dispatch(
                checkTokenAllowance({
                  tokenAddress: fromToken.address,
                  amount: fromAmount,
                  decimals: fromToken.decimals,
                  userAddress: account || "",
                })
              );
            });
        } else {
          // Execute swap
          toast.info("Executing swap...");

          // For native tokens, convert amount to wei; for ERC20 tokens, use "0"
          const value =
            fromToken.address === ZeroAddress
              ? ethers
                  .parseUnits(fromAmount.toString(), fromToken.decimals)
                  .toString()
              : "0";

          if (quote) {
            await dispatch(
              executeSwapAction({
                quote: quote,
                value: value,
                account: account || "",
                fromToken: fromToken,
              })
            ).unwrap();
          }
          toast.success("Swap executed successfully!");
          resetFormAfterSwap();
        }
      }
    } catch (error) {
      console.error("Swap error:", error);
      toast.error("Transaction failed. Please try again.");
    }
  };

  // Initialize chains
  useEffect(() => {
    if (account) {
      // Get native balance for the current network (default to PulseChain)
      const currentNetwork = fromToken?.blockchainNetwork || "pulsechain";
      dispatch(
        getNativeBalance({
          userAddress: account,
          blockchainNetwork: currentNetwork,
        })
      );
    } else {
      dispatch(setNativeBalance("0"));
    }
  }, [dispatch, account, fromToken?.blockchainNetwork]);

  // Auto-switch network based on fromToken
  useEffect(() => {
    if (fromToken && account) {
      const blockchainNetwork = fromToken.blockchainNetwork;
      if (blockchainNetwork) {
        const networkName =
          blockchainNetwork === "ethereum" ? "Ethereum" : "PulseChain";

        // Set network switching state to true
        setIsNetworkSwitching(true);

        switchToNetwork(blockchainNetwork);

        if (fromToken?.address) {
          dispatch(setFromTokenBalance("0"));
          dispatch(
            getTokenBalance({
              tokenAddress: fromToken.address,
              userAddress: account,
              decimals: fromToken.decimals,
              blockchainNetwork: fromToken.blockchainNetwork,
            })
          ).then((result) => {
            if (result.payload) {
              dispatch(setFromTokenBalance(result.payload as string));
              setIsNetworkSwitching(false);
            }
          });
        }

        // Refresh native balance for the new network
        dispatch(
          getNativeBalance({ userAddress: account, blockchainNetwork })
        ).then(() => {});
      }
    }
  }, [fromToken, account, switchToNetwork, dispatch]);

  // Get token balances when tokens change
  useEffect(() => {
    if (fromToken?.address && account) {
      dispatch(
        getTokenBalance({
          tokenAddress: fromToken.address,
          userAddress: account,
          decimals: fromToken.decimals,
          blockchainNetwork: fromToken.blockchainNetwork,
        })
      ).then((result) => {
        if (result.payload) {
          dispatch(setFromTokenBalance(result.payload as string));
        }
      });
    } else {
      dispatch(setFromTokenBalance("0"));
    }
  }, [
    dispatch,
    fromToken?.address,
    fromToken?.decimals,
    fromToken?.blockchainNetwork,
    account,
  ]);

  useEffect(() => {
    if (toToken?.address && account) {
      dispatch(
        getTokenBalance({
          tokenAddress: toToken.address,
          userAddress: account,
          decimals: toToken.decimals,
          blockchainNetwork: toToken.blockchainNetwork,
        })
      ).then((result) => {
        if (result.payload) {
          dispatch(setToTokenBalance(result.payload as string));
        }
      });
    } else {
      dispatch(setToTokenBalance("0"));
    }
  }, [
    dispatch,
    toToken?.address,
    toToken?.decimals,
    toToken?.blockchainNetwork,
    account,
  ]);

  // Get token prices
  useEffect(() => {
    if (fromToken?.address && fromToken?.blockchainNetwork) {
      dispatch(
        getTokenPrice({
          address: fromToken.address,
          blockchainNetwork: fromToken.blockchainNetwork,
          type: "from",
        })
      );
      dispatch(setQuote(null));
    }
  }, [dispatch, fromToken?.address, fromToken?.blockchainNetwork]);

  useEffect(() => {
    if (toToken?.address && toToken?.blockchainNetwork) {
      dispatch(
        getTokenPrice({
          address: toToken.address,
          blockchainNetwork: toToken.blockchainNetwork,
          type: "to",
        })
      );
      dispatch(setQuote(null));
    }
  }, [dispatch, toToken?.address, toToken?.blockchainNetwork]);

  // Quote fetching logic
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!fromToken || !toToken || !fromAmount) return;

    if (isBridgeOrPulse(fromToken, toToken) === SupportTypes.NotSupported) {
      return;
    }

    if (fromToken?.address && toToken?.address && fromAmount) {
      dispatch(setQuote(null));
      dispatch(setExchangeRate(null));

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      timeoutRef.current = setTimeout(() => {
        if (
          isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge &&
          !transaction?.transactionId
        ) {
          dispatch(
            getExchangeRate({
              fromCurrency: fromToken.symbol.toLowerCase(),
              toCurrency: toToken.symbol.toLowerCase(),
              fromNetwork:
                fromToken.blockchainNetwork === "ethereum" ? "eth" : "pulse",
              toNetwork:
                toToken.blockchainNetwork === "ethereum" ? "eth" : "pulse",
              amount: Number(fromAmount),
            })
          );
        } else if (
          isBridgeOrPulse(fromToken, toToken) === SupportTypes.PulseChain
        ) {
          dispatch(
            getQuote({
              tokenInAddress:
                fromToken.address.toLowerCase() === ZeroAddress
                  ? "PLS"
                  : fromToken.address,
              tokenOutAddress:
                toToken.address.toLowerCase() === ZeroAddress
                  ? "PLS"
                  : toToken.address,
              amount: Number(fromAmount),
              allowedSlippage: slippage,
              fromDecimal: fromToken.decimals,
            })
          );
        }

        intervalRef.current = setInterval(() => {
          if (
            isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge &&
            !transaction?.transactionId
          ) {
            dispatch(
              getExchangeRate({
                fromCurrency: fromToken.symbol.toLowerCase(),
                toCurrency: toToken.symbol.toLowerCase(),
                fromNetwork:
                  fromToken.blockchainNetwork === "ethereum" ? "eth" : "pulse",
                toNetwork:
                  toToken.blockchainNetwork === "ethereum" ? "eth" : "pulse",
                amount: Number(fromAmount),
              })
            );
          } else if (
            isBridgeOrPulse(fromToken, toToken) === SupportTypes.PulseChain
          ) {
            dispatch(
              getQuote({
                tokenInAddress:
                  fromToken.address.toLowerCase() === ZeroAddress
                    ? "PLS"
                    : fromToken.address,
                tokenOutAddress:
                  toToken.address.toLowerCase() === ZeroAddress
                    ? "PLS"
                    : toToken.address,
                amount: Number(fromAmount),
                allowedSlippage: 0.5,
                fromDecimal: fromToken.decimals,
              })
            );
          }
        }, 10000);
      }, 1000);
    } else {
      dispatch(setQuote(null));
      dispatch(setExchangeRate(null));
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    dispatch,
    fromToken?.address,
    toToken?.address,
    fromToken?.symbol,
    toToken?.symbol,
    fromToken?.blockchainNetwork,
    toToken?.blockchainNetwork,
    fromAmount,
    fromToken?.decimals,
    slippage,
  ]);

  useEffect(() => {
    if (fromToken?.address && fromAmount && fromToken?.decimals && account) {
      dispatch(
        checkTokenAllowance({
          tokenAddress: fromToken?.address || "",
          amount: fromAmount,
          decimals: fromToken?.decimals || 0,
          userAddress: account || "",
        })
      );
    }
  }, [dispatch, fromToken?.address, fromAmount, fromToken?.decimals, account]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (transaction && transaction.transactionId) {
        dispatch(getExchangeOrderStatus(transaction.transactionId));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch, transaction]);

  // Clear exchange rate error when tokens or amounts change
  useEffect(() => {
    if (exchangeRateError) {
      dispatch(clearExchangeRateError());
    }
  }, [fromToken?.symbol, toToken?.symbol, fromAmount, dispatch]);

  // Reset bridge state when fromAmount changes in bridge mode
  useEffect(() => {
    if (
      fromToken &&
      toToken &&
      isBridgeOrPulse(fromToken, toToken) === SupportTypes.Bridge
    ) {
      dispatch(resetBridgeState());
    }
  }, [fromAmount, fromToken, toToken, dispatch]);

  // Reset entire form when swap is completed
  useEffect(() => {
    if (
      prevIsSwappingRef.current &&
      !isSwapping &&
      fromToken &&
      toToken &&
      isBridgeOrPulse(fromToken, toToken) === SupportTypes.PulseChain
    ) {
      // Swap was completed (changed from true to false)
      resetEntireForm();
    }

    prevIsSwappingRef.current = isSwapping;
  }, [isSwapping]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#1a1c2c] text-white flex flex-col items-center justify-start px-2 sm:px-4 font-['Red_Hat_Display']"
    >
      <Header />

      <motion.div className="w-full max-w-md pb-10 sm:pb-0 flex flex-col min-w-[320px] sm:min-w-[600px] mt-4 sm:mt-10 overflow-y-auto">
        <div className="flex flex-col bg-[#2b2e4a] rounded-2xl p-3 sm:p-6 w-full">
          <SwapHeader
            slippage={slippage}
            onSlippageClick={() => setIsSlippagePopupOpen(true)}
          />

          <SwapCard
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            outputAmount={outputAmount}
            onFromTokenSelect={() => {
              setIsTokenPopupOpen(true);
              setSelectType("from");
            }}
            onToTokenSelect={() => {
              setIsTokenPopupOpen(true);
              setSelectType("to");
            }}
            onFromAmountChange={(value) => dispatch(setFromAmount(value))}
            onTokenSwap={handleExchangeTokenPlace}
            isLoadingQuote={
              !quote && !exchangeRate && fromToken && toToken && fromAmount
                ? true
                : false
            }
            fromTokenBalance={fromTokenBalance}
            toTokenBalance={toTokenBalance}
            nativeBalance={nativeBalance}
            exchangeRate={exchangeRate}
            isNetworkSwitching={isNetworkSwitching}
            exchangeRateError={exchangeRateError}
          />

          {(quote || exchangeRate) && fromToken && toToken && fromAmount && (
            <QuotePanel exchangeRate={exchangeRate} />
          )}

          {orderType && (
            <OrderStatus
              orderType={orderType}
              fromToken={fromToken}
              toToken={toToken}
            />
          )}

          <ApprovalStatus
            fromToken={fromToken}
            fromAmount={fromAmount}
            isApproved={isApproved}
            isApproving={isApproving}
          />

          <SwapButton
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            outputAmount={outputAmount}
            quote={quote}
            onSwap={handleSwap}
            hasSufficientBalance={hasSufficientBalance()}
            exchangeRate={exchangeRate}
          />
        </div>
      </motion.div>

      <TokenPopup
        isOpen={isTokenPopupOpen}
        onClose={() => setIsTokenPopupOpen(false)}
        tokenGlobTag={tokenGlobTag}
        setTokenGlobTag={setTokenGlobTag}
        selectType={selectType}
        searchChain={searchChain}
        setSearchChain={setSearchChain}
        searchToken={searchToken}
        setSearchToken={setSearchToken}
        availableTokens={availableTokens.filter(
          (token) =>
            token.symbol.toLowerCase().includes(searchToken.toLowerCase()) ||
            token.address.toLowerCase().includes(searchToken.toLowerCase())
        )}
      />

      <SlippagePopup
        isOpen={isSlippagePopupOpen}
        onClose={() => setIsSlippagePopupOpen(false)}
      />
    </motion.div>
  );
};

export default Swap;
