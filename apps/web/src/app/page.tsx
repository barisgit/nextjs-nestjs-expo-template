"use client";

import React from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@repo/ui/components/base/button";
import { type JSX } from "react";

export default function Home(): JSX.Element {
  const { isSignedIn } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to App Template
      </h1>

      <div className="max-w-2xl mx-auto text-center mb-8">
        <p className="text-xl mb-4">
          A modern web application with Next.js, NestJS, and Expo
        </p>
        <p className="mb-6">
          This template includes authentication with Clerk, TailwindCSS styling,
          and tRPC for end-to-end type safety.
        </p>

        <div className="p-4 bg-slate-100 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
          <p className="mb-2">
            Current status:{" "}
            <span
              className={`font-bold ${isSignedIn ? "text-green-600" : "text-red-600"}`}
            >
              {isSignedIn ? "Signed In" : "Signed Out"}
            </span>
          </p>

          {isSignedIn ? (
            <Link href="/profile" className="text-primary hover:underline">
              View your profile
            </Link>
          ) : (
            <p>Sign in to access protected routes and view your profile</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center justify-center mt-10">
        <Link href="/demo">
          <Button variant="outline">Demo</Button>
        </Link>
      </div>
    </div>
  );
}
