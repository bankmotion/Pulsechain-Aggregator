import { motion } from "framer-motion";
import CustomConnectButton from "../components/CustomConnectButton";
import useWallet from "../hooks/useWallet";

const Header = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full h-20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg cursor-pointer flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">R</span>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent"></span>
              <span className="text-xs text-slate-400 -mt-1">Aggregator</span>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#374151" }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-800/60 hover:bg-slate-700/80 px-4 py-2.5 rounded-lg text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 shadow-sm"
            >
              <span className="text-lg">☰</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#374151" }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-800/60 hover:bg-slate-700/80 px-5 py-2.5 rounded-lg text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 shadow-sm font-medium"
            >
              Swaps
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#374151" }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-800/60 hover:bg-slate-700/80 px-5 py-2.5 rounded-lg text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-slate-600/50 shadow-sm font-medium"
            >
              Testnets
            </motion.button>
          </div>
        </div>

        {/* Right Section - Actions and Wallet */}
        <div className="flex items-center space-x-4">
          {/* Action Icons */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 cursor-pointer shadow-md border border-slate-600/50 flex items-center justify-center"
          >
            <span className="text-slate-300 text-sm">⚙️</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 cursor-pointer shadow-md border border-slate-600/50 flex items-center justify-center"
          >
            <span className="text-slate-300 text-sm">🔔</span>
          </motion.div>

          {/* Wallet Connection */}
          {account ? (
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#374151" }}
              whileTap={{ scale: 0.98 }}
              onClick={disconnectWallet}
              className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 px-5 py-2.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500/50 shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 font-medium">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
                <span className="text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                  ↓
                </span>
              </div>
            </motion.button>
          ) : (
            <CustomConnectButton />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Header;
