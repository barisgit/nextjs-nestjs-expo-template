#!/bin/bash
# Test script for PostHog analytics in the backend with verbose debugging

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Define the base URL
BASE_URL="http://localhost:3001"

echo -e "${BLUE}Testing PostHog Analytics Integration (VERBOSE MODE)${NC}"
echo -e "${BLUE}=============================================${NC}\n"

# Check if the server is running
echo -e "${BLUE}Checking if backend server is running...${NC}"
if curl -s --head $BASE_URL >/dev/null; then
  echo -e "${GREEN}✅ Backend server is running${NC}\n"
else
  echo -e "${RED}❌ Backend server does not appear to be running at $BASE_URL${NC}"
  echo -e "${YELLOW}Please start the server with: pnpm dev:backend${NC}\n"
  exit 1
fi

# Test health endpoint with verbose curl
echo -e "${BLUE}Testing health endpoint...${NC}"
echo -e "${YELLOW}Request: GET $BASE_URL/analytics/health${NC}"
health_response=$(curl -v $BASE_URL/analytics/health 2>&1)
echo -e "${YELLOW}Response: $health_response${NC}\n"

# Test capturing a custom event with verbose curl
echo -e "${BLUE}Testing event capture...${NC}"
echo -e "${YELLOW}Request: POST $BASE_URL/analytics/capture${NC}"
event_data='{
  "userId": "test-user-123",
  "event": "test_event",
  "properties": {
    "test_prop": "test_value",
    "source": "test_script",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
  }
}'
echo -e "${YELLOW}Request data: $event_data${NC}"
event_response=$(curl -v -X POST \
  $BASE_URL/analytics/capture \
  -H "Content-Type: application/json" \
  -d "$event_data" 2>&1)
echo -e "${YELLOW}Response: $event_response${NC}\n"

# Test direct PostHog API access to verify credentials
echo -e "${BLUE}Testing direct access to PostHog API to verify credentials...${NC}"
echo -e "${YELLOW}Request: GET https://eu.api.posthog.com/capture/${NC}"
direct_response=$(curl -v -X POST \
  "https://eu.i.posthog.com/capture/" \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "phc_dlOzBVvXm38UDi9DVCjqfdEbp3FH7b248nYVrSa2ASG",
    "event": "direct_api_test",
    "properties": {
      "distinct_id": "test-direct-api",
      "test_prop": "direct_test",
      "source": "direct_api_test"
    }
  }' 2>&1)
echo -e "${YELLOW}Response: $direct_response${NC}\n"

echo -e "${GREEN}All tests completed!${NC}"
echo -e "${BLUE}If you see any 'HTTP/1.1 200 OK' responses, the requests were sent successfully.${NC}"
echo -e "${BLUE}Check your PostHog dashboard at https://eu.i.posthog.com/events${NC}"
echo -e "${BLUE}Look for events with names 'test_event' or 'direct_api_test'${NC}"
echo -e "${YELLOW}Note: If you see 'Invalid API key' in any response, your credentials are not correct${NC}"
echo -e "${YELLOW}If direct API test fails but backend tests succeed, the issue might be in the backend configuration${NC}" 