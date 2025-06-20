import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AppRoutes from "./routes";
import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig, queryClient, QueryClientProvider, rainbowKitTheme, } from "./config/wagmi";
import WalletDebugPanel from "./components/WalletDebugPanel";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          <Provider store={store}>
            <Router>
              <div className="min-h-screen bg-[#0f1123] text-white">
                <AppRoutes />
              </div>
            </Router>
          </Provider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App;
