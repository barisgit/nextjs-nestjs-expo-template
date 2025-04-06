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

        <div className="flex items-center gap-0">
          <Button variant="link" asChild>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </Button>

          <Button variant="link" asChild>
            <Link href="/chat" className="hover:underline">
              Chat
            </Link>
          </Button>

          {isSignedIn ? (
            <>
              <Button variant="link" asChild>
                <Link href="/profile" className="hover:underline">
                  Profile
                </Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="link">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="link">Sign Up</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
