# Wallet Connectivity Setup

This project has been configured with RainbowKit and Wagmi for wallet connectivity. Here's what you need to do to complete the setup:

## 1. Install Dependencies

First, install the required packages:

```bash
npm install @rainbow-me/rainbowkit wagmi viem
```

## 2. Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in to your account
3. Create a new project
4. Copy your Project ID
5. Replace `'YOUR_WALLETCONNECT_PROJECT_ID'` in `src/config/wagmi.ts` with your actual Project ID

## 3. Features Implemented

### ✅ Wallet Configuration
- RainbowKit and Wagmi setup
- Support for multiple chains (Mainnet, Polygon, Arbitrum)
- Custom dark theme matching your app's design
- Auto-connect functionality

### ✅ UI Components
- Custom ConnectButton component with animations
- Integrated into the Header component
- Responsive design with proper styling

### ✅ Theme Customization
- Dark theme matching your app's color scheme
- Green accent color (#4ade80) for consistency
- Custom shadows and border radius

## 4. Usage

The wallet connectivity is now integrated into your app:

- Users can click the "Connect Wallet" button in the header
- Multiple wallet options are available (MetaMask, WalletConnect, etc.)
- Chain switching is supported
- Account information is displayed when connected

## 5. Supported Chains

Currently configured chains:
- Ethereum Mainnet
- Polygon
- Arbitrum

To add Pulsechain or other chains, update the `chains` array in `src/config/wagmi.ts`.

## 6. Customization

You can customize the wallet experience by:

- Modifying the theme in `src/config/rainbowKitTheme.ts`
- Updating the CustomConnectButton component in `src/components/CustomConnectButton.tsx`
- Adding more chains to the configuration
- Customizing the wallet modal appearance

## 7. Next Steps

After completing the setup:

1. Test the wallet connection
2. Add chain-specific functionality
3. Implement transaction handling
4. Add error handling for failed connections
5. Consider adding wallet connection state management to your Redux store 