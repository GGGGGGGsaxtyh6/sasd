import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 text-foreground sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-35 dark:opacity-25"
        aria-hidden
      >
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/10" />
      </div>

      <div className="mb-8 flex w-full max-w-md flex-col items-center">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </span>
          Collabrix
        </Link>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          AI-native collaborative workspace
        </p>
      </div>

      <div
        className={cn(
          "w-full max-w-md rounded-lg border border-border bg-card p-8 text-card-foreground shadow-sm",
          "sm:p-10"
        )}
      >
        {children}
      </div>
    </div>
  );
}
