import React, { type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store";

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Redux provider for state management
 */
export function ReduxProvider({ children }: ReduxProviderProps): JSX.Element {
  return <Provider store={store}>{children}</Provider>;
}
