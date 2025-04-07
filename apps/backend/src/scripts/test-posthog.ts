/**
 * PostHog Direct API Test Script
 * A TypeScript implementation for sending events directly to PostHog API
 */

import { config } from "dotenv";
import * as path from "path";
import fetch from "node-fetch";

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), ".env");
config({ path: envPath });

interface PostHogEventProperties {
  [key: string]: string | number | boolean | null | Record<string, unknown>;
}

interface PostHogEvent {
  event: string;
  distinct_id: string;
  properties: PostHogEventProperties;
}

interface BatchPayload {
  api_key: string;
  batch: PostHogEvent[];
}

interface SingleEventPayload {
  api_key: string;
  event: string;
  distinct_id: string;
  properties: PostHogEventProperties;
}

/**
 * Send a single event to PostHog
 */
async function sendEvent(
  distinctId: string,
  eventName: string,
  properties: PostHogEventProperties = {}
): Promise<void> {
  // Get API key and host from environment variables or use defaults
  const apiKey = process.env.POSTHOG_API_KEY;

  const apiHost = process.env.POSTHOG_HOST;

  if (!apiKey) {
    throw new Error("POSTHOG_API_KEY is not set");
  }

  if (!apiHost) {
    throw new Error("POSTHOG_HOST is not set");
  }

  // Create timestamp in ISO format
  const timestamp = new Date().toISOString();

  // Create the payload
  const payload: SingleEventPayload = {
    api_key: apiKey,
    event: eventName,
    distinct_id: distinctId,
    properties: {
      ...properties,
      timestamp,
      source: "direct_typescript_test",
      environment: process.env.NODE_ENV || "test",
    },
  };

  console.log(`\nSending event to PostHog...`);
  console.log(`Event: ${eventName}`);
  console.log(`Distinct ID: ${distinctId}`);
  console.log(`Host: ${apiHost}`);

  try {
    // Send the request
    const response = await fetch(`${apiHost}/capture/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { status: number };

    if (result.status === 1) {
      console.log(`✅ Event sent successfully!`);
      console.log(`Response:`, JSON.stringify(result, null, 2));
    } else {
      console.log(`❌ Failed to send event!`);
      console.log(`Response:`, JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error sending event:`, error);
  }
}

/**
 * Send a batch of events to PostHog
 */
async function sendBatchEvents(
  distinctId: string,
  events: Array<{ name: string; properties?: PostHogEventProperties }>
): Promise<void> {
  // Get API key and host from environment variables or use defaults
  const apiKey =
    process.env.POSTHOG_API_KEY ||
    "phc_dlOzBVvXm38UDi9DVCjqfdEbp3FH7b248nYVrSa2ASG";
  const apiHost = process.env.POSTHOG_HOST;

  if (!apiKey) {
    throw new Error("POSTHOG_API_KEY is not set");
  }

  if (!apiHost) {
    throw new Error("POSTHOG_HOST is not set");
  }

  // Create timestamp in ISO format
  const timestamp = new Date().toISOString();

  // Create batch events
  const batchEvents = events.map((event, index) => ({
    event: event.name,
    distinct_id: distinctId,
    properties: {
      ...event.properties,
      timestamp,
      source: "direct_typescript_batch_test",
      test_number: index + 1,
      environment: process.env.NODE_ENV || "test",
    },
  }));

  // Create the payload
  const payload: BatchPayload = {
    api_key: apiKey,
    batch: batchEvents,
  };

  console.log(`\nTesting batch event capture...`);
  console.log(`Sending ${events.length} events for user ${distinctId}`);

  try {
    // Send the request
    const response = await fetch(`${apiHost}/batch/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { status: number };

    if (result.status === 1) {
      console.log(`✅ Batch events sent successfully!`);
      console.log(`Response:`, JSON.stringify(result, null, 2));
    } else {
      console.log(`❌ Failed to send batch events!`);
      console.log(`Response:`, JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error sending batch events:`, error);
  }
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  // Get command line arguments or use defaults
  const distinctId = process.argv[2] || `test_user_${Date.now()}`;
  const eventName = process.argv[3] || "test_event";

  // Send a single event
  await sendEvent(distinctId, eventName);

  // Send batch events
  await sendBatchEvents(distinctId, [
    { name: "batch_test_1" },
    { name: "batch_test_2" },
  ]);

  console.log("\nUsage: ts-node test-posthog.ts [distinct_id] [event_name]");
}

// Execute the main function
main().catch((error) => {
  console.error("Error executing script:", error);
  process.exit(1);
});
