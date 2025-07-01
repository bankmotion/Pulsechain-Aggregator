import React from "react";
import useWallet from "../hooks/useWallet";

const CustomConnectButton: React.FC = () => {
  const { connectWallet } = useWallet();

  return (
    <button
      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  );
};

export default CustomConnectButton;
