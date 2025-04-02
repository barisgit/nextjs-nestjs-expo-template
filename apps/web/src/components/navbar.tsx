"use client";

import React, { type JSX } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/base/button";

export function Navbar(): JSX.Element {
  const { isSignedIn } = useAuth();

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          App Template
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:underline">
            Home
          </Link>

          {isSignedIn ? (
            <>
              <Link href="/profile" className="hover:underline">
                Profile
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="hover:underline hover:text-white"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  variant="ghost"
                  className="hover:underline hover:text-white"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
