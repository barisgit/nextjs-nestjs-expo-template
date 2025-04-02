import React from "react";
import type { Metadata } from "next";
import "@repo/ui/styles.css";
import { type JSX } from "react";
import { CustomClerkProvider } from "../providers/clerk-provider";
import { Navbar } from "../components/navbar";

export const metadata: Metadata = {
  title: "App Template",
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
        <CustomClerkProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
          </div>
        </CustomClerkProvider>
      </body>
    </html>
  );
}
