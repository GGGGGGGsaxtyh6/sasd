"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SessionUser = {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
};

type SessionState = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (user: SessionUser | null) => void;
};

const SessionContext = createContext<SessionState | null>(null);

async function fetchSession() {
  const response = await fetch("/api/auth/session", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar la sesión");
  }

  const payload = (await response.json()) as { session: { user: SessionUser } | null };
  return payload.session?.user ?? null;
}

export function SessionProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: SessionUser | null;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  const refresh = async () => {
    try {
      setLoading(true);
      const nextUser = await fetchSession();
      setUser(nextUser);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error de sesión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialUser) {
      void refresh();
    }
  }, [initialUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      setUser,
    }),
    [loading, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionState() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionState debe usarse dentro de SessionProvider");
  }

  return context;
}
