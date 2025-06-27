import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { useWalletDebug } from "../hooks/useWalletDebug";

const CustomConnectButton = () => {
  const { isConnected, handleDisconnect } = useWalletDebug();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ConnectButton
        chainStatus="icon"
        showBalance={false}
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
        label="Connect Wallet"
      />
    </motion.div>
  );
};

export default CustomConnectButton; 