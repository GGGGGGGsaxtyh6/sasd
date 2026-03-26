import { redirect } from "next/navigation";
import { getActiveSession } from "@/src/lib/auth";
import { Card } from "@/src/components/ui/card";
import { listWorkspaceMembers } from "@/src/services/workspaces";

type WorkspaceMemberView = {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string;
};

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
  }
  const { workspaceId } = await params;
  const members = listWorkspaceMembers(session, workspaceId) as WorkspaceMemberView[];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80">Ajustes</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Miembros y configuracion</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Gestiona roles del workspace y revisa que la colaboracion y los permisos esten bien
          configurados.
        </p>
      </div>

      <Card className="p-5">
        <div className="grid gap-3">
          {members.map((member) => (
            <div
              key={String(member.id)}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{String(member.name)}</p>
                <p className="text-sm text-slate-400">{String(member.email)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium capitalize text-cyan-200">{String(member.role)}</p>
                <p className="text-xs text-slate-500">{String(member.title)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
