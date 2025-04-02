"use client";

import React, { type ReactNode, type JSX } from "react";
import { ClerkProvider } from "@clerk/nextjs";

interface ClerkProviderProps {
  children: ReactNode;
}

export function CustomClerkProvider({
  children,
}: ClerkProviderProps): JSX.Element {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-primary text-primary-foreground hover:bg-primary/90",
          footerActionLink: "text-primary hover:text-primary/90",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
