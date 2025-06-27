import { useAccount, useDisconnect } from 'wagmi';

export const useWalletDebug = () => {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    console.log('Disconnecting wallet...');
    disconnect();
  };

  const debugInfo = {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
  };

  console.log('Wallet Debug Info:', debugInfo);

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    handleDisconnect,
    debugInfo,
  };
}; 