// ─── Auth Utilities (Real — Supabase) ────────────────────────────────────────
// Utilidades de autenticación para detección de roles dinámicos desde el JWT.

export type AppRole = "administrador" | "tutor" | "docente" | "alumno";

// ─── Mapa rol → ruta de dashboard ────────────────────────────────────────────
const ROLE_ROUTES: Record<AppRole, string> = {
  administrador: "/dashboard/admin",
  tutor: "/dashboard/tutor",
  docente: "/dashboard/docente",
  alumno: "/dashboard/alumno",
};

const VALID_ROLES = new Set<string>(Object.keys(ROLE_ROUTES));

// ─── Descodificar JWT de forma segura (sin dependencias extra) ───────────────
export function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// ─── Extraer el rol del JWT ──────────────────────────────────────────────────
export function getUserRole(user: any | null, session?: any | null): AppRole | null {
  if (!user && !session) return null;
  
  let roleStr: string | undefined = undefined;

  // 1. Intentamos leer el token decodificado de la sesión (donde los hooks de root guardan custom claims)
  if (session?.access_token) {
    const decoded = decodeJwt(session.access_token);
    roleStr = decoded?.app_role || decoded?.app_metadata?.app_role;
  }
  
  // 2. Fall-back: leemos del objeto user.app_metadata clásico
  if (!roleStr && user?.app_metadata) {
    roleStr = user.app_metadata.app_role;
  }

  // Comprobar validez
  if (typeof roleStr === "string" && VALID_ROLES.has(roleStr)) return roleStr as AppRole;
  
  return null;
}

// ─── Obtener la ruta de dashboard según el rol ───────────────────────────────
export function getDashboardPath(role: AppRole): string {
  return ROLE_ROUTES[role];
}

// ─── Labels legibles ─────────────────────────────────────────────────────────
const ROLE_LABELS: Record<AppRole, string> = {
  administrador: "Administrador",
  tutor: "Tutor",
  docente: "Docente",
  alumno: "Alumno",
};

export function getRolLabel(role: AppRole): string {
  return ROLE_LABELS[role] ?? role;
}

// ─── Sidebar role label (sin prefijo "rol_") ─────────────────────────────────
export type SidebarRole = "Administrador" | "Tutor" | "Docente" | "Alumno";

export function getSidebarRole(role: AppRole): SidebarRole {
  return ROLE_LABELS[role] as SidebarRole;
}

// ─── Helpers de validación ───────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
