"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRole, getDashboardPath, type AppRole } from "@/app/_lib/auth-utils";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export type { AppRole };

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setStatus("unauthorized");
        router.replace("/login");
        return;
      }

      // Leer el rol analizando el JWT (o app_metadata en fallback)
      const role = getUserRole(user, session);

      if (!role) {
        // Usuario autenticado pero sin rol asignado
        setStatus("unauthorized");
        router.replace("/login?error=no_role");
        return;
      }

      // Verificar que el rol esté en la lista de roles permitidos
      if (allowedRoles && !allowedRoles.includes(role)) {
        // REGISTRAR EN AUDITORÍA
        await supabase.rpc('registrar_audit', {
          p_evento: 'ACCESS_DENIED',
          p_tabla: 'routes',
          p_registro_id: user.id,
          p_metadata: { 
            path: pathname, 
            role_user: role, 
            allowed: allowedRoles 
          }
        });

        // No tiene permiso para esta ruta — redirigir a SU dashboard
        router.replace(getDashboardPath(role));
        return;
      }

      setStatus("authorized");
    }

    checkAuth();

    // Escuchar cambios de sesión (logout desde otra pestaña, expiración, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setStatus("unauthorized");
        router.replace("/login");
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        checkAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname, allowedRoles]);

  // Cargando — mostrar spinner
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/10 border-t-emerald-500" />
          <p className="text-sm text-white/40">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // No autorizado — redirigiendo
  if (status === "unauthorized") {
    return null;
  }

  // Autorizado
  return <>{children}</>;
}
