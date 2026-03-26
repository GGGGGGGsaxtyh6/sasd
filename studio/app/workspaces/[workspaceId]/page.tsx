import { redirect } from "next/navigation";
import { getActiveSession } from "@/src/lib/auth";
import { AppShell } from "@/src/components/layout/app-shell";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { listNotifications } from "@/src/services/workspaces";
import { getWorkspaceOverview } from "@/src/services/workspaces";

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await getActiveSession();
  if (!session) redirect("/login");

  const { workspaceId } = await params;
  const overview = getWorkspaceOverview(session, workspaceId);
  const notifications = listNotifications(session).slice(0, 5);

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        isAdmin: session.user.isAdmin,
      }}
      currentWorkspaceId={workspaceId}
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{overview.workspace.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>{overview.workspace.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge>Plan {overview.workspace.plan}</Badge>
                <Badge>Rol {overview.membership.role}</Badge>
                <Badge>{overview.stats.memberCount} miembros</Badge>
                <Badge>{overview.stats.documentCount} documentos</Badge>
                <Badge>{overview.stats.taskCount} tareas</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {notifications.length === 0 ? (
                <p className="text-white/50">Todo al día.</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-white/60">{notification.body}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {overview.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-white/60">
                    {activity.entityType} · {activity.entityId}
                  </p>
                </div>
                <Badge>{new Date(activity.createdAt).toLocaleString("es-ES")}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {overview.recentDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{document.title}</p>
                  <p className="text-white/60">{document.summary}</p>
                </div>
                <Badge>documento</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
