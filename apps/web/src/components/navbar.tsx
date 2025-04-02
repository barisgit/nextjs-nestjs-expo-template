"use client";

import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

export function Navbar() {
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
                <button className="hover:underline">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-white text-primary px-3 py-1 rounded hover:bg-opacity-90">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
