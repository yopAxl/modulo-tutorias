"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { AUDIT_LOG, formatFechaHora } from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield } from "lucide-react";
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

const EVENT_VARIANT: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  login: "info",
  write: "success",
  access_denied: "danger",
};

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [filterEvento, setFilterEvento] = useState<string>("todos");

  const filtered = AUDIT_LOG.filter((e) => {
    const matchSearch =
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.tablaAfectada.toLowerCase().includes(search.toLowerCase());
    const matchEvento = filterEvento === "todos" || e.evento === filterEvento;
    return matchSearch && matchEvento;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Log de Auditoría"
          subtitle="Registro de eventos del sistema · Solo visible para administradores"
        />

        {/* Security notice */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <Shield className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">Acceso restringido</p>
            <p className="text-xs text-white/40">Este log es de solo lectura. Ningún rol puede modificar ni eliminar registros.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              placeholder="Buscar por usuario o tabla..."
            />
          </div>
          <div className="flex gap-1.5">
            {["todos", "login", "write", "access_denied"].map((ev) => (
              <button
                key={ev}
                onClick={() => setFilterEvento(ev)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterEvento === ev
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {ev === "todos" ? "Todos" : ev.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Fecha", "Usuario", "Rol", "Evento", "Tabla", "IP", "Detalles"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} className="border-white/4 hover:bg-white/3">
                  <TableCell className="whitespace-nowrap text-xs text-white/50">{formatFechaHora(e.createdAt)}</TableCell>
                  <TableCell className="text-sm font-medium text-white/80">{e.userName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] font-semibold text-white/50">
                      {e.rolActivo.replace("rol_", "")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={e.evento} variant={EVENT_VARIANT[e.evento] ?? "neutral"} />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-white/40">{e.tablaAfectada || "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-white/30">{e.ipAddress}</TableCell>
                  <TableCell className="text-xs text-white/30">
                    {Object.keys(e.metadata).length > 0
                      ? JSON.stringify(e.metadata)
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}
