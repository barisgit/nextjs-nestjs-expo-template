"use client";

import React, { type ReactNode, type JSX } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

interface ReduxProviderProps {
  children: ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps): JSX.Element {
  return <Provider store={store}>{children}</Provider>;
}
