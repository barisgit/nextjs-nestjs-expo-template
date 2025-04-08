# PostHog Analytics Setup Guide

This guide explains how to set up and configure PostHog analytics for all applications in this monorepo.

## Table of Contents

1. [Creating a PostHog Account](#creating-a-posthog-account)
2. [Web App Setup](#web-app-setup)
3. [Mobile App Setup](#mobile-app-setup)
4. [Backend Setup](#backend-setup)
5. [Event Tracking Guide](#event-tracking-guide)
6. [Feature Flags](#feature-flags)
7. [Troubleshooting](#troubleshooting)

## Creating a PostHog Account

1. Go to [PostHog](https://app.posthog.com) (US) or [PostHog EU](https://eu.posthog.com) (EU)
2. Sign up for a new account or log in to an existing one
3. Create a new project or use an existing one
4. Navigate to "Project Settings" > "Project API Key"
5. Copy your API key and host URL for use in all applications

### Automated Setup Option

For a quick setup of your Next.js app, you can use the PostHog wizard:

```bash
cd apps/web
npx @posthog/wizard@latest --region us  # Use "--region eu" for EU data storage
```

## Web App Setup

1. Add the PostHog environment variables to `.env.local`:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com  # or https://eu.posthog.com for EU region
```

2. The web app is already configured to:
   - Track page views automatically
   - Identify users when they log in via Clerk
   - Capture button clicks and form submissions

3. In the PostHog dashboard:
   - Go to "Explore" > "Events" to see captured events
   - Create funnels under "Product Analytics" > "Funnels"
   - Set up dashboards under "Dashboards"

### Testing the Web App Integration

1. Run the web app locally:
```bash
pnpm dev:web
```

2. Navigate to different pages and perform actions
3. Check the PostHog dashboard under "Live Events" to confirm data is being sent

## Mobile App Setup

1. Add the PostHog environment variables to `.env`:

```bash
# PostHog Analytics  
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com  # or https://app.posthog.com for US region
```

2. The mobile app is already configured to:
   - Track screen views automatically
   - Identify users when they log in via Clerk
   - Capture app lifecycle events (open, close, background)

3. In the PostHog dashboard:
   - Create a separate dashboard for mobile analytics
   - Set up specific funnels for mobile user flows
   - Filter events by platform (`client.platform` will be `ios` or `android`)

### Testing the Mobile App Integration

1. Run the mobile app locally:
```bash
pnpm dev:mobile
```

2. Navigate through screens and perform actions
3. Check the PostHog dashboard under "Live Events" to confirm data is being sent

## Backend Setup

1. Add the PostHog environment variables to `.env`:

```bash
# PostHog Analytics
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_HOST=https://app.posthog.com  # or https://eu.posthog.com for EU region
```

2. The backend is configured with a `PostHogService` that provides:
   - Event capture methods
   - User identification
   - Event flushing

3. In the PostHog dashboard:
   - Look for events with property `$lib` equal to `posthog-node`
   - These indicate server-side captured events

### Capturing Server-Side Events

Inject the `PostHogService` into your controllers/services and use it to track events:

```typescript
import { PostHogService } from './services/posthog.service';

@Injectable()
export class YourService {
  constructor(private readonly posthogService: PostHogService) {}

  async someAction(userId: string) {
    // Perform your action logic
    
    // Track the event
    await this.posthogService.capture(
      userId,
      'action_performed',
      { actionType: 'example' }
    );
  }
}
```

## Event Tracking Guide

### Common Events to Track

1. **Authentication Events**:
   - User sign-up
   - User login
   - User logout
   - Profile updates

2. **Engagement Events**:
   - Feature usage
   - Button clicks
   - Form submissions
   - Content views

3. **Business Events**:
   - Purchase completed
   - Subscription started/cancelled
   - Upgrade/downgrade

### Custom Event Tracking

#### Web (Next.js)

```typescript
import { posthog } from '@/providers/posthog-provider';

// Track a custom event
function handleButtonClick() {
  posthog.capture('button_clicked', { 
    buttonName: 'example',
    page: 'home' 
  });
  
  // ...your button click logic
}
```

#### Mobile (Expo)

```typescript
import { PostHog } from 'posthog-react-native';

// Get the PostHog instance
const posthog = PostHog.getInstance();

// Track a custom event
function handleButtonPress() {
  posthog?.capture('button_pressed', { 
    buttonName: 'example',
    screen: 'home' 
  });
  
  // ...your button press logic
}
```

#### Backend (NestJS)

```typescript
// Inject the PostHogService where needed
@Injectable()
export class YourService {
  constructor(private readonly posthogService: PostHogService) {}

  async someAction(userId: string) {
    await this.posthogService.capture(
      userId,
      'backend_action',
      { actionType: 'example' }
    );
  }
}
```

## Feature Flags

PostHog supports feature flags for controlled rollouts and A/B testing.

### Setting Up Feature Flags

1. Go to "Feature Flags" in the PostHog dashboard
2. Click "New Feature Flag"
3. Enter a key (e.g., `new-feature-enabled`)
4. Configure rollout percentage or targeting rules
5. Save the feature flag

### Using Feature Flags

#### Web (Next.js)

```typescript
import { usePostHog } from 'posthog-js/react';

function MyComponent() {
  const posthog = usePostHog();
  const isFeatureEnabled = posthog?.isFeatureEnabled('new-feature-enabled');

  return (
    <div>
      {isFeatureEnabled ? (
        <NewFeature />
      ) : (
        <OldFeature />
      )}
    </div>
  );
}
```

#### Mobile (Expo)

```typescript
import { usePostHog } from 'posthog-react-native';

function MyComponent() {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    const checkFeatureFlag = async () => {
      const enabled = await posthog?.isFeatureEnabled('new-feature-enabled');
      setIsFeatureEnabled(enabled);
    };
    
    checkFeatureFlag();
  }, []);

  return (
    <View>
      {isFeatureEnabled ? (
        <NewFeature />
      ) : (
        <OldFeature />
      )}
    </View>
  );
}
```

## Troubleshooting

### Common Issues

1. **Events not showing up in PostHog dashboard**:
   - Check that you've used the correct API key
   - Ensure your host URL is correct (US vs EU)
   - Check browser console for errors (web)
   - Check that `__DEV__` is not interfering with capturing (mobile)

2. **User identification not working**:
   - Verify that Clerk authentication is properly integrated
   - Check user ID is being passed correctly

3. **PostHog initialization failing**:
   - Make sure environment variables are properly set
   - Check for any network blocking issues

### Debugging

#### Web App

```typescript
// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  posthog.debug();
}
```

#### Mobile App

Check the debug logs when `enableDebug: __DEV__` is set in the PostHog options.

#### Backend

Use the logger in the PostHogService to see if events are being captured and sent:

```typescript
this.logger.log('PostHog event captured:', event);
```

## Additional Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog React/Next.js SDK](https://posthog.com/docs/libraries/react)
- [PostHog React Native SDK](https://posthog.com/docs/libraries/react-native)
- [PostHog Node.js SDK](https://posthog.com/docs/libraries/node)
- [Feature Flags Documentation](https://posthog.com/docs/feature-flags/setup)
