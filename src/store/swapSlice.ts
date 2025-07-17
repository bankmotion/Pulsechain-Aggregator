import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CurrencyType,
  ExchangeRateType,
  OrderType,
  QuoteType,
  TokenType,
  TransactionType,
} from "../types/Swap";
import { ethers } from "ethers";
import { ZeroAddress, SwapManagerAddress, ChainSymbol } from "../const/swap";
import SwapManagerABI from "../abis/SwapManager.json";
import ERC20ABI from "../abis/ERC20.json";
import {
  approveToken,
  executeSwap,
  getTokenAllowance,
  needsApproval,
  sendToken,
} from "../contracts/SwapManager";
import { config } from "process";
import { PulseChainConfig, EthereumConfig } from "../config/chainConfig";
import { toast } from "react-toastify";

interface SwapState {
  availableTokens: TokenType[];
  fromToken: TokenType | null;
  toToken: TokenType | null;
  fromAmount: string;
  quote: QuoteType | null;
  slippage: number;
  // Balance state
  fromTokenBalance: string;
  toTokenBalance: string;
  nativeBalance: string;
  // Swap execution state
  isApproving: boolean;
  isSwapping: boolean;
  isApproved: boolean;
  // Transaction tracking
  transactionHash: string | null;
  exchangeRate: ExchangeRateType | null;
  transaction: TransactionType | null;
  orderType: OrderType | null;
  // Exchange rate error state
  exchangeRateError: string | null;
}

const initialState: SwapState = {
  availableTokens: [],
  fromToken: null,
  toToken: null,
  fromAmount: "",
  quote: null,
  slippage: 0.5,
  // Balance state
  fromTokenBalance: "0",
  toTokenBalance: "0",
  nativeBalance: "0",
  // Swap execution state
  isApproving: false,
  isSwapping: false,
  isApproved: false,
  // Transaction tracking
  transactionHash: null,
  exchangeRate: null,
  transaction: null,
  orderType: null,
  // Exchange rate error state
  exchangeRateError: null,
};

// Helper function to get provider for specific network
const getProviderForNetwork = (blockchainNetwork: string) => {
  const config =
    blockchainNetwork === "ethereum" ? EthereumConfig : PulseChainConfig;

  // If we have a MetaMask provider, use it (it should be on the correct network)
  if ((window as any).provider) {
    return new ethers.BrowserProvider((window as any).provider);
  }

  // Fallback to public RPC for the specific network
  const rpcUrl = config.providerList[0];
  return new ethers.JsonRpcProvider(rpcUrl);
};

