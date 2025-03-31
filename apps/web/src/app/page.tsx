import { Badge } from "@repo/ui/components/base/badge";
import { Button } from "@repo/ui/components/base/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Button>Click me</Button>
      <Badge variant="destructive">Badge</Badge>
    </div>
  );
}
