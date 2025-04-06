"use client";

import { useState, type JSX } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/base/button";
import { useTRPC } from "@/utils/trpc";

export function HelloExample(): JSX.Element {
  const [name, setName] = useState("World");
  const trpc = useTRPC();
  const [incrementCount, setIncrementCount] = useState(0);
  const [queryStartTime, setQueryStartTime] = useState<number | null>(null);

  // Use tRPC query with TanStack Query
  const helloQuery = useQuery(trpc.hello.queryOptions({ name }));

  const incrementQuery = useQuery(trpc.increment.queryOptions(incrementCount));

  // Get current user information
  const userQuery = useQuery(trpc.me.queryOptions());

  // Helper functions to render query results
  const renderHelloQueryResult = (): JSX.Element => {
    if (helloQuery.isLoading) return <p>Loading...</p>;
    if (helloQuery.error)
      return <p className="text-red-500">Error: {helloQuery.error.message}</p>;
    if (!helloQuery.data) return <p>No data available</p>;
    return <p>{helloQuery.data.greeting}</p>;
  };

  const renderIncrementQueryResult = (): JSX.Element => {
    if (incrementQuery.isLoading) return <p>Loading...</p>;
    if (incrementQuery.error)
      return (
        <p className="text-red-500">Error: {incrementQuery.error.message}</p>
      );
    if (!incrementQuery.data) return <p>No data available</p>;

    const queryTime = queryStartTime ? Date.now() - queryStartTime : 0;

    return (
      <div className="space-y-2">
        <p>Current Value: {incrementQuery.data}</p>
        <p className="text-sm text-gray-500">Query time: {queryTime}ms</p>
        <Button
          onClick={() => {
            setIncrementCount(incrementCount + 1);
            setQueryStartTime(Date.now());
            void incrementQuery.refetch();
          }}
        >
          Increment
        </Button>
      </div>
    );
  };

  const renderUserQueryResult = (): JSX.Element => {
    if (userQuery.isLoading) return <p>Loading user...</p>;
    if (userQuery.error)
      return (
        <p className="text-red-500">
          Not signed in or error: {userQuery.error.message}
        </p>
      );

    if (userQuery.data?.user) {
      return (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">Current User</p>
            <p className="text-sm text-gray-500">Signed in successfully</p>
          </div>
        </div>
      );
    }

    return <p>Please sign in to see your information</p>;
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">tRPC Example</h2>

      {/* Input to update query parameter */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Your Name:
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            void helloQuery.refetch();
          }}
          className="px-3 py-2 border rounded-md w-full"
        />
      </div>

      {/* Display query results */}
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Query Result:</h3>
          {renderHelloQueryResult()}
        </div>

        <div className="p-3 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Increment:</h3>
          {renderIncrementQueryResult()}
        </div>

        <div className="p-3 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">User:</h3>
          {renderUserQueryResult()}
        </div>
      </div>
    </div>
  );
}
