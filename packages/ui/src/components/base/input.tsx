import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/ui/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-border-default bg-background-default text-text-primary focus-visible:border-primary-400",
        filled:
          "border border-transparent bg-background-level1 text-text-primary focus-visible:border-primary-400 hover:bg-background-level2",
        outline:
          "border-2 border-border-default bg-background-default text-text-primary focus-visible:border-primary-400",
        flushed:
          "border-b border-border-default rounded-none bg-transparent px-0 focus-visible:border-b-primary-400",
        unstyled:
          "border-none bg-transparent px-0 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 text-xs",
        lg: "h-12 px-4 text-base",
      },
      state: {
        default:
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, state, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, state }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
