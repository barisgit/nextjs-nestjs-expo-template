import type { Metadata } from "next";
import "@repo/ui/styles.css";
import { type JSX } from "react";
import { TRPCProvider } from "../providers/trpc-provider";

export const metadata: Metadata = {
  title: "App Title",
  description: "A web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="">
      <body className="bg-background-default text-foreground">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
