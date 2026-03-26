"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-zinc-800/10 bg-white px-4 py-3 text-sm text-zinc-950 outline-none ring-0 transition placeholder:text-zinc-400 focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
