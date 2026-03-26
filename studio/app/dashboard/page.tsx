import { redirect } from "next/navigation";
import { getActiveSession } from "@/src/lib/auth";
import { listUserWorkspaces } from "@/src/services/workspaces";
import { AppShell } from "@/src/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";

export default async function DashboardPage() {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  const workspaces = listUserWorkspaces(session);

  if (workspaces.length === 0) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        isAdmin: session.user.isAdmin,
      }}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{workspace.name}</CardTitle>
                <Badge variant="secondary">{workspace.role}</Badge>
              </div>
              <p className="text-sm text-slate-400">{workspace.description}</p>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-slate-400">Plan {workspace.plan}</div>
              <Link
                href={`/workspaces/${workspace.id}`}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-400"
              >
                Abrir
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
