"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("Mi workspace");
  const [description, setDescription] = useState(
    "Espacio colaborativo para estrategia, ejecución y automatizaciones con IA.",
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo crear el workspace");
      }

      toast.success("Workspace creado");
      router.push(`/workspaces/${payload.workspace.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-8 px-6 py-12">
      <div className="space-y-3">
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Onboarding</p>
        <h1 className="text-3xl font-semibold tracking-tight">Crea tu primer workspace</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Dejamos una configuración por defecto sensata para que empieces a colaborar sin fricción.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos iniciales</CardTitle>
          <CardDescription>
            Más adelante podrás editar branding, miembros, permisos y ajustes desde el panel del workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="workspace-name">
                Nombre
              </label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="workspace-description">
                Descripción
              </label>
              <Textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                required
              />
            </div>
            <Button disabled={loading} type="submit">
              {loading ? "Creando..." : "Crear workspace"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
