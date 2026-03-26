import { cn } from "@/src/lib/utils";

const variantClasses = {
  default: "border-white/10 bg-white/5 text-zinc-200",
  secondary: "border-indigo-400/20 bg-indigo-500/10 text-indigo-200",
  success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-500/10 text-amber-200",
} as const;

export function Badge({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: keyof typeof variantClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
