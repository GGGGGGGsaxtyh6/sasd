import { AuthForm } from "@/src/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),linear-gradient(180deg,#08111f_0%,#0f172a_100%)] px-4 py-10">
      <AuthForm mode="register" />
    </div>
  );
}
