/**
 * Loader Component
 * 
 * A reusable loading spinner component that can be used across the application.
 * Supports different sizes and can be used with or without text.
 * 
 * Usage:
 * ```tsx
 * // Full page loader
 * <Loader fullPage />
 * 
 * // Inline loader with custom text
 * <Loader text="Loading data..." />
 * 
 * // Small loader without text
 * <Loader size="sm" />
 * ```
 */

import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface LoaderProps {
  /** Whether to display the loader in full page mode */
  fullPage?: boolean;
  /** Custom text to display below the spinner */
  text?: string;
  /** Size of the spinner: "sm" (16px), "md" (24px), "lg" (32px), "xl" (48px) */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes to apply to the container */
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12"
};

export function Loader({ 
  fullPage = false, 
  text = "Loading...", 
  size = "md",
  className 
}: LoaderProps) {
  const spinnerSize = sizeMap[size];
  
  const content = (
    <>
      <Loader2 
        className={cn(
          "animate-spin text-primary",
          spinnerSize
        )} 
      />
      {text && (
        <p className={cn(
          "text-muted-foreground",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-base",
          size === "xl" && "text-lg"
        )}>
          {text}
        </p>
      )}
    </>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-2",
      className
    )}>
      {content}
    </div>
  );
}
