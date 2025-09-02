import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { BackendURL } from "../const/swap";
import { withdrawReferralEarnings } from "../contracts/SwapManager";

interface ReferralCode {
  id: string;
  address: string;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
}

interface ReferralAddress {
  address: string;
  referralCode: string;
  createdAt: string;
}

export interface ReferralFee {
  id: string;
  referrer: string;
  token: string;
  amount: string;
  lastUpdated: string;
  createdAt: string;
}

interface ReferralState {
  referralCode: ReferralCode | null;
  referralAddress: ReferralAddress | null;
  referralFees: ReferralFee[];
  loading: boolean;
  error: string | null;
  claiming: boolean;
}

const initialState: ReferralState = {
  referralCode: null,
  referralAddress: null,
  referralFees: [],
  loading: false,
  error: null,
  claiming: false,
};

// Async thunk for fetching referral code
export const fetchReferralCode = createAsyncThunk(
  "referral/fetchReferralCode",
  async (address: string) => {
    const response = await fetch(
      `${BackendURL}referral/code?address=${address}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch referral code");
    }
    const data = await response.json();
    return data as ReferralCode;
  }
);

// Async thunk for fetching referral address data
export const fetchReferralAddress = createAsyncThunk(
  "referral/fetchReferralAddress",
  async (referralCode: string) => {
    const response = await fetch(
      `${BackendURL}referral/address?referralCode=${referralCode}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch referral address");
    }
    const data = await response.json();
    return data as ReferralAddress;
  }
);

// Async thunk for fetching referral fees
export const fetchReferralFees = createAsyncThunk(
  "referral/fetchReferralFees",
  async (referrerAddress: string) => {
    const response = await fetch(
      `${BackendURL}referral-fees/referrer/${referrerAddress}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch referral fees");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  }
);

// Async thunk for claiming referral earnings
export const claimReferralEarnings = createAsyncThunk(
  "referral/claimReferralEarnings",
  async ({ tokens, account }: { tokens: string[]; account: string }) => {
    const transaction = await withdrawReferralEarnings({ tokens, account });
    return transaction;
  }
);

const referralSlice = createSlice({
  name: "referral",
  initialState,
  reducers: {
    clearReferralCode: (state) => {
      state.referralCode = null;
      state.error = null;
    },
    clearReferralAddress: (state) => {
      state.referralAddress = null;
    },
    setReferralAddress: (state, action: PayloadAction<ReferralAddress>) => {
      state.referralAddress = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralCode.fulfilled, (state, action) => {
        state.loading = false;
        state.referralCode = action.payload;
        state.error = null;
      })
      .addCase(fetchReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch referral code";
      })
      .addCase(fetchReferralAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.referralAddress = action.payload;
        state.error = null;
      })
      .addCase(fetchReferralAddress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch referral address";
      })
      .addCase(fetchReferralFees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralFees.fulfilled, (state, action) => {
        state.loading = false;
        state.referralFees = action.payload;
        state.error = null;
      })
      .addCase(fetchReferralFees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch referral fees";
      })
      .addCase(claimReferralEarnings.pending, (state) => {
        state.claiming = true;
        state.error = null;
      })
      .addCase(claimReferralEarnings.fulfilled, (state, action) => {
        state.claiming = false;
        state.error = null;
      })
      .addCase(claimReferralEarnings.rejected, (state, action) => {
        state.claiming = false;
        state.error =
          action.error.message || "Failed to claim referral earnings";
      });
  },
});

export const {
  clearReferralCode,
  clearReferralAddress,
  setReferralAddress,
  setError,
} = referralSlice.actions;
export default referralSlice.reducer;
