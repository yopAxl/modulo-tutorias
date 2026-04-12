"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, FolderOpen,
  BarChart3, Settings, GraduationCap, ClipboardList,
  FileText, BookOpen, CheckSquare,
  Menu, X, LogOut, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useI18n, type Locale } from "@/app/_i18n/context";

export interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface SidebarProps {
  role: "Tutor" | "Alumno" | "Administrador" | "Docente";
  userName: string;
  navItems: NavItem[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  "📊": LayoutDashboard,
  "👥": Users,
  "📅": CalendarDays,
  "📁": FolderOpen,
  "📈": BarChart3,
  "⚙️": Settings,
  "🎓": GraduationCap,
  "📋": ClipboardList,
  "📝": FileText,
  "📚": BookOpen,
  "📄": FileText,
  "✅": CheckSquare,
};

const AVATAR_GRADIENT: Record<string, string> = {
  Tutor: "from-emerald-500 to-emerald-700",
  Alumno: "from-emerald-500 to-teal-600",
  Administrador: "from-amber-500 to-orange-600",
  Docente: "from-pink-500 to-rose-600",
};

/* ─── Language Switcher ──────────────────────────────────────────────────── */
function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/4 p-0.5">
      <button
        onClick={() => setLocale("es")}
        className={cn(
          "relative rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all duration-200",
          locale === "es"
            ? "bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10"
            : "text-white/35 hover:text-white/60"
        )}
      >
        ES
      </button>
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "relative rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all duration-200",
          locale === "en"
            ? "bg-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-500/10"
            : "text-white/35 hover:text-white/60"
        )}
      >
        EN
      </button>
    </div>
  );
}

/** Inner content shared by both desktop sidebar and mobile drawer */
function SidebarContent({
  role,
  userName,
  navItems,
  onNavClick,
}: SidebarProps & { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const [realName, setRealName] = useState(userName);
  const [loadingName, setLoadingName] = useState(true); // Nuevo estado de carga

  // Efecto dinámico para extraer el nombre de la BD basado en el rol
  useEffect(() => {
    async function fetchName() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingName(false);
        return;
      }

      let tabla = "";
      if (role === "Administrador") tabla = "administradores";
      if (role === "Tutor") tabla = "tutores";
      if (role === "Docente") tabla = "docentes";
      if (role === "Alumno") tabla = "alumnos";

      if (tabla) {
        // Consultar el esquema tutorias
        console.log(`Buscando nombre en tabla: ${tabla} para user: ${user.id}`);
        const { data, error } = await supabase
          .schema('tutorias')
          .from(tabla)
          .select('nombre_completo')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error al obtener nombre de la BD:", error.message);
        }

        console.log("Datos obtenidos:", data);

        if (data && data.nombre_completo) {
          setRealName(data.nombre_completo);
        }
      }
      setLoadingName(false); // Carga completada
    }
    fetchName();
  }, [role]);

  const initials = realName
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑa-záéíóúñ]/.test(w)) // Asegurar que funcione con minúsculas también
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    // Usamos scope local para permitir multisesiones (Vercel vs Localhost)
    await supabase.auth.signOut({ scope: 'local' });
    router.push("/login");
  }

  // Map role to translated role key
  const roleKey = role === "Administrador" ? "admin" : role.toLowerCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/6 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-white">{t("brand.name")}</p>
          <p className="truncate text-[11px] text-white/40">{t("brand.subtitle")}</p>
        </div>
      </div>

      {/* Role label + Language switcher */}
      <div className="flex items-center justify-between px-4 pb-1 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          {t("nav.panelOf", { role: t(`roles.${roleKey}`) })}
        </p>
        <LanguageSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-1">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-white/50 hover:bg-white/6 hover:text-white/90"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-emerald-400" : "text-white/40")} />
              {item.label}
            </Link>
          );
        })}

        {/* Separator + cerrar sesión */}
        <div className="my-2 h-px bg-white/6" />
        <button
          onClick={() => { onNavClick?.(); handleLogout(); }}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0 text-red-400/50" />
          {t("common.logout")}
        </button>
      </nav>

      {/* Footer / user info */}
      <div className="flex items-center gap-3 border-t border-white/6 px-4 py-4">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[12px] font-bold text-white shadow-sm",
          AVATAR_GRADIENT[role]
        )}>
          {loadingName ? <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-white/20" /> : initials}
        </div>
        <div className="min-w-0 flex-1">
          {loadingName ? (
            <div className="h-4 w-24 animate-pulse rounded-md bg-white/10 mb-1" />
          ) : (
            <p className="truncate text-[13px] font-semibold text-white/90">{realName}</p>
          )}
          <p className="text-[11px] text-white/35">{t(`roles.${roleKey}`)}</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar (md+) ──────────────────────────────────── */}
      <aside className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r border-white/6 bg-[#0f151c]">
        <SidebarContent {...props} />
      </aside>

      {/* ── Mobile top bar ────────────────────────────────────────── */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-white/6 bg-[#0f151c] px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/8 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand mark */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-500/25">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">TutorTrack</span>
        </div>
      </div>

      {/* ── Mobile overlay backdrop ───────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/6 bg-[#0f151c] transition-transform duration-300 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <SidebarContent {...props} onNavClick={() => setOpen(false)} />
      </aside>
    </>
  );
}
