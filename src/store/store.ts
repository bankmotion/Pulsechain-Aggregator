import { configureStore } from "@reduxjs/toolkit";
import swapReducer from "./swapSlice";
import bridgeReducer from "./bridgeSlice";
import activityReducer from "./activitySlice";

export const store = configureStore({
  reducer: {
    swap: swapReducer,
    bridge: bridgeReducer,
    activity: activityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 