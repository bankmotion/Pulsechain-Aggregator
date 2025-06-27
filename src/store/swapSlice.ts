import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { QuoteType, TokenType } from "../types/Swap";
import { ethers } from "ethers";
import { ZeroAddress } from "../const/swap";

interface SwapState {
  allChains: TokenType[];
  availableTokens: TokenType[];
  fromToken: TokenType | null;
  toToken: TokenType | null;
  fromAmount: string;
  quote: QuoteType | null;
  slippage: number;
}

const initialState: SwapState = {
  allChains: [],
  availableTokens: [],
  fromToken: null,
  toToken: null,
  fromAmount: "",
  quote: null,
  slippage: 0.5,
};

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

const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    setFromToken: (state, action) => {
      state.fromToken = action.payload;
    },

    setToToken: (state, action) => {
      state.toToken = action.payload;
    },

    setFromAmount: (state, action) => {
      state.fromAmount = action.payload;
    },

    setQuote: (state, action) => {
      state.quote = action.payload;
    },

    setSlippage: (state, action) => {
      state.slippage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getAllChains.pending, (state) => {
      state.allChains = [];
    });
    builder.addCase(getAllChains.fulfilled, (state, action) => {
      state.allChains = action.payload as TokenType[];
    });
    builder.addCase(getAllChains.rejected, (state, action) => {
      state.allChains = [];
    });

    builder
      .addCase(getAvailableTokensFromChain.pending, (state) => {
        state.availableTokens = [];
      })
      .addCase(getAvailableTokensFromChain.fulfilled, (state, action) => {
        state.availableTokens = action.payload as TokenType[];
      })
      .addCase(getAvailableTokensFromChain.rejected, (state, action) => {
        state.availableTokens = [];
      });

    builder.addCase(getTokenPrice.pending, (state) => {});
    builder.addCase(getTokenPrice.fulfilled, (state, action) => {
      const { type } = action.meta.arg;
      if (type === "from" && state.fromToken) {
        state.fromToken = { ...state.fromToken, price: action.payload };
      } else if (type === "to" && state.toToken) {
        state.toToken = { ...state.toToken, price: action.payload };
      }
    });
    builder.addCase(getTokenPrice.rejected, (state, action) => {});

    builder.addCase(getQuote.pending, (state) => {});
    builder.addCase(getQuote.fulfilled, (state, action) => {
      if (
        action.meta.arg.tokenInAddress ===
          (state.fromToken?.address === ZeroAddress
            ? "PLS"
            : state.fromToken?.address) &&
        action.meta.arg.tokenOutAddress === state.toToken?.address &&
        action.meta.arg.amount === Number(state.fromAmount) &&
        action.meta.arg.allowedSlippage === state.slippage &&
        !action.payload.error
      ) {
        state.quote = action.payload as QuoteType;
      }
    });
    builder.addCase(getQuote.rejected, (state, action) => {});
  },
});

export const {
  setFromToken,
  setToToken,
  setFromAmount,
  setQuote,
  setSlippage,
} = swapSlice.actions;

export default swapSlice.reducer;
