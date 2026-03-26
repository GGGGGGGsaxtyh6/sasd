import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { getActiveSession } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { activities, users, workspaces } from "@/src/lib/schema";

export default async function AdminPage() {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
  }
  if (!session.user.isAdmin) {
    redirect("/dashboard");
  }
  const recentUsers = db.select().from(users).orderBy(desc(users.createdAt)).limit(10).all();
  const recentWorkspaces = db
    .select()
    .from(workspaces)
    .orderBy(desc(workspaces.createdAt))
    .limit(10)
    .all();
  const latestActivity = db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(12)
    .all();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-300/70">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Panel de administración</h1>
      </div>

      <Card className="p-5">
        <p className="text-sm text-slate-300">
          Estado: conectado.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Usuarios recientes</p>
            {recentUsers.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{user.name}</p>
                  {user.isAdmin ? <Badge>Admin</Badge> : <Badge variant="secondary">Member</Badge>}
                </div>
                <p className="mt-1 text-sm text-slate-400">{user.email}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">Workspaces recientes</p>
            {recentWorkspaces.map((workspace) => (
              <div key={workspace.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{workspace.name}</p>
                  <Badge variant="secondary">{workspace.plan}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-400">{workspace.slug}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-white">Actividad reciente</p>
          {latestActivity.map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="font-medium text-white">{activity.action}</p>
              <p className="mt-1 text-slate-400">
                {activity.entityType} · {activity.entityId}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
