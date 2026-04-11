import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NumberInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

/**
 * `type="number"` with spinners hidden, wheel scroll disabled (no accidental nudges),
 * and ArrowUp/ArrowDown disabled (no browser step behavior).
 */
function NumberInput({ className, onWheel, onKeyDown, ...props }: NumberInputProps) {
  return (
    <Input
      type="number"
      className={cn(
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className,
      )}
      onWheel={(e) => {
        e.preventDefault();
        onWheel?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
        }
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}

export { NumberInput };
