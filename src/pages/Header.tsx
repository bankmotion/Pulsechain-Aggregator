import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import CustomConnectButton from "../components/CustomConnectButton";
import useWallet from "../hooks/useWallet";

const Header = () => {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();

  const isActive = (path: string) => {
    return (
      location.pathname === path ||
      (path === "/swap" && location.pathname === "/")
    );
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-full h-16 sm:h-20 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-4 sm:space-x-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 rounded-2xl shadow-lg flex items-center justify-center group-hover:shadow-emerald-500/25 transition-all duration-300">
                <span className="text-white font-bold text-lg sm:text-xl">
                  P
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
                PulseChain
              </span>
              <span className="text-xs text-slate-400 -mt-1 font-medium">
                Aggregator
              </span>
            </div>
          </Link>

          {/* Navigation Buttons - Hidden on mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link to="/swap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                  isActive("/swap")
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">💱</span>
                  <span>Swaps</span>
                </span>
                {isActive("/swap") && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            </Link>
            <Link to="/bridge">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm ${
                  isActive("/bridge")
                    ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : "bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">🌉</span>
                  <span>Bridge</span>
                </span>
                {isActive("/bridge") && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Right Section - Actions and Wallet */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Wallet Connection */}
          {account ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={disconnectWallet}
              className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 px-4 sm:px-6 py-2.5 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-emerald-500/10 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <span className="text-emerald-400 font-semibold text-sm sm:text-base">
                  {account.slice(0, 4)}...{account.slice(-4)}
                </span>
                <span className="hidden sm:inline text-emerald-400/70 group-hover:text-emerald-400 transition-colors text-lg">
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
