import { type JSX } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
