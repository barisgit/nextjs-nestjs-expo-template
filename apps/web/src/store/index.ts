import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./socket-slice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {socket: SocketState}
export type AppDispatch = typeof store.dispatch;
