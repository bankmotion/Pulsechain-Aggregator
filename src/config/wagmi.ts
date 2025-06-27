import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { createConfig } from 'wagmi';
import { mainnet, polygon, arbitrum, pulsechain } from 'wagmi/chains';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rainbowKitTheme } from './rainbowKitTheme';

// Configure chains for the app
const chains = [mainnet, polygon, arbitrum, pulsechain] as const;

// Set up wallet connectors
const { connectors } = getDefaultWallets({
  appName: 'Pulsechain Aggregator',
  projectId: 'c4f79cc821944d9680842e34466bfbd9', // Temporary project ID for development
});

// Create wagmi config
export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

// Create a client
export const queryClient = new QueryClient();

export { chains, RainbowKitProvider, rainbowKitTheme, QueryClientProvider }; 