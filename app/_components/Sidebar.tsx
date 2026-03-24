"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CalendarDays, FolderOpen,
  BarChart3, Settings, GraduationCap, ClipboardList,
  FileText, BookOpen, ArrowLeftRight, CheckSquare,
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
  Tutor: "from-indigo-500 to-violet-600",
  Alumno: "from-emerald-500 to-teal-600",
  Administrador: "from-amber-500 to-orange-600",
  Docente: "from-pink-500 to-rose-600",
};

export default function Sidebar({ role, userName, navItems }: SidebarProps) {
  const pathname = usePathname();

  const initials = userName
    .split(" ")
    .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))   // capital words only (skip "de", "la")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#0f1117]">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight text-white">TutorTrack</p>
          <p className="truncate text-[11px] text-white/40">Sistema de Tutorías</p>
        </div>
      </div>

      {/* Role label */}
      <p className="px-4 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
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
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-500/15 text-indigo-300"
                  : "text-white/50 hover:bg-white/[0.06] hover:text-white/90"
              )}
            >
              <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-indigo-400" : "text-white/40")} />
              {item.label}
            </Link>
          );
        })}

        {/* Separator + cambiar rol */}
        <div className="my-2 h-px bg-white/[0.06]" />
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/90"
        >
          <ArrowLeftRight className="h-4 w-4 flex-shrink-0 text-white/40" />
          Cambiar rol
        </Link>
      </nav>

      {/* Footer / user info */}
      <div className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-4">
        <div className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12px] font-bold text-white shadow-sm",
          AVATAR_GRADIENT[role]
        )}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white/90">{userName}</p>
          <p className="text-[11px] text-white/35">{role}</p>
        </div>
      </div>
    </aside>
  );
}
