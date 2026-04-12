"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { SESIONES, ALUMNOS, TUTORES, MOTIVOS_TUTORIA, formatFecha } from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";


export default function SesionesAdminPage() {
  const { t } = useI18n();

  const NAV_ITEMS = [
  { icon: "📊", label: t("nav.admin.dashboard"), href: "/dashboard/admin" },
  { icon: "👥", label: t("nav.admin.users"), href: "/dashboard/admin/usuarios" },
  { icon: "🎓", label: t("nav.admin.tutors"), href: "/dashboard/admin/tutores" },
  { icon: "📋", label: t("nav.admin.sessions"), href: "/dashboard/admin/sesiones" },
  { icon: "📈", label: t("nav.admin.reports"), href: "/dashboard/admin/reportes" },
  { icon: "📁", label: t("nav.admin.backups"), href: "/dashboard/admin/respaldos" },
  { icon: "📚", label: t("nav.admin.audit"), href: "/dashboard/admin/audit" },
  { icon: "⚙️", label: t("nav.admin.settings"), href: "/dashboard/admin/config" },
];
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todas");

  const filtered = SESIONES.filter((s) => {
    const matchSearch =
      s.alumnoNombre.toLowerCase().includes(search.toLowerCase()) ||
      (TUTORES.find((t) => t.id === s.tutorId)?.nombre ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todas" || s.estatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Sesiones de Tutoría"
          subtitle={`${SESIONES.length} sesiones registradas en el sistema`}
        />

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              placeholder="Buscar por alumno o tutor..."
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {["todas", "programada", "realizada", "cancelada", "pendiente", "no_presentado"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterStatus === s
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {s === "todas" ? "Todas" : s.replace(/_/g, " ").replace(/\b\w/, (c) => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Alumno", "Tutor", "Fecha", "Horario", "Motivos", "Urgencia", "Estatus"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const tutor = TUTORES.find((t) => t.id === s.tutorId);
                const motivoLabels = s.motivos
                  .map((m) => MOTIVOS_TUTORIA.find((mt) => mt.codigo === m)?.descripcion ?? m)
                  .join(", ");
                return (
                  <TableRow key={s.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{s.alumnoNombre}</p>
                    </TableCell>
                    <TableCell className="text-sm text-white/50">
                      {tutor?.nombre.split(" ").slice(0, 3).join(" ") ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-white/60">
                        <CalendarDays className="h-3 w-3 text-white/30" /> {formatFecha(s.fecha)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-white/50">
                        <Clock className="h-3 w-3 text-white/30" /> {s.horaInicio}–{s.horaFin}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-xs text-white/40">{motivoLabels}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={s.urgencia}
                        variant={s.urgencia === "Alta" ? "danger" : s.urgencia === "Media" ? "warning" : "success"}
                      />
                    </TableCell>
                    <TableCell><StatusBadge status={s.estatus} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-white/30">No se encontraron sesiones.</p>
          )}
        </SectionCard>
      
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}
