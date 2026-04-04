"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, getCurrentUser, hasAccess, onAuthEvent, logout, getActiveSessions, getRolLabel } from "@/app/_lib/auth";
import type { AppRole } from "@/app/_lib/auth";
import { Shield, LogOut, Monitor } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);

  // Must mount first — localStorage is not available during SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute auth status synchronously once mounted (no async, no waiting)
  const getAuthStatus = useCallback((): "loading" | "authorized" | "unauthorized" | "wrong_role" => {
    if (!mounted) return "loading";

    if (!isAuthenticated()) return "unauthorized";

    const user = getCurrentUser();
    if (!user) return "unauthorized";

    if (allowedRoles && !allowedRoles.includes(user.role)) return "wrong_role";

    if (!hasAccess(pathname)) return "wrong_role";

    return "authorized";
  }, [mounted, pathname, allowedRoles]);

  const status = getAuthStatus();

  // Handle redirects and side effects
  useEffect(() => {
    if (!mounted) return;

    if (status === "unauthorized") {
      router.replace("/login");
      return;
    }

    if (status === "authorized") {
      const user = getCurrentUser();
      if (user) {
        const sessions = getActiveSessions().filter((s) => s.userId === user.id);
        if (sessions.length > 1) setSessionWarning(true);
      }
    }

    // Listen for cross-tab auth events
    const unsubscribe = onAuthEvent((event) => {
      if (event === "force_logout") {
        logout();
        router.replace("/login");
      }
      if (event === "session_started") {
        const user = getCurrentUser();
        if (user) {
          const activeSessions = getActiveSessions().filter((s) => s.userId === user.id);
          if (activeSessions.length > 1) setSessionWarning(true);
        }
      }
    });

    return unsubscribe;
  }, [mounted, status, router]);

  // Not mounted yet (SSR) — show nothing to avoid flash
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/10 border-t-emerald-500" />
          <p className="text-sm text-white/40">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Wrong role
  if (status === "wrong_role") {
    const user = getCurrentUser();
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c] px-4">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Acceso denegado</h1>
            <p className="mt-2 text-sm text-white/50">
              No tienes permisos para acceder a esta sección.
              {user && (
                <> Tu rol es <span className="font-semibold text-white/70">{getRolLabel(user.role)}</span>.</>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { if (user) router.push(user.dashboardPath); }}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500"
            >
              Ir a mi panel
            </button>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized — redirect happening via useEffect
  if (status === "unauthorized") {
    return null;
  }

  // Authorized
  return (
    <>
      {sessionWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-3 bg-amber-600/90 px-4 py-2 backdrop-blur-sm">
          <Monitor className="h-4 w-4 shrink-0 text-white" />
          <p className="text-xs font-medium text-white">
            Sesión activa en otra pestaña o dispositivo.
            Los cambios realizados podrían no sincronizarse.
          </p>
          <button
            onClick={() => setSessionWarning(false)}
            className="ml-2 rounded bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-white/30"
          >
            Entendido
          </button>
        </div>
      )}
      {children}
    </>
  );
}
