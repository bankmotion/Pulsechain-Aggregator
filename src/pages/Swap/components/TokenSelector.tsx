import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import React from "react";
import { TokenType } from "../../../types/Swap";

interface TokenSelectorProps {
  token: TokenType | null;
  allChains: TokenType[];
  type: "from" | "to";
  onSelect: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  token,
  allChains,
  type,
  onSelect,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, backgroundColor: "#3a3f5a" }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className="bg-[#2b2e4a] text-white px-4 h-[60px] rounded-l-[30px] rounded-r-[50px] min-w-[200px] font-medium flex gap-2 items-center justify-start"
    >
      {token ? (
        <>
          <div className="flex items-center justify-center min-w-[40px]">
            <div className="w-24 rounded-full relative">
              <div className="w-[64px] h-[42px] rounded-xl absolute left-0 top-0 translate-y-[-50%] flex justify-start pl-2 items-center bg-[#627eea]">
                <img
                  src={
                    allChains.find(
                      (tempChain) =>
                        tempChain.blockchainNetwork === token?.blockchainNetwork
                    )?.image
                  }
                  alt={`${token?.network}`}
                  className="w-6 h-6 object-cover rounded-full"
                />
              </div>
              <div className="rounded-full overflow-hidden absolute right-0 top-0 border-[10px] border-[#2b2e4a] translate-y-[-50%] bg-[#2b2e4a]">
                <img
                  src={token?.image}
                  alt={token?.symbol}
                  className="w-10 h-10"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start max-w-[100px]">
            <span className="text-xs font-medium truncate text-gray-400">
              {`${token?.network}`}
            </span>
            <span className="text-lg font-medium truncate w-[100px] text-left">
              {token.symbol}
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
  );
};

export default TokenSelector; 