"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast w-full p-4 rounded-lg border shadow-lg group-[.toaster]:bg-background-default group-[.toaster]:text-foreground group-[.toaster]:border-border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-success-50 group-[.toaster]:text-success-700 group-[.toaster]:border-success-200",
          error:
            "group-[.toaster]:bg-destructive-50 group-[.toaster]:text-destructive-700 group-[.toaster]:border-destructive-200",
          warning:
            "group-[.toaster]:bg-warning-50 group-[.toaster]:text-warning-700 group-[.toaster]:border-warning-200",
          info: "group-[.toaster]:bg-info-50 group-[.toaster]:text-info-700 group-[.toaster]:border-info-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