// Get token balance
export const getTokenBalance = createAsyncThunk(
  "swap/getTokenBalance",
  async ({
    tokenAddress,
    userAddress,
    decimals,
    blockchainNetwork,
  }: {
    tokenAddress: string;
    userAddress: string;
    decimals: number;
    blockchainNetwork: string;
  }) => {
    if (!userAddress) return "0";

    try {
      const provider = getProviderForNetwork(blockchainNetwork);

      if (tokenAddress === ZeroAddress) {
        // Get native balance
        const balance = await provider.getBalance(userAddress);
        return ethers.formatEther(balance);
      } else {
        // Get ERC20 token balance
        const contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
        const balance = await contract.balanceOf(userAddress);
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error("Error getting token balance:", error);
      return "0";
    }
  }
);

// Get native balance
export const getNativeBalance = createAsyncThunk(
  "swap/getNativeBalance",
  async ({
    userAddress,
    blockchainNetwork,
  }: {
    userAddress: string;
    blockchainNetwork: string;
  }) => {
    if (!userAddress) return "0";

    try {
      const provider = getProviderForNetwork(blockchainNetwork);
      const balance = await provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting native balance:", error);
      return "0";
    }
  }
);

// Check token allowance
export const checkTokenAllowance = createAsyncThunk(
  "swap/checkAllowance",
  async ({
    tokenAddress,
    amount,
    decimals,
    userAddress,
  }: {
    tokenAddress: string;
    amount: string;
    decimals: number;
    userAddress: string;
  }) => {
    if (tokenAddress === ZeroAddress) {
      return { hasAllowance: true, allowance: "0" };
    }

    const isApproved = await needsApproval(
      tokenAddress,
      userAddress,
      SwapManagerAddress,
      amount,
      decimals
    );

    return {
      hasAllowance: isApproved,
    };
  }
);

// Approve token
export const approveTokenAction = createAsyncThunk(
  "swap/approveTokenAction",
  async ({
    tokenAddress,
    account,
    amount,
    decimals,
  }: {
    tokenAddress: string;
    account: string;
    amount: string;
    decimals: number;
  }) => {
    if (tokenAddress === ZeroAddress) {
      throw new Error("Native token does not require approval");
    }

    const transaction = await approveToken({
      tokenAddress,
      spenderAddress: SwapManagerAddress,
      account,
      amount,
      decimals,
    });

    return {
      transactionHash: transaction.transactionHash,
    };
  }
);

// Execute swap
export const executeSwapAction = createAsyncThunk(
  "swap/executeSwapAction",
  async ({
    quote,
    value,
    account,
    fromToken,
  }: {
    quote: QuoteType;
    value: string;
    account: string;
    fromToken: TokenType;
  }) => {
    const transaction = await executeSwap({
      quote,
      value: value,
      account,
      fromToken,
    });

    return {
      transactionHash: transaction.transactionHash,
    };
  }
);

export const getAllChains = createAsyncThunk("swap/getAllChains", async () => {
  const response = await fetch(
    "https://api.rubic.exchange/api/v2/tokens/allchains"
  );
  const data = await response.json();
  return data || [];
});

export const getAvailableTokensFromChain = createAsyncThunk(
  "swap/getAvailableTokensFromChain",
  async (chain: string) => {
    const response = await fetch(
      `https://api.rubic.exchange/api/v2/tokens/?page=1&pageSize=200&network=${chain}`
    );
    const data = await response.json();
    return data.results || [];
  }
);

export const getTokenPrice = createAsyncThunk(
  "swap/getTokenPrice",
  async ({
    address,
    blockchainNetwork,
    type,
  }: {
    address: string;
    blockchainNetwork: string;
    type: "from" | "to";
  }) => {
    const response = await fetch(
      `https://api.rubic.exchange/api/v2/tokens/price/${blockchainNetwork}/${address}`
    );
    const data = await response.json();
    return data?.usd_price || 0;
  }
);

export const getQuote = createAsyncThunk(
  "swap/getQuote",
  async ({
    tokenInAddress,
    tokenOutAddress,
    amount,
    allowedSlippage,
    fromDecimal,
  }: {
    tokenInAddress: string;
    tokenOutAddress: string;
    amount: number;
    allowedSlippage: number;
    fromDecimal: number;
  }) => {
    const response = await fetch(
      `https://pt-quote-api.vercel.app/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${ethers.parseUnits(
        amount.toString(),
        fromDecimal
      )}&allowedSlippage=${allowedSlippage}&fromDecimal=${fromDecimal}`
    );
    const data = await response.json();
    return data;
  }
);

export const getCurrencies = createAsyncThunk(
  "swap/getCurrencies",
  async () => {
    const response = await fetch(
      "https://pt-quote-api.vercel.app/exchange/currencies"
    );
    const data = await response.json();
    return data.data;
  }
);

export const getExchangeRate = createAsyncThunk(
  "swap/getExchangeRate",
  async ({
    fromCurrency,
    toCurrency,
    fromNetwork,
    toNetwork,
    amount,
  }: {
    fromCurrency: string;
    toCurrency: string;
    fromNetwork: string;
    toNetwork: string;
    amount: number;
  }) => {
    try {
      const response = await fetch(
        `https://pt-quote-api.vercel.app/exchange/rate?fromCurrency=${fromCurrency}&toCurrency=${toCurrency}&fromNetwork=${fromNetwork}&toNetwork=${toNetwork}&amount=${amount}`
      );
      const data = await response.json();
      if (data.success === false) {
        // Return error instead of showing toast
        throw new Error(data.error);
      } else {
        return data.data;
      }
    } catch (err: any) {
      console.log(err);
      throw err;
    }
  }
);

export const exchangeTrade = createAsyncThunk(
  "swap/exchangeTrade",
  async ({
    fromCurrency,
    toCurrency,
    fromNetwork,
    toNetwork,
    fromAmount,
    userAddress,
    refundAddress,
  }: {
    fromCurrency: string;
    toCurrency: string;
    fromNetwork: string;
    toNetwork: string;
    fromAmount: number;
    userAddress: string;
    refundAddress: string;
  }) => {
    // post request
    const requestBody = {
      fromCurrency,
      toCurrency,
      fromNetwork,
      toNetwork,
      fromAmount,
      userAddress,
      refundAddress,
    };

    console.log("Sending exchange trade request:", requestBody);

    const response = await fetch(`https://pt-quote-api.vercel.app/exchange/trade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    console.log("Exchange trade response:", data);
    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success === false) {
      throw new Error(data.error || "Exchange trade failed");
    } else {
      return data.data;
    }
  }
);

export const getExchangeOrderStatus = createAsyncThunk(
  "swap/getExchangeOrderStatus",
  async (orderId: string) => {
    const response = await fetch(
      `https://pt-quote-api.vercel.app/exchange/order/${orderId}`
    );
    const data = await response.json();
    return data.data;
  }
);

export const sendTokensToPayinAddressAction = createAsyncThunk(
  "swap/sendTokensToPayinAddress",
  async ({
    payinAddress,
    amount,
    tokenAddress,
    account,
    decimals,
  }: {
    payinAddress: string;
    amount: string;
    tokenAddress: string;
    account: string;
    decimals: number;
  }) => {
    const result = await sendToken(
      tokenAddress,
      payinAddress,
      amount,
      decimals,
      account
    );
    return result;
  }
);

export const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    setAvailableTokens: (state, action) => {
      state.availableTokens = action.payload;
    },
    setFromToken: (state, action) => {
      state.fromToken = action.payload;
      resetSwapState();
      resetBridgeState();
    },
    setToToken: (state, action) => {
      state.toToken = action.payload;
      resetSwapState();
      resetBridgeState();
    },
    setFromAmount: (state, action) => {
      state.fromAmount = action.payload;
      resetSwapState();
      resetBridgeState();
    },
    setQuote: (state, action) => {
      state.quote = action.payload;
    },
    setExchangeRate: (state, action) => {
      state.exchangeRate = action.payload;
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload;
    },
    // Set balances
    setFromTokenBalance: (state, action) => {
      state.fromTokenBalance = action.payload;
    },
    setToTokenBalance: (state, action) => {
      state.toTokenBalance = action.payload;
    },
    setNativeBalance: (state, action) => {
      state.nativeBalance = action.payload;
    },
    // Set transaction hash
    setTransactionHash: (state, action) => {
      state.transactionHash = action.payload;
    },
    // Reset swap state
    resetSwapState: (state) => {
      state.isSwapping = false;
      state.isApproving = false;
      state.transactionHash = null;
    },
    // Reset bridge-related state
    resetBridgeState: (state) => {
      state.exchangeRate = null;
      state.transaction = null;
      state.orderType = null;
      state.transactionHash = null;
      state.exchangeRateError = null;
    },
    // Clear exchange rate error
    clearExchangeRateError: (state) => {
      state.exchangeRateError = null;
    },
  },
  extraReducers: (builder) => {
    // Handle getAvailableTokens
    builder
      .addCase(getAvailableTokensFromChain.pending, (state) => {})
      .addCase(getAvailableTokensFromChain.fulfilled, (state, action) => {
        state.availableTokens = action.payload;
      })
      .addCase(getAvailableTokensFromChain.rejected, (state, action) => {
        console.error("Failed to get available tokens:", action.error);
      });

    // Handle getQuote
    builder
      .addCase(getQuote.pending, (state) => {})
      .addCase(getQuote.fulfilled, (state, action) => {
        if (!action.payload.error) {
          const isFromTokenValid =
            state.fromToken?.address.toLowerCase() ===
              action.meta.arg.tokenInAddress.toLowerCase() ||
            (state.fromToken?.address === ZeroAddress &&
              action.meta.arg.tokenInAddress === "PLS");

          const isToTokenValid =
            state.toToken?.address.toLowerCase() ===
              action.meta.arg.tokenOutAddress.toLowerCase() ||
            (state.toToken?.address === ZeroAddress &&
              action.meta.arg.tokenOutAddress === "PLS");

          const otherValidation =
            state.fromToken?.decimals === action.meta.arg.fromDecimal &&
            state.slippage === action.meta.arg.allowedSlippage &&
            Number(state.fromAmount) === action.meta.arg.amount;

          if (isFromTokenValid && isToTokenValid && otherValidation) {
            state.quote = action.payload;
          }
        }
      })
      .addCase(getQuote.rejected, (state, action) => {
        console.error("Failed to get quote:", action.error);
      });

    // Handle approveToken
    builder
      .addCase(approveTokenAction.pending, (state) => {
        state.isApproving = true;
      })
      .addCase(approveTokenAction.fulfilled, (state, action) => {
        state.isApproving = false;
      })
      .addCase(approveTokenAction.rejected, (state, action) => {
        state.isApproving = false;
      });

    // Handle executeSwap
    builder
      .addCase(executeSwapAction.pending, (state) => {
        state.isSwapping = true;
      })
      .addCase(executeSwapAction.fulfilled, (state, action) => {
        state.isSwapping = false;
        state.transactionHash = action.payload.transactionHash;
        state.isApproved = false;
        state.isApproving = false;
        state.quote = null;
        state.fromAmount = "";
        state.fromToken = null;
        state.toToken = null;
        state.transactionHash = null;
      })
      .addCase(executeSwapAction.rejected, (state, action) => {
        state.isSwapping = false;
      });

    // Handle getTokenPrice
    builder
      .addCase(getTokenPrice.pending, (state) => {
        // Handle loading state if needed
      })
      .addCase(getTokenPrice.fulfilled, (state, action) => {
        if (action.meta.arg.type === "from") {
          state.fromToken = {
            ...state.fromToken,
            price: action.payload,
          } as TokenType;
        }
        if (action.meta.arg.type === "to") {
          state.toToken = {
            ...state.toToken,
            price: action.payload,
          } as TokenType;
        }
      })
      .addCase(getTokenPrice.rejected, (state, action) => {
        console.error("Failed to get token price:", action.error);
      });

    // Handle checkTokenAllowance
    builder
      .addCase(checkTokenAllowance.pending, (state) => {
        state.isApproving = false;
      })
      .addCase(checkTokenAllowance.fulfilled, (state, action) => {
        state.isApproved = action.payload?.hasAllowance || false;
      })
      .addCase(checkTokenAllowance.rejected, (state, action) => {
        state.isApproved = false;
      });

    // Handle getTokenBalance
    builder
      .addCase(getTokenBalance.fulfilled, (state, action) => {
        // This will be handled in the component based on which token is being checked
      })
      .addCase(getTokenBalance.rejected, (state, action) => {
        console.error("Failed to get token balance:", action.error);
      });

    // Handle getNativeBalance
    builder
      .addCase(getNativeBalance.fulfilled, (state, action) => {
        state.nativeBalance = action.payload;
      })
      .addCase(getNativeBalance.rejected, (state, action) => {
        console.error("Failed to get native balance:", action.error);
      });

    // Handle getCurrencies
    builder
      .addCase(getCurrencies.fulfilled, (state, action) => {
        const currencies = (action.payload as CurrencyType[]).filter(
          (item) => item.network === "eth"
        );

        // Convert CurrencyType to TokenType and save in availableTokens
        state.availableTokens = currencies.map((currency) => ({
          address: currency.tokenContract || ZeroAddress,
          symbol: currency.ticker.toUpperCase(),
          name: currency.name,
          image: currency.image,
          decimals: 18, // Default for currencies
          blockchainNetwork: "ethereum",
          network: "ethereum",
          rank: 0,
          type: "currency",
          usdPrice: 0,
          token_security: null,
          network_rank: 0,
          price: 0,
          // Additional currency fields
          hasExternalId: currency.hasExternalId,
          isExtraIdSupported: currency.isExtraIdSupported,
          isFiat: currency.isFiat,
          featured: currency.featured,
          isStable: currency.isStable,
          supportsFixedRate: currency.supportsFixedRate,
          buy: currency.buy,
          sell: currency.sell,
          legacyTicker: currency.legacyTicker,
        }));
      })
      .addCase(getCurrencies.rejected, (state, action) => {
        console.error("Failed to get currencies:", action.error);
      });

    // Handle getExchangeRate
    builder
      .addCase(getExchangeRate.fulfilled, (state, action) => {
        state.exchangeRate = action.payload;
        state.exchangeRateError = null;
      })
      .addCase(getExchangeRate.rejected, (state, action) => {
        console.error("Failed to get exchange rate:", action.error);
        state.exchangeRateError = action.error.message || "Failed to get exchange rate";
        state.exchangeRate = null;
      });

    // Handle exchangeTrade
    builder
      .addCase(exchangeTrade.pending, (state) => {
        state.isSwapping = true;
      })
      .addCase(exchangeTrade.fulfilled, (state, action) => {
        state.isSwapping = false;
        state.transaction = action.payload as TransactionType;
      })
      .addCase(exchangeTrade.rejected, (state, action) => {
        state.isSwapping = false;
        console.error("Failed to execute bridge exchange:", action.error);
      });

    // Handle sendTokensToPayinAddress
    builder
      .addCase(sendTokensToPayinAddressAction.pending, (state) => {
        state.isSwapping = true;
      })
      .addCase(sendTokensToPayinAddressAction.fulfilled, (state, action) => {
        state.isSwapping = false;
      })
      .addCase(sendTokensToPayinAddressAction.rejected, (state, action) => {
        state.isSwapping = false;
        console.error("Failed to send tokens to payin address:", action.error);
      });

    // Handle getExchangeOrderStatus
    builder
      .addCase(getExchangeOrderStatus.fulfilled, (state, action) => {
        state.orderType = action.payload as OrderType;
      })
      .addCase(getExchangeOrderStatus.rejected, (state, action) => {
        console.error("Failed to get exchange order status:", action.error);
      });
  },
});

export const {
  setAvailableTokens,
  setFromToken,
  setToToken,
  setFromAmount,
  setQuote,
  setExchangeRate,
  setSlippage,
  setFromTokenBalance,
  setToTokenBalance,
  setNativeBalance,
  setTransactionHash,
  resetSwapState,
  resetBridgeState,
  clearExchangeRateError,
} = swapSlice.actions;

export default swapSlice.reducer;
