import { notFound, redirect } from "next/navigation";
import { getActiveSession } from "@/src/lib/auth";
import { AppShell } from "@/src/components/layout/app-shell";
import { listUserWorkspaces } from "@/src/services/workspaces";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
  }

  const { workspaceId } = await params;
  const workspaces = listUserWorkspaces(session);
  const currentWorkspace = workspaces.find((workspace) => workspace.id === workspaceId);

  if (!currentWorkspace) {
    notFound();
  }

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        isAdmin: session.user.isAdmin,
      }}
      workspaces={workspaces}
      currentWorkspaceId={workspaceId}
    >
      {children}
    </AppShell>
  );
}
