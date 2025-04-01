import Link from "next/link";
import { Button } from "@repo/ui/components/base/button";
import { type JSX } from "react";
import { TRPCExample } from "@/components/examples/trpc-example";

export default function Home(): JSX.Element {
  return (
    <div className="overflow-y-auto">
      <div className="flex flex-col gap-4 items-center justify-center mt-10">
        <Link href="/demo">
          <Button variant="outline">Demo</Button>
        </Link>
        <TRPCExample />
      </div>
    </div>
  );
}
