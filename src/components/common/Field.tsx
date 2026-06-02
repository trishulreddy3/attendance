import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, leftIcon, rightSlot, className, ...rest },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border bg-card px-3 transition-all",
          "border-input focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
          error && "border-destructive focus-within:ring-destructive/15",
        )}
      >
        {leftIcon && <span className="text-muted-foreground [&_svg]:size-4">{leftIcon}</span>}
        <input
          ref={ref}
          className={cn(
            "h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70",
            className,
          )}
          {...rest}
        />
        {rightSlot}
      </div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
});
