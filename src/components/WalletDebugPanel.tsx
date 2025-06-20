import { useAccount, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';

const WalletDebugPanel = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    console.log('Manual disconnect triggered');
    disconnect();
  };

  if (!isConnected) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-20 right-4 bg-[#2b2e4a] p-4 rounded-lg border border-[#374151] z-50"
    >
      <h3 className="text-sm font-bold mb-2">Wallet Debug</h3>
      <div className="text-xs space-y-1">
        <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
        <p>Connecting: {isConnecting ? 'Yes' : 'No'}</p>
        <p>Disconnected: {isDisconnected ? 'Yes' : 'No'}</p>
        <p>Address: {address?.slice(0, 8)}...{address?.slice(-6)}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDisconnect}
        className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-xs"
      >
        Force Disconnect
      </motion.button>
    </motion.div>
  );
};

export default WalletDebugPanel; 