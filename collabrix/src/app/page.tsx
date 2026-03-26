import Link from "next/link";
import {
  Bot,
  CheckSquare,
  FileEdit,
  FolderOpen,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Real-time Collaboration",
    description:
      "Edit together with live cursors, presence, and instant sync across your team.",
    icon: Users,
  },
  {
    title: "AI Assistant",
    description:
      "Summarize, draft, and reason over your workspace with context-aware AI.",
    icon: Bot,
  },
  {
    title: "Task Management",
    description:
      "Kanban-ready tasks with priorities, assignees, and clear status flows.",
    icon: CheckSquare,
  },
  {
    title: "Document Editor",
    description:
      "Rich documents with structure, comments, and version-friendly workflows.",
    icon: FileEdit,
  },
  {
    title: "File Storage",
    description:
      "Centralized files with fast access and organized workspace libraries.",
    icon: FolderOpen,
  },
  {
    title: "Team Permissions",
    description:
      "Role-based access so the right people see and change the right things.",
    icon: Shield,
  },
] as const;

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 dark:opacity-30"
        aria-hidden
      >
        <div className="absolute -left-1/4 top-0 h-[520px] w-[520px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-1/4 top-1/3 h-[480px] w-[480px] rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/10" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,#000_50%,transparent_100%)] opacity-[0.35] dark:opacity-20"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            Collabrix
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={cn(
                "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity",
                "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className={cn(
                "mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm",
                "dark:bg-muted/50"
              )}
            >
              <Zap className="h-3.5 w-3.5 text-primary" aria-hidden />
              Built for teams who ship with AI
            </div>
            <h1
              className={cn(
                "text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl",
                "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent",
                "dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400"
              )}
            >
              AI-Native Collaborative Workspace
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              One place for documents, tasks, files, and an assistant that
              understands your project—so your team stays aligned from first
              idea to shipped work.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/register"
                className={cn(
                  "inline-flex h-12 w-full min-w-[200px] items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-all",
                  "hover:shadow-lg hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
                )}
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className={cn(
                  "inline-flex h-12 w-full min-w-[200px] items-center justify-center rounded-lg border border-border bg-card px-8 text-base font-semibold text-card-foreground shadow-sm transition-colors",
                  "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
                )}
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {features.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-all",
                  "hover:border-primary/30 hover:shadow-md"
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground",
                    "ring-1 ring-border/80 transition-colors group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:bg-primary/15"
                  )}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/40 py-16 dark:bg-muted/20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to collaborate smarter?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Create a workspace in minutes. Invite your team and let AI handle
              the busywork.
            </p>
            <Link
              href="/register"
              className={cn(
                "mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground shadow-sm transition-opacity",
                "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          Built with{" "}
          <span className="font-medium text-foreground">Collabrix</span>
        </div>
      </footer>
    </div>
  );
}
