"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface SidebarProps {
  role: "Tutor" | "Alumno" | "Administrador" | "Docente";
  userName: string;
  navItems: NavItem[];
}

const roleColors: Record<string, string> = {
  Tutor: "#6366f1",
  Alumno: "#22c55e",
  Administrador: "#f59e0b",
  Docente: "#ec4899",
};

export default function Sidebar({ role, userName, navItems }: SidebarProps) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <div>
          <div className="sidebar-logo-text">TutorTrack</div>
          <div className="sidebar-logo-sub">Sistema de Tutorías</div>
        </div>
      </div>

      {/* Role label */}
      <div className="sidebar-role">Panel de {role}</div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? " active" : ""}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <div className="sidebar-separator" />

        <Link href="/" className="sidebar-link">
          <span className="sidebar-link-icon">🔀</span>
          Cambiar rol (demo)
        </Link>
      </nav>

      {/* Profile */}
      <div className="sidebar-profile">
        <div
          className="sidebar-avatar"
          style={{ background: roleColors[role] }}
        >
          {initials}
        </div>
        <div className="sidebar-profile-text">
          <div className="sidebar-profile-name">{userName}</div>
          <div className="sidebar-profile-role">{role}</div>
        </div>
      </div>
    </aside>
  );
}
