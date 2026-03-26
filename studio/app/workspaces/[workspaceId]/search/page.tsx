import { getActiveSession } from "@/src/lib/auth";
import { redirect } from "next/navigation";
import { searchWorkspace } from "@/src/services/workspaces";
import { AppShell } from "@/src/components/layout/app-shell";
import { Card } from "@/src/components/ui/card";

type SearchRow = {
  entity_type: string;
  entity_id: string;
  title: string | null;
  body: string | null;
  snippet: string | null;
};

type Props = {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function WorkspaceSearchPage({ params, searchParams }: Props) {
  const session = await getActiveSession();
  if (!session) {
    redirect("/login");
  }
  const { workspaceId } = await params;
  const { q = "" } = await searchParams;
  const results = (q ? searchWorkspace(session, workspaceId, q) : []) as SearchRow[];

  return (
    <AppShell user={session.user}>
      <div className="space-y-6">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Busqueda</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Explora el contexto del workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Busca documentos y tareas indexados en FTS5.
          </p>
        </header>

        <form className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar lanzamientos, riesgos, tareas..."
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          />
        </form>

        <div className="grid gap-4">
          {results.map((result) => (
            <Card key={`${String(result.entity_type)}-${String(result.entity_id)}`} className="p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {String(result.entity_type)}
                </span>
                <h2 className="text-lg font-medium text-white">{String(result.title)}</h2>
              </div>
              <div
                className="mt-3 text-sm text-slate-300 [&_mark]:rounded-sm [&_mark]:bg-cyan-400/20 [&_mark]:px-1 [&_mark]:text-cyan-100"
                dangerouslySetInnerHTML={{ __html: String(result.snippet ?? result.body ?? "") }}
              />
            </Card>
          ))}
          {!results.length && (
            <Card className="p-5 text-sm text-slate-400">
              {q ? "No hay resultados para esa consulta." : "Escribe una consulta para empezar."}
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
