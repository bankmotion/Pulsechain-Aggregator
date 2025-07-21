import { AnimatePresence, motion } from "framer-motion";
import { Chains, ChainSymbol, TokenGlobTag } from "../../const/swap";
import { TokenType } from "../../types/Swap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  getAvailableTokensFromChain,
  getCurrencies,
  setFromToken,
  setToToken,
} from "../../store/swapSlice";
import { useEffect, useState } from "react";

interface TokenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenGlobTag: TokenGlobTag;
  setTokenGlobTag: (tag: TokenGlobTag) => void;
  selectType: "from" | "to" | null;
  searchChain: string;
  setSearchChain: (searchChain: string) => void;
  searchToken: string;
  setSearchToken: (searchToken: string) => void;
  availableTokens: TokenType[];
}

const TokenPopup = ({
  isOpen,
  onClose,
  tokenGlobTag,
  setTokenGlobTag,
  selectType,
  searchChain,
  setSearchChain,
  searchToken,
  setSearchToken,
  availableTokens,
}: TokenPopupProps) => {
  const [chain, setChain] = useState<ChainSymbol | null>(null);
  const [isChainLoading, setIsChainLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { fromToken, toToken } = useAppSelector((state) => state.swap);

  const handleSetToken = (token: TokenType) => {
    if (selectType === "from") {
      dispatch(setFromToken(token));
    } else {
      dispatch(setToToken(token));
    }
  };

  // Set initial chain based on current token when popup opens
  useEffect(() => {
    if (isOpen && selectType) {
      const currentToken = selectType === "from" ? fromToken : toToken;
      
      if (currentToken) {
        const blockchainNetwork = currentToken.blockchainNetwork;
        if (blockchainNetwork === "ethereum") {
          setChain(ChainSymbol.ETH);
        } else if (blockchainNetwork === "pulsechain") {
          setChain(ChainSymbol.PLS);
        }
      } else {
        // Set ETH as default when no token is selected
        if (selectType === "from") {
          setChain(ChainSymbol.ETH);
        } else {
          setChain(ChainSymbol.PLS);
        }
      }
    }
  }, [isOpen, selectType, fromToken, toToken]);

  const handleChainChange = async (newChain: ChainSymbol) => {
    if (chain === newChain) return;
    
    setIsChainLoading(true);
    setChain(newChain);
    
    try {
      if (newChain === ChainSymbol.ETH) {
        await dispatch(getCurrencies());
      } else if (newChain === ChainSymbol.PLS) {
        await dispatch(getAvailableTokensFromChain("pulsechain"));
      }
    } catch (error) {
      console.error("Error loading tokens for chain:", error);
    } finally {
      setIsChainLoading(false);
    }
  };

  useEffect(() => {
    if (chain === ChainSymbol.ETH) {
      dispatch(getCurrencies());
    } else if (chain === ChainSymbol.PLS) {
      dispatch(getAvailableTokensFromChain("pulsechain"));
    }
  }, [chain, dispatch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1c2e] rounded-xl w-full max-w-2xl shadow-2xl border border-gray-800 max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-800">
              <h2 className="text-base sm:text-lg font-semibold text-white">
                Select Token {selectType && `(${selectType})`}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
                {Object.values(TokenGlobTag).map((tag, index) => (
                  <button
                    key={index}
                    className={`px-3 sm:px-4 py-1.5 rounded-full whitespace-nowrap text-xs sm:text-sm transition-all duration-200 ease-in-out hover:scale-105 ${
                      tokenGlobTag === tag
                        ? "bg-green-500 text-black font-medium shadow-lg shadow-green-500/20"
                        : "bg-[#2b2e4a] text-white hover:bg-[#3a3f63]"
                    }`}
                    onClick={() => setTokenGlobTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                {/* Chains Panel */}
                <div className="w-full sm:w-[200px]">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search chains"
                      className="w-full bg-[#2b2e4a] text-white px-3 py-2 rounded-lg pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      value={searchChain}
                      onChange={(e) => setSearchChain(e.target.value)}
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1 max-h-[200px] sm:max-h-[310px] overflow-y-auto custom-scrollbar pr-2">
                    <div className="flex items-center justify-center text-xs sm:text-sm text-gray-400">
                      All Chains
                    </div>
                    <hr className="border-gray-800" />
                    {Chains.map((tempChain, index) => (
                      <button
                        key={index}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-200 flex items-center ${
                          chain === tempChain.symbol
                            ? "bg-[#3a3f5a] text-white font-medium"
                            : "text-gray-300 hover:bg-[#2b2e4a] hover:text-white"
                        }`}
                        onClick={() => handleChainChange(tempChain.symbol)}
                        disabled={isChainLoading}
                      >
                        <img
                          src={tempChain.img}
                          alt={tempChain.symbol}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mr-2"
                        />
                        <span className="truncate">{tempChain.name}</span>
                        {isChainLoading && chain === tempChain.symbol && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="ml-auto"
                          >
                            ⏳
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tokens Panel */}
                <div className="flex-1">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search tokens"
                      value={searchToken}
                      onChange={(e) => setSearchToken(e.target.value)}
                      className="w-full bg-[#2b2e4a] text-white px-3 py-2 rounded-lg pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <div className="space-y-1.5 max-h-[200px] sm:max-h-[320px] overflow-y-auto custom-scrollbar">
                    {isChainLoading ? (
                      // Loading skeleton
                      Array.from({ length: 8 }).map((_, index) => (
                        <motion.div
                          key={index}
                          className="w-full h-12 bg-[#2b2e4a] rounded-lg animate-pulse"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        />
                      ))
                    ) : availableTokens.length > 0 ? (
                      availableTokens.map((token: TokenType, index: number) => (
                        <motion.button
                          key={index}
                          className="w-full flex items-center space-x-3 py-2 px-3 sm:px-4 rounded-lg bg-[#2b2e4a] hover:bg-[#3a3f5a] transition-all duration-200"
                          onClick={() => {
                            handleSetToken(token);
                            onClose();
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="text-xl rounded-full flex-shrink-0">
                            <img
                              src={token.image}
                              alt={token.symbol}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                            />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-white text-xs sm:text-sm truncate">
                              {token.symbol}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {token.name}
                            </div>
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      Array.from({ length: 10 }).map((_, index) => (
                        <div
                          key={index}
                          className="w-full h-8 sm:h-10 bg-[#2b2e4a] rounded-lg"
                        ></div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TokenPopup;
