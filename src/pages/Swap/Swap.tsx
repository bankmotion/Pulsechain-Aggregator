import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { TokenGlobTag, ZeroAddress } from "../../const/swap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getAllChains,
  getAvailableTokensFromChain,
  getQuote,
  getTokenPrice,
  setFromAmount,
  setFromToken,
  setQuote,
  setToToken,
} from "../../store/swapSlice";
import { TokenType } from "../../types/Swap";
import Footer from "../Footer";
import Header from "../Header";
import TokenPopup from "./TokenPopup";
import QuotePanel from "./QuotePanel";
import SlippagePopup from "./SlippagePopup";
import { ethers } from "ethers";

const Swap: React.FC = () => {
  const dispatch = useAppDispatch();

  const [isTokenPopupOpen, setIsTokenPopupOpen] = useState(false);
  const [isSlippagePopupOpen, setIsSlippagePopupOpen] = useState(false);
  const [tokenGlobTag, setTokenGlobTag] = useState<TokenGlobTag>(
    TokenGlobTag.All
  );
  const [chain, setChain] = useState<TokenType | null>(null);
  const [selectType, setSelectType] = useState<"from" | "to" | null>(null);
  const [searchChain, setSearchChain] = useState<string>("");
  const [searchToken, setSearchToken] = useState<string>("");

  const {
    allChains,
    fromToken,
    toToken,
    quote,
    fromAmount,
    slippage,
    availableTokens,
  } = useAppSelector((state) => state.swap);

  const outputAmount =
    quote?.outputAmount && toToken?.decimals
      ? Number(ethers.formatUnits(quote.outputAmount, toToken.decimals))
      : 0;

  const handleExchangeTokenPlace = () => {
    if (fromToken && toToken) {
      dispatch(setFromToken({ ...toToken }));
      dispatch(setToToken({ ...fromToken }));
    }
  };

  useEffect(() => {
    dispatch(getAllChains());
  }, [dispatch]);

  useEffect(() => {
    if (chain) {
      dispatch(getAvailableTokensFromChain(chain));
    }
  }, [dispatch, chain]);

  useEffect(() => {
    if (allChains && allChains.length > 0 && !chain) {
      setChain({ ...allChains[0] });
    }
  }, [allChains, dispatch, chain]);

  useEffect(() => {
    if (fromToken?.address && fromToken?.blockchainNetwork) {
      dispatch(
        getTokenPrice({
          address: fromToken.address,
          blockchainNetwork: fromToken.blockchainNetwork,
          type: "from",
        })
      );
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
    }
  }, [dispatch, toToken?.address, toToken?.blockchainNetwork]);

  // Add refs to track timeout and interval IDs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log(fromToken, toToken, fromAmount);

    if (
      fromToken?.blockchainNetwork !== "pulsechain" ||
      toToken?.blockchainNetwork !== "pulsechain"
    ) {
      return;
    }

    if (fromToken?.address && toToken?.address && fromAmount) {
      dispatch(setQuote(null));
      // Clear any existing timeout and interval
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // First call after 3 seconds
      timeoutRef.current = setTimeout(() => {
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

        // Set up interval for subsequent calls every 10 seconds
        intervalRef.current = setInterval(() => {
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
        }, 10000);
      }, 3000);
    } else {
      dispatch(setQuote(null));
    }

    // Cleanup function
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
    fromAmount,
    fromToken?.decimals,
    slippage,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#1a1c2c] text-white flex flex-col items-center justify-start px-4 font-['Red_Hat_Display']"
    >
      {/* Header */}
      <Header />

      {/* Swap Box */}
      <motion.div className="w-full max-w-md h-[calc(100vh-200px)] flex flex-col min-w-[600px]">
        <div className="flex flex-col bg-[#2b2e4a] rounded-2xl p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-xl">Swap</h3>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full">
                {slippage}% slippage
              </div>
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <Cog6ToothIcon
                  className="h-5 w-5 text-gray-400 cursor-pointer"
                  onClick={() => setIsSlippagePopupOpen(true)}
                />
              </motion.div>
            </div>
          </div>

          <motion.div className="bg-[#1e2030] rounded-xl p-4 flex-grow relative gap-2 flex flex-col">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#3a3f5a" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsTokenPopupOpen(true);
                  setSelectType("from");
                }}
                className="bg-[#2b2e4a] text-white px-4 h-[60px] rounded-l-[30px] rounded-r-[50px] min-w-[200px] font-medium flex gap-2 items-center justify-start"
              >
                {fromToken ? (
                  <>
                    <div className="flex items-center justify-center min-w-[40px]">
                      <div className="w-24 rounded-full relative">
                        <div className="w-[64px] h-[42px] rounded-xl  absolute left-0 top-0 translate-y-[-50%] flex justify-start pl-2 items-center bg-[#627eea]">
                          <img
                            src={
                              allChains.find(
                                (tempChain) =>
                                  tempChain.blockchainNetwork ===
                                  fromToken?.blockchainNetwork
                              )?.image
                            }
                            alt={`${fromToken?.network}`}
                            className="w-6 h-6 object-cover rounded-full"
                          />
                        </div>
                        <div className="rounded-full overflow-hidden absolute right-0 top-0 border-[10px] border-[#2b2e4a] translate-y-[-50%] bg-[#2b2e4a]">
                          <img
                            src={fromToken?.image}
                            alt={fromToken?.symbol}
                            className="w-10 h-10 "
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start max-w-[100px]">
                      <span className="text-xs font-medium truncate text-gray-400">
                        {`${fromToken?.network}`}
                      </span>
                      <span className="text-lg font-medium truncate w-[100px] text-left">
                        {fromToken.symbol}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">Select Token</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                )}
              </motion.button>
              <motion.div className="flex flex-col items-end justify-center gap-2">
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  placeholder="Enter an Amount"
                  value={
                    fromAmount
                      ? fromAmount.includes(".")
                        ? fromAmount
                            .split(".")[0]
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                          "." +
                          fromAmount.split(".")[1]
                        : Number(fromAmount).toLocaleString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, "");
                    // Only allow one decimal point
                    const parts = value.split(".");
                    if (parts.length > 2) {
                      dispatch(
                        setFromAmount(parts[0] + "." + parts.slice(1).join(""))
                      );
                    } else {
                      dispatch(setFromAmount(value));
                    }
                  }}
                  className="bg-transparent text-right w-full outline-none text-xl placeholder-gray-400 font-medium"
                />
                <div className="text-sm text-gray-400">
                  {fromToken?.price
                    ? `$${(
                        Number(fromToken?.price) * Number(fromAmount)
                      ).toFixed(3)}`
                    : "0.00$"}
                </div>
              </motion.div>
            </div>

            <div className="relative">
              <hr className="border-[#2b2e4a] my-2" />
              <motion.div
                // whileHover={{ rotate: 180 }}
                onClick={handleExchangeTokenPlace}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hover:translate-y-[-50%] hover:translate-x-[-50%] z-10 cursor-pointer"
              >
                <div className="bg-[#1a1c2c] p-2 rounded-full shadow-lg flex items-center justify-center">
                  <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#3a3f5a" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsTokenPopupOpen(true);
                  setSelectType("to");
                }}
                className="bg-[#2b2e4a] text-white px-4 h-[60px] rounded-l-[30px] rounded-r-[50px] min-w-[200px] font-medium flex gap-2 items-center justify-start"
              >
                {toToken ? (
                  <>
                    <div className="flex items-center justify-center min-w-[40px]">
                      <div className="w-24 rounded-full relative">
                        <div className="w-[64px] h-[42px] rounded-xl  absolute left-0 top-0 translate-y-[-50%] flex justify-start pl-2 items-center bg-[#627eea]">
                          <img
                            src={
                              allChains.find(
                                (tempChain) =>
                                  tempChain.blockchainNetwork ===
                                  toToken?.blockchainNetwork
                              )?.image
                            }
                            alt={`${toToken?.network}`}
                            className="w-6 h-6 object-cover rounded-full"
                          />
                        </div>
                        <div className="rounded-full overflow-hidden absolute right-0 top-0 border-[10px] border-[#2b2e4a] translate-y-[-50%] bg-[#2b2e4a]">
                          <img
                            src={toToken?.image}
                            alt={toToken?.symbol}
                            className="w-10 h-10 "
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start max-w-[100px]">
                      <span className="text-xs font-medium truncate text-gray-400">
                        {`${toToken?.network}`}
                      </span>
                      <span className="text-lg font-medium truncate w-[100px] text-left">
                        {toToken.symbol}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">Select Token</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </div>
                )}
              </motion.button>
              <motion.div className="bg-transparent text-right w-1/2 outline-none text-xl placeholder-gray-400 font-medium flex flex-col items-end justify-center gap-2">
                <div className="text-lg font-medium">
                  {outputAmount ? (
                    outputAmount
                      .toString()
                      .split(".")[0]
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
                    "." +
                    outputAmount.toString().split(".")[1]
                  ) : fromToken && toToken && fromAmount ? (
                    <div className="flex items-center justify-end">
                      <div className="w-28 h-6 bg-gray-600 rounded-full animate-pulse opacity-30"></div>
                    </div>
                  ) : (
                    "0.00"
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {outputAmount && toToken?.price ? (
                    `$${(Number(toToken?.price) * Number(outputAmount)).toFixed(
                      3
                    )}`
                  ) : toToken && fromAmount && fromAmount ? (
                    <div className="w-16 h-6 bg-gray-600 rounded-full animate-pulse opacity-30"></div>
                  ) : (
                    "0.00$"
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {quote && <QuotePanel />}

          <div className="flex items-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#22c55e" }}
              whileTap={{ scale: 0.95 }}
              disabled={
                !fromToken ||
                !toToken ||
                fromToken.blockchainNetwork !== "pulsechain" ||
                toToken.blockchainNetwork !== "pulsechain" ||
                Number(fromAmount) <= 0 ||
                Number(outputAmount) <= 0
              }
              className="flex-1 bg-green-500 text-black px-4 py-3 rounded-[20px] min-w-[200px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fromToken &&
              toToken &&
              (fromToken.blockchainNetwork !== "pulsechain" ||
                toToken.blockchainNetwork !== "pulsechain")
                ? "Only Pulsechain is supported"
                : fromToken && toToken && Number(fromAmount) > 0
                ? "Swap"
                : fromToken && toToken
                ? "Enter an Amount"
                : "Select Tokens"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <TokenPopup
        isOpen={isTokenPopupOpen}
        onClose={() => setIsTokenPopupOpen(false)}
        tokenGlobTag={tokenGlobTag}
        setTokenGlobTag={setTokenGlobTag}
        chain={chain}
        setChain={setChain}
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

      {/* Footer */}
      <Footer />
    </motion.div>
  );
};

export default Swap;
