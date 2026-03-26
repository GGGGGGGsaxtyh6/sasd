import Link from "next/link";
import { AuthForm } from "@/src/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center gap-8 px-6 py-12 lg:flex-row lg:items-center">
      <section className="max-w-xl space-y-5">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-400">
          Acceso seguro
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Entra a tu workspace colaborativo AI-native.
        </h1>
        <p className="text-lg text-slate-300">
          Recupera tus documentos colaborativos, tareas, comentarios, notificaciones y flujos de IA
          dentro del mismo entorno.
        </p>
        <p className="text-sm text-slate-400">
          Demo: <span className="font-medium text-slate-200">admin@example.com</span> /{" "}
          <span className="font-medium text-slate-200">Admin123456!</span>
        </p>
      </section>

      <div className="w-full max-w-md">
        <AuthForm mode="login" />
        <p className="mt-4 text-center text-sm text-slate-400">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-cyan-300 hover:text-cyan-200">
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
