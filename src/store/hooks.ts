import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Activity selectors
export const useActivityState = () => useSelector((state: RootState) => state.activity);
export const useTransactions = () => useSelector((state: RootState) => state.activity.transactions);
export const useActivityLoading = () => useSelector((state: RootState) => state.activity.loading);
export const useActivityError = () => useSelector((state: RootState) => state.activity.error); 