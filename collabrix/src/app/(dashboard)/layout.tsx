import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardShell, type ShellWorkspace } from "@/components/layout/DashboardShell";

export const dynamic = "force-dynamic";

type WorkspacePayload = {
  id: string;
  name: string;
  slug: string;
  role?: string;
};

async function fetchWorkspacesForRequest(): Promise<ShellWorkspace[]> {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";
  if (!host) return [];
  const res = await fetch(`${proto}://${host}/api/workspaces`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const raw = (await res.json()) as WorkspacePayload[];
  return raw.map((w) => ({
    id: w.id,
    name: w.name,
    slug: w.slug,
    role: w.role ?? "editor",
  }));
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await fetchWorkspacesForRequest();

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? "User",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
        role: (session.user as { role?: string }).role ?? "user",
      }}
      workspaces={workspaces}
    >
      {children}
    </DashboardShell>
  );
}
