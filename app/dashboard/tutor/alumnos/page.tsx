"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { getAlumnosByTutor, getCanalizacionesByAlumno, getIncidenciasByAlumno, getSesionesByTutor, TIPOS_CANALIZACION } from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronDown, ChevronUp, CalendarDays, AlertTriangle, ArrowRightLeft, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const TUTOR_ID = "t1";
const TUTOR_NOMBRE = "Dra. María Rodríguez López";
const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones", href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: "Expedientes", href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: "Reportes", href: "/dashboard/tutor/reportes" },
];

export default function AlumnosTutorPage() {
  const alumnos = getAlumnosByTutor(TUTOR_ID);
  const [search, setSearch] = useState("");
  const [filterRiesgo, setFilterRiesgo] = useState<string>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = alumnos.filter((a) => {
    const matchSearch = a.nombre.toLowerCase().includes(search.toLowerCase()) || a.matricula.toLowerCase().includes(search.toLowerCase());
    const matchRiesgo = filterRiesgo === "todos" || a.riesgo === filterRiesgo;
    return matchSearch && matchRiesgo;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={TUTOR_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Mis Alumnos"
          subtitle={`${alumnos.length} alumnos asignados este cuatrimestre`}
        />

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              placeholder="Buscar por nombre o matrícula..."
            />
          </div>
          <div className="flex gap-1.5">
            {["todos", "Alto", "Medio", "Bajo"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRiesgo(r)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterRiesgo === r ? "bg-emerald-600/15 text-emerald-400" : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {r === "todos" ? "Todos" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Alumno cards */}
        <div className="flex flex-col gap-3">
          {filtered.map((a) => {
            const isExpanded = expandedId === a.id;
            const sesiones = getSesionesByTutor(TUTOR_ID).filter((s) => s.alumnoId === a.id);
            const canalizaciones = getCanalizacionesByAlumno(a.id);
            const incidencias = getIncidenciasByAlumno(a.id);

            return (
              <SectionCard key={a.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-sm font-bold text-emerald-400">
                    {a.nombre.split(" ").slice(0, 2).map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{a.nombre}</p>
                    <p className="text-xs text-white/40">{a.matricula} · {a.carrera} · {a.cuatrimestre}° cuatrimestre</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <GpaCell value={a.promedio} />
                    <RiskBadge riesgo={a.riesgo} />
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/6 px-5 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Contact info */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Contacto</p>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Mail className="h-3 w-3 text-white/30" /> {a.correo}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Phone className="h-3 w-3 text-white/30" /> {a.telefono}
                        </div>
                        <div className="text-xs text-white/50">
                          <span className="text-white/30">Grupo:</span> {a.grupo}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Historial</p>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <CalendarDays className="h-3 w-3 text-white/30" /> {sesiones.length} sesiones registradas
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <AlertTriangle className="h-3 w-3 text-white/30" /> {incidencias.length} incidencias
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <ArrowRightLeft className="h-3 w-3 text-white/30" /> {canalizaciones.length} canalizaciones
                        </div>
                      </div>

                      {/* Canalizaciones */}
                      {canalizaciones.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Canalizaciones activas</p>
                          {canalizaciones.map((c) => (
                            <div key={c.id} className="flex items-center gap-2">
                              <StatusBadge status={c.estatus} />
                              <span className="text-xs text-white/50">
                                {TIPOS_CANALIZACION.find(t => t.codigo === c.tipoServicio)?.descripcion ?? c.tipoServicio}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-white/30">No se encontraron alumnos.</p>
        )}
      </main>
    </div>
  );
}
