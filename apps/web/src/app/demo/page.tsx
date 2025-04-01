import Link from "next/link";
import { Button } from "@repo/ui/components/base/button";
import { type JSX } from "react";
import { AllComponentsDemo } from "@/components/demos/all-components-demo";

export default function Demo(): JSX.Element {
  return (
    <div className="overflow-y-auto flex flex-col gap-4 items-center justify-center mt-10">
      <h1 className="text-2xl font-bold">Demo</h1>
      <Link href="/">
        <Button variant="outline">Home</Button>
      </Link>
      <AllComponentsDemo />
    </div>
  );
}
