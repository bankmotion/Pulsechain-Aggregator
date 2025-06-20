import { AnimatePresence, motion } from "framer-motion";
import { TokenGlobTag } from "../../const/swap";
import { TokenType } from "../../types/Swap";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setFromToken, setToToken } from "../../store/swapSlice";

interface TokenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  tokenGlobTag: TokenGlobTag;
  setTokenGlobTag: (tag: TokenGlobTag) => void;
  chain: TokenType | null;
  setChain: (chain: TokenType) => void;
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
  chain,
  setChain,
  selectType,
  searchChain,
  setSearchChain,
  searchToken,
  setSearchToken,
  availableTokens,
}: TokenPopupProps) => {
  const { allChains } = useAppSelector((state) => state.swap);

  const dispatch = useAppDispatch();

  const handleSetToken = (token: TokenType) => {
    console.log(token);
    if (selectType === "from") {
      dispatch(setFromToken(token));
    } else {
      dispatch(setToToken(token));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1c2e] rounded-xl w-full max-w-2xl shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Select Token</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
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

            <div className="p-4">
              <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
                {Object.values(TokenGlobTag).map((tag, index) => (
                  <button
                    key={index}
                    className={`px-4 py-1.5 rounded-full whitespace-nowrap text-sm transition-all duration-200 ease-in-out hover:scale-105 ${
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

              <div className="flex gap-3">
                {/* Chains Panel */}
                <div className="w-[200px]">
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
                  <div className="space-y-1 max-h-[310px] overflow-y-auto custom-scrollbar pr-2">
                    <div className="flex items-center justify-center text-sm text-gray-400">
                      All Chains
                    </div>
                    <hr className="border-gray-800" />
                    {allChains
                      .filter(
                        (tempChain) =>
                          (tempChain.type === "NATIVE_ETH" ||
                            tempChain.type === "NATIVE") &&
                          tempChain.network
                            .toLowerCase()
                            .includes(searchChain.toLowerCase())
                      )
                      .map((tempChain, index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center ${
                            chain?.blockchainNetwork ===
                            tempChain.blockchainNetwork
                              ? "bg-[#3a3f5a] text-white font-medium"
                              : "text-gray-300 hover:bg-[#2b2e4a] hover:text-white"
                          }`}
                          onClick={() => setChain(tempChain)}
                        >
                          <img
                            src={tempChain.image}
                            alt={tempChain.symbol}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          {tempChain.network}
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
                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar">
                    {availableTokens.length > 0
                      ? availableTokens.map((token, index) => (
                          <motion.button
                            key={index}
                            className="w-full flex items-center space-x-3 py-1 px-4 rounded-lg bg-[#2b2e4a] hover:bg-[#3a3f5a] transition-all duration-200"
                            onClick={() => {
                              handleSetToken(token);
                              onClose();
                            }}
                          >
                            <div className="text-xl rounded-full">
                              <img
                                src={token.image}
                                alt={token.symbol}
                                className="w-10 h-10 rounded-full"
                              />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-white text-sm">
                                {token.symbol}
                              </div>
                              <div className="text-xs text-gray-400">
                                {token.name}
                              </div>
                            </div>
                          </motion.button>
                        ))
                      : Array.from({ length: 10 }).map((_, index) => (
                          <div
                            key={index}
                            className="w-full h-10 bg-[#2b2e4a] rounded-lg"
                          ></div>
                        ))}
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
