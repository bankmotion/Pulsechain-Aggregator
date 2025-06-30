import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QuoteType, TokenType } from "../types/Swap";
import { ethers } from "ethers";
import { ZeroAddress, SwapManagerAddress } from "../const/swap";
import {
  createPublicClient,
  http,
  parseUnits,
  parseEther,
  type Address,
} from "viem";
import SwapManagerABI from "../abis/SwapManager.json";
import ERC20ABI from "../abis/ERC20.json";
import {
  approveToken,
  executeSwap,
  getTokenAllowance,
  needsApproval,
} from "../contracts/SwapManager";
import { config } from "process";

interface SwapState {
  allChains: TokenType[];
  availableTokens: TokenType[];
  fromToken: TokenType | null;
  toToken: TokenType | null;
  fromAmount: string;
  quote: QuoteType | null;
  slippage: number;
  // Swap execution state
  isApproving: boolean;
  isSwapping: boolean;
  isApproved: boolean;
  // Transaction tracking
  transactionHash: string | null;
}

const initialState: SwapState = {
  allChains: [],
  availableTokens: [],
  fromToken: null,
  toToken: null,
  fromAmount: "",
  quote: null,
  slippage: 0.5,
  // Swap execution state
  isApproving: false,
  isSwapping: false,
  isApproved: false,
  // Transaction tracking
  transactionHash: null,
};

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
  async (chain: TokenType) => {
    const response = await fetch(
      `https://api.rubic.exchange/api/v2/tokens/?page=1&pageSize=200&network=${chain.blockchainNetwork}`
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
      `http://156.227.0.15:3000/quote?tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&amount=${ethers.parseUnits(
        amount.toString(),
        fromDecimal
      )}&allowedSlippage=${allowedSlippage}&fromDecimal=${fromDecimal}`
    );
    const data = await response.json();
    return data;
  }
);

export const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    setAllChains: (state, action) => {
      state.allChains = action.payload;
    },
    setAvailableTokens: (state, action) => {
      state.availableTokens = action.payload;
    },
    setFromToken: (state, action) => {
      state.fromToken = action.payload;
      resetSwapState();
    },
    setToToken: (state, action) => {
      state.toToken = action.payload;
      resetSwapState();
    },
    setFromAmount: (state, action) => {
      state.fromAmount = action.payload;
      resetSwapState();
    },
    setQuote: (state, action) => {
      state.quote = action.payload;
    },
    setSlippage: (state, action) => {
      state.slippage = action.payload;
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
  },
  extraReducers: (builder) => {
    // Handle getAllChains
    builder
      .addCase(getAllChains.pending, (state) => {})
      .addCase(getAllChains.fulfilled, (state, action) => {
        state.allChains = action.payload;
      })
      .addCase(getAllChains.rejected, (state, action) => {
        console.error("Failed to get all chains:", action.error);
      });

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
        console.log("action.payload", action.payload);
        if (!action.payload.error) {
          state.quote = action.payload;
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
  },
});

export const {
  setAllChains,
  setAvailableTokens,
  setFromToken,
  setToToken,
  setFromAmount,
  setQuote,
  setSlippage,
  setTransactionHash,
  resetSwapState,
} = swapSlice.actions;

export default swapSlice.reducer;
