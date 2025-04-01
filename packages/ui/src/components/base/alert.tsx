import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@repo/ui/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default:
          "bg-background-default border-border-default text-text-primary [&>svg]:text-text-primary",
        info: "bg-info-50 border-info-200 text-info-900 [&>svg]:text-info-600",
        success:
          "bg-success-50 border-success-200 text-success-900 [&>svg]:text-success-600",
        warning:
          "bg-warning-50 border-warning-200 text-warning-900 [&>svg]:text-warning-600",
        destructive:
          "bg-destructive-50 border-destructive-200 text-destructive-900 [&>svg]:text-destructive-600",
        accent:
          "bg-accent-50 border-accent-200 text-accent-900 [&>svg]:text-accent-600",
        primary:
          "bg-primary-50 border-primary-200 text-primary-900 [&>svg]:text-primary-600",
        secondary:
          "bg-secondary-50 border-secondary-200 text-secondary-900 [&>svg]:text-secondary-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  >
    {props.children}
  </h5>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
