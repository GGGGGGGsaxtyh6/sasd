import Link from "next/link";
import { ArrowRight, Bot, FileText, LayoutGrid, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";

const features = [
  {
    icon: Users,
    title: "Colaboración multiusuario",
    description: "Edición en tiempo real con presencia viva y comentarios enlazados al contenido.",
  },
  {
    icon: FileText,
    title: "Docs, canvas y tareas",
    description: "Una sola base de trabajo para specs, tableros de ejecución y actividad reciente.",
  },
  {
    icon: Bot,
    title: "IA integrada",
    description: "Resumen, reescritura, clasificación, generación y respuestas contextualizadas.",
  },
  {
    icon: ShieldCheck,
    title: "Permisos reales",
    description: "Roles por workspace y permisos por documento para equipos mixtos y revisores.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(180deg,#050816_0%,#0b1020_100%)] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8 md:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold">Nebula Workspace</p>
              <p className="text-sm text-white/60">Editor colaborativo + tareas + IA + actividad</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 transition hover:text-white">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-white/90"
            >
              Crear cuenta
            </Link>
          </div>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-100">
              <LayoutGrid className="size-4" />
              Plataforma AI-native para coordinación de producto
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance md:text-7xl">
                Documentos, canvas, tareas y copiloto IA en un mismo workspace vivo.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/70">
                Nebula combina colaboración CRDT, comentarios en tiempo real, búsqueda full-text, uploads,
                actividad reciente y acciones de IA sobre el contenido del equipo.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-indigo-500 px-7 text-base font-medium text-white transition hover:bg-indigo-400"
              >
                <span>Empezar ahora</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white/10 px-7 text-base font-medium text-white transition hover:bg-white/15"
              >
                Entrar al demo
              </Link>
            </div>
          </div>

          <Card className="border-white/10 bg-white/6 shadow-2xl shadow-indigo-950/40">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Vista del workspace</CardTitle>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  En tiempo real
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Estrategia Q2</p>
                    <p className="text-sm text-white/50">3 usuarios conectados · 2 comentarios activos</p>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="size-9 rounded-full border border-slate-950 bg-indigo-500" />
                    <div className="size-9 rounded-full border border-slate-950 bg-pink-500" />
                    <div className="size-9 rounded-full border border-slate-950 bg-emerald-500" />
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-white/70">
                  <p>• Priorizar activación colaborativa del primer documento.</p>
                  <p>• Convertir comentarios en tareas con seguimiento visible.</p>
                  <p>• Usar IA para resumir feedback y preparar handoff semanal.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Backlog</p>
                  <p className="mt-2 text-3xl font-semibold text-white">12</p>
                  <p className="mt-1 text-sm text-white/60">Tareas sincronizadas con actividad y comentarios</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">IA</p>
                  <p className="mt-2 text-3xl font-semibold text-white">Streaming</p>
                  <p className="mt-1 text-sm text-white/60">Respuestas contextuales dentro del workspace</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 pb-16 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-white/10 bg-white/5">
                <CardContent className="space-y-4 p-6">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
                    <p className="text-sm leading-7 text-white/65">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </section>
    </main>
  );
}
