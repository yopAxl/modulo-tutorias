"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, FolderOpen,
  BarChart3, Settings, GraduationCap, ClipboardList,
  FileText, BookOpen, ArrowLeftRight, CheckSquare,
  Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

/** Inner content shared by both desktop sidebar and mobile drawer */
function SidebarContent({
  role,
  userName,
  navItems,
  onNavClick,
}: SidebarProps & { onNavClick?: () => void }) {
  const pathname = usePathname();

  const initials = userName
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/6 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-white">TutorTrack</p>
          <p className="truncate text-[11px] text-white/40">Sistema de Tutorías</p>
        </div>
      </div>

      {/* Role label */}
      <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Panel de {role}
      </p>

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

        {/* Separator + cambiar rol */}
        <div className="my-2 h-px bg-white/6" />
        <Link
          href="/"
          onClick={onNavClick}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/6 hover:text-white/90"
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0 text-white/40" />
          Cambiar rol
        </Link>
      </nav>

      {/* Footer / user info */}
      <div className="flex items-center gap-3 border-t border-white/6 px-4 py-4">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-[12px] font-bold text-white shadow-sm",
          AVATAR_GRADIENT[role]
        )}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white/90">{userName}</p>
          <p className="text-[11px] text-white/35">{role}</p>
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
          aria-label="Abrir menú"
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
          aria-label="Cerrar menú"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/8 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <SidebarContent {...props} onNavClick={() => setOpen(false)} />
      </aside>
    </>
  );
}
