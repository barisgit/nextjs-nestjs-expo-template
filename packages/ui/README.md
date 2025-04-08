# UI Package

This package provides shared UI components that can be used across web applications in the monorepo.

## Features

- Web components based on TailwindCSS and ShadCN UI
- Theming and styling utilities
- Accessibility-focused components
- Stateful and stateless components
- Form components with validation

> **Note**: For mobile (React Native) components, we use Tamagui in the mobile app directly rather than through this package.

## Installation

The package is included in the monorepo. It can be imported into any other package or app within the repo:

```json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

## Usage

### Web (Next.js) Components with ShadCN UI

Import and use components in your Next.js application:

```tsx
import { Button, Card, Input } from '@repo/ui';

export default function LoginPage() {
  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Login</h2>
      <form>
        <Input 
          label="Email" 
          placeholder="Enter your email" 
          type="email" 
        />
        <Input 
          label="Password" 
          placeholder="Enter your password" 
          type="password" 
        />
        <Button className="w-full mt-4">Log In</Button>
      </form>
    </Card>
  );
}
```

### Mobile Components

For mobile components, we use Tamagui directly in the mobile app. This decision allows us to optimize for performance and provide a native feel.

Example usage in the mobile app:

```tsx
import { Button, Card, H2, Input } from 'tamagui';

export function LoginScreen() {
  return (
    <Card size="$4" bordered elevate>
      <Card.Header padded>
        <H2>Login</H2>
      </Card.Header>
      <Card.Footer padded>
        <Input placeholder="Email" autoCapitalize="none" />
        <Input placeholder="Password" secureTextEntry />
        <Button theme="blue" marginTop="$4">Log In</Button>
      </Card.Footer>
    </Card>
  );
}
```

## Available Components

### Layout Components

- `Container` - Responsive container for layout
- `Card` - Card component with optional header and footer
- `Grid` - Responsive grid layout
- `Flex` - Flexible box layout

### Form Components

- `Input` - Text input with label and validation
- `Select` - Dropdown select component
- `Checkbox` - Checkbox component with label
- `RadioGroup` - Radio button group
- `Switch` - Toggle switch
- `Slider` - Range slider
- `DatePicker` - Date selection component

### Interactive Components

- `Button` - Button component with variants
- `IconButton` - Button with icon
- `Menu` - Dropdown menu
- `Tabs` - Tabbed interface
- `Modal` - Modal/dialog component
- `Drawer` - Side drawer component
- `Tooltip` - Tooltip component

### Display Components

- `Avatar` - User avatar component
- `Badge` - Badge/tag component
- `Alert` - Alert/notification component
- `Progress` - Progress indicator
- `Spinner` - Loading spinner
- `Skeleton` - Loading skeleton

### Navigation Components

- `Breadcrumb` - Breadcrumb navigation
- `Pagination` - Pagination component
- `Link` - Navigation link component

## Theme Customization

Theming is done through TailwindCSS for web components.

## Web/Mobile Component Strategy

Our component strategy separates web and mobile components:

- **Web**: ShadCN UI components with TailwindCSS in this package
- **Mobile**: Tamagui components directly in the mobile app

This separation allows us to:
1. Leverage platform-specific best practices
2. Optimize for each platform's performance characteristics
3. Use the most appropriate component libraries for each platform
4. Maintain type safety across both platforms

## Building Custom Components

Extend the UI components for custom use cases:

```tsx
import { Button, type ButtonProps } from '@repo/ui';

interface PrimaryButtonProps extends ButtonProps {
  isProcessing?: boolean;
}

export function PrimaryButton({ 
  children, 
  isProcessing, 
  ...props 
}: PrimaryButtonProps) {
  return (
    <Button 
      variant="primary" 
      disabled={isProcessing} 
      {...props}
    >
      {isProcessing ? 'Processing...' : children}
    </Button>
  );
}
```

or use the components directly:

```tsx
import { Button } from 'shadcn/ui';

<Button
  variant="primary"
  size="lg"
  className="w-full"
>
  Click me
</Button>
```

## Accessibility

The UI package is built with TailwindCSS and ShadCN UI with accessibility in mind.

## Best Practices

1. Use the provided components instead of creating new ones
2. Maintain consistent styling across applications
3. Leverage theme customization for brand consistency
4. Test components across different screen sizes
5. Follow accessibility guidelines when extending components
6. For mobile-specific UIs, use Tamagui directly in the mobile app
