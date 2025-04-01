import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@repo/ui/lib/utils";

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md text-sm placeholder:text-text-secondary disabled:cursor-not-allowed disabled:opacity-50",
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
        default: "px-3 py-2",
        sm: "px-2 py-1 text-xs",
        lg: "px-4 py-3 text-base",
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

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, state, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size, state }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
