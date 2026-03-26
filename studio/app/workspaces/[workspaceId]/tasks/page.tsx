import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveSession } from "@/src/lib/auth";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { listWorkspaceTasks } from "@/src/services/workspaces";

type Props = {
  params: Promise<{ workspaceId: string }>;
};

export default async function TasksPage({ params }: Props) {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
  }
  const activeSession = session;
  const { workspaceId } = await params;
  const tasks = listWorkspaceTasks(activeSession, workspaceId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Tareas y proyectos</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sigue el trabajo operativo del workspace con prioridades, estados y responsables.
          </p>
        </div>
        <Link
          href={`/workspaces/${workspaceId}`}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-400"
        >
          Volver al overview
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tasks.map((task) => (
          <Card key={task.id} className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{task.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{task.description}</p>
              </div>
              <Badge>{task.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <Badge variant="secondary">{task.priority}</Badge>
              {task.assigneeId ? <Badge variant="secondary">Assignee {task.assigneeId.slice(0, 8)}</Badge> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
