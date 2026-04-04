// ─── Auth Mock ──────────────────────────────────────────────────────────────
// Simula autenticación con usuarios demo. Reemplazar con Supabase Auth.

export type AppRole = "rol_administrador" | "rol_tutor" | "rol_docente" | "rol_alumno";

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  nombre: string;
  role: AppRole;
  dashboardPath: string;
}

export const DEMO_USERS: DemoUser[] = [
  { id: "admin1", email: "admin@utnay.edu.mx", password: "Admin123!", nombre: "Admin General", role: "rol_administrador", dashboardPath: "/dashboard/admin" },
  { id: "t1", email: "m.rodriguez@utnay.edu.mx", password: "Tutor123!", nombre: "Dra. María Rodríguez López", role: "rol_tutor", dashboardPath: "/dashboard/tutor" },
  { id: "d1", email: "jperez@utnay.edu.mx", password: "Docente123!", nombre: "Mtro. José Antonio Pérez Ruiz", role: "rol_docente", dashboardPath: "/dashboard/docente" },
  { id: "a2", email: "agarcia@alumnos.utnay.edu.mx", password: "Alumno123!", nombre: "Axel Eduardo García Torres", role: "rol_alumno", dashboardPath: "/dashboard/alumno" },
];

const TOKEN_KEY = "tutorias_jwt";
const USER_KEY = "tutorias_user";
const SESSIONS_KEY = "tutorias_sessions";

// ─── Session ID (unique per tab) ─────────────────────────────────────────────
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

let currentSessionId: string | null = null;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  if (!currentSessionId) {
    currentSessionId = sessionStorage.getItem("tutorias_session_id");
    if (!currentSessionId) {
      currentSessionId = generateSessionId();
      sessionStorage.setItem("tutorias_session_id", currentSessionId);
    }
  }
  return currentSessionId;
}

// ─── Multi-session tracking ──────────────────────────────────────────────────

export interface SessionRecord {
  sessionId: string;
  userId: string;
  userName: string;
  role: AppRole;
  loginTime: number;
  lastActivity: number;
}

function getSessionsMap(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessionsMap(sessions: SessionRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function registerSession(user: DemoUser) {
  const sessions = getSessionsMap();
  const sid = getSessionId();
  // Remove any previous entry for this session
  const filtered = sessions.filter((s) => s.sessionId !== sid);
  filtered.push({
    sessionId: sid,
    userId: user.id,
    userName: user.nombre,
    role: user.role,
    loginTime: Date.now(),
    lastActivity: Date.now(),
  });
  saveSessionsMap(filtered);
  // Notify other tabs
  notifyOtherTabs("session_started", sid);
}

function unregisterSession() {
  const sid = getSessionId();
  const sessions = getSessionsMap().filter((s) => s.sessionId !== sid);
  saveSessionsMap(sessions);
  notifyOtherTabs("session_ended", sid);
}

/** Returns all active sessions (across multiple tabs/windows) */
export function getActiveSessions(): SessionRecord[] {
  // Clean expired sessions (> 24h)
  const sessions = getSessionsMap().filter(
    (s) => Date.now() - s.lastActivity < 86400000
  );
  saveSessionsMap(sessions);
  return sessions;
}

/** Returns the count of active sessions for the current user */
export function getActiveSessionCount(): number {
  const user = getCurrentUser();
  if (!user) return 0;
  return getActiveSessions().filter((s) => s.userId === user.id).length;
}

// ─── Cross-tab communication (BroadcastChannel) ─────────────────────────────

type SessionEvent = "session_started" | "session_ended" | "force_logout";

function notifyOtherTabs(event: SessionEvent, sessionId: string) {
  if (typeof window === "undefined") return;
  try {
    const bc = new BroadcastChannel("tutorias_auth");
    bc.postMessage({ event, sessionId, timestamp: Date.now() });
    bc.close();
  } catch {
    // BroadcastChannel not supported — fallback: ignore
  }
}

/** Listen for auth events from other tabs. Call this once in your root layout or AuthGuard. */
export function onAuthEvent(callback: (event: SessionEvent, sessionId: string) => void): () => void {
  if (typeof window === "undefined") return () => {};
  try {
    const bc = new BroadcastChannel("tutorias_auth");
    const handler = (e: MessageEvent) => {
      callback(e.data.event, e.data.sessionId);
    };
    bc.addEventListener("message", handler);
    return () => { bc.removeEventListener("message", handler); bc.close(); };
  } catch {
    return () => {};
  }
}

// ─── Core Auth Functions ─────────────────────────────────────────────────────

/** Simula un JWT mock (base64 del usuario) */
function createMockJWT(user: DemoUser): string {
  const payload = { sub: user.id, email: user.email, app_role: user.role, nombre: user.nombre, exp: Date.now() + 86400000 };
  return btoa(JSON.stringify(payload));
}

export function login(email: string, password: string): { success: boolean; user?: DemoUser; error?: string } {
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) return { success: false, error: "Correo o contraseña incorrectos" };

  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, createMockJWT(user));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    registerSession(user);
  }
  return { success: true, user };
}

export function logout() {
  if (typeof window !== "undefined") {
    unregisterSession();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as DemoUser; }
  catch { return null; }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

// ─── Role-based Route Protection ─────────────────────────────────────────────

const ROLE_ROUTES: Record<AppRole, string> = {
  rol_administrador: "/dashboard/admin",
  rol_tutor: "/dashboard/tutor",
  rol_docente: "/dashboard/docente",
  rol_alumno: "/dashboard/alumno",
};

/** Check if the current user has access to a given route path */
export function hasAccess(pathname: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (!isAuthenticated()) return false;
  const prefix = ROLE_ROUTES[user.role];
  return pathname.startsWith(prefix);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getRolLabel(role: AppRole): string {
  const map: Record<AppRole, string> = {
    rol_administrador: "Administrador",
    rol_tutor: "Tutor",
    rol_docente: "Docente",
    rol_alumno: "Alumno",
  };
  return map[role] ?? role;
}

/** Validates email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validates password (min 6 chars) */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

