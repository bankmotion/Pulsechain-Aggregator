import React from "react";
import useWallet from "../hooks/useWallet";

const CustomConnectButton: React.FC = () => {
  const { connectWallet } = useWallet();

  return (
    <div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={connectWallet}
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default CustomConnectButton;
