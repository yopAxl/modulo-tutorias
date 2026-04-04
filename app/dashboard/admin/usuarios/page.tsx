"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { ALUMNOS, TUTORES, DOCENTES } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, X, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/admin" },
  { icon: "👥", label: "Usuarios", href: "/dashboard/admin/usuarios" },
  { icon: "🎓", label: "Tutores", href: "/dashboard/admin/tutores" },
  { icon: "📋", label: "Sesiones", href: "/dashboard/admin/sesiones" },
  { icon: "📈", label: "Reportes", href: "/dashboard/admin/reportes" },
  { icon: "📁", label: "Respaldos", href: "/dashboard/admin/respaldos" },
  { icon: "📚", label: "Auditoría", href: "/dashboard/admin/audit" },
  { icon: "⚙️", label: "Configuración", href: "/dashboard/admin/config" },
];

type UserRow = { id: string; nombre: string; correo: string; rol: string; departamento?: string; activo: boolean };

function buildUserRows(): UserRow[] {
  const rows: UserRow[] = [];
  rows.push({ id: "admin1", nombre: "Admin General", correo: "admin@utnay.edu.mx", rol: "Administrador", activo: true });
  TUTORES.forEach((t) => rows.push({ id: t.id, nombre: t.nombre, correo: t.correo, rol: "Tutor", departamento: t.departamento, activo: t.activo }));
  DOCENTES.forEach((d) => rows.push({ id: d.id, nombre: d.nombre, correo: d.correo, rol: "Docente", departamento: d.departamento, activo: d.activo }));
  ALUMNOS.forEach((a) => rows.push({ id: a.id, nombre: a.nombre, correo: a.correo, rol: "Alumno", activo: a.activo }));
  return rows;
}

const ROLE_COLOR: Record<string, string> = {
  Administrador: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Tutor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Docente: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Alumno: "bg-sky-500/10 text-sky-400 border-sky-500/20",
};

export default function UsuariosPage() {
  const allUsers = buildUserRows();
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("todos");
  const [showForm, setShowForm] = useState(false);

  const filtered = allUsers.filter((u) => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) || u.correo.toLowerCase().includes(search.toLowerCase());
    const matchRol = filterRol === "todos" || u.rol === filterRol;
    return matchSearch && matchRol;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Gestión de Usuarios"
          subtitle={`${allUsers.length} usuarios registrados en el sistema`}
          actions={
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <UserPlus className="h-4 w-4" /> Nuevo usuario
            </Button>
          }
        />

        {/* Create user form */}
        {showForm && (
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Crear nuevo usuario</p>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Nombre completo</label>
                <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40" placeholder="Nombre completo" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Correo electrónico</label>
                <input type="email" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40" placeholder="correo@utnay.edu.mx" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Rol</label>
                <select className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40">
                  <option value="">Seleccionar rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Docente">Docente</option>
                  <option value="Alumno">Alumno</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Departamento</label>
                <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40" placeholder="Departamento (opcional)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Contraseña</label>
                <input type="password" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40" placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="flex items-end">
                <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Crear usuario
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              placeholder="Buscar por nombre o correo..."
            />
          </div>
          <div className="flex gap-1.5">
            {["todos", "Administrador", "Tutor", "Docente", "Alumno"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRol(r)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterRol === r
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {r === "todos" ? "Todos" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Usuario", "Correo", "Rol", "Departamento", "Estado"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id} className="border-white/4 hover:bg-white/3">
                  <TableCell className="text-sm font-medium text-white/90">{u.nombre}</TableCell>
                  <TableCell className="text-sm text-white/50">{u.correo}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", ROLE_COLOR[u.rol] ?? "")}>
                      <Shield className="h-3 w-3" /> {u.rol}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/40">{u.departamento ?? "—"}</TableCell>
                  <TableCell><StatusBadge status={u.activo ? "activo" : "inactivo"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-white/30">No se encontraron usuarios.</p>
          )}
        </SectionCard>
      </main>
    </div>
  );
}
