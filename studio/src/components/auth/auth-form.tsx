"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      name: String(formData.get("name") ?? ""),
    };

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    setIsPending(false);

    if (!response.ok) {
      toast.error(data.error ?? "No se pudo completar la accion");
      return;
    }

    toast.success(mode === "login" ? "Sesion iniciada" : "Cuenta creada");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md border-white/10 bg-zinc-950/70 text-white shadow-2xl shadow-black/40 backdrop-blur">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Entrar a tu workspace" : "Crear cuenta"}</CardTitle>
        <CardDescription className="text-zinc-400">
          {mode === "login"
            ? "Accede a documentos colaborativos, tareas y copiloto IA."
            : "Empieza con un workspace compartido listo para colaborar."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-200" htmlFor="name">
                Nombre
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Tu nombre"
                required
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="equipo@nebula.app"
              required
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimo 8 caracteres"
              required
              className="border-white/10 bg-white/5 text-white"
            />
          </div>

          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
