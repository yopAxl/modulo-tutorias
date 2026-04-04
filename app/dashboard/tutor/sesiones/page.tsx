"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { getSesionesByTutor, getAlumnosByTutor, ALUMNOS, MOTIVOS_TUTORIA, formatFecha } from "@/app/_lib/mock-data";
import { generateSesionPDF } from "@/app/_lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarDays, Clock, Download, X, CheckCircle2, FileText } from "lucide-react";
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

export default function SesionesTutorPage() {
  const sesiones = getSesionesByTutor(TUTOR_ID);
  const misAlumnos = getAlumnosByTutor(TUTOR_ID);
  const [showForm, setShowForm] = useState(false);
  const [selectedMotivos, setSelectedMotivos] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("todas");

  const filtered = sesiones.filter(
    (s) => filterStatus === "todas" || s.estatus === filterStatus
  );

  function toggleMotivo(codigo: string) {
    setSelectedMotivos((prev) =>
      prev.includes(codigo) ? prev.filter((m) => m !== codigo) : [...prev, codigo]
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={TUTOR_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Sesiones de Tutoría"
          subtitle={`${sesiones.length} sesiones registradas`}
          actions={
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" /> Nueva sesión
            </Button>
          }
        />

        {/* ── Formulario R07-M01-01 ──────────────────────────────── */}
        {showForm && (
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Nueva Sesión de Tutoría</p>
                <p className="text-xs text-white/40">Formato R07-M01-01</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-5">
              {/* Row 1: Alumno + Carrera + Grupo */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5 sm:col-span-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Nombre del alumno</label>
                  <select className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40">
                    <option value="">Seleccionar alumno</option>
                    {misAlumnos.map((a) => (
                      <option key={a.id} value={a.id}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Carrera</label>
                  <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white/60 outline-none" placeholder="IDGS" readOnly />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Grupo</label>
                  <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white/60 outline-none" placeholder="8" readOnly />
                </div>
              </div>

              {/* Row 2: Fecha + Hr Inicio + Hr Salida */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Fecha</label>
                  <input type="date" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Hr. Inicio</label>
                  <input type="time" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Hr. Salida</label>
                  <input type="time" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40" />
                </div>
              </div>

              {/* Row 3: Motivo de la tutoría (checkboxes) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Motivo de la tutoría</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {MOTIVOS_TUTORIA.map((m) => (
                    <label
                      key={m.codigo}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                        selectedMotivos.includes(m.codigo)
                          ? "border-emerald-500/30 bg-emerald-600/10 text-emerald-400"
                          : "border-white/6 bg-white/2 text-white/50 hover:border-white/12"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMotivos.includes(m.codigo)}
                        onChange={() => toggleMotivo(m.codigo)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        selectedMotivos.includes(m.codigo)
                          ? "border-emerald-500 bg-emerald-600"
                          : "border-white/20 bg-white/5"
                      )}>
                        {selectedMotivos.includes(m.codigo) && (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        )}
                      </div>
                      {m.descripcion}
                    </label>
                  ))}
                </div>
              </div>

              {/* Row 4: Nivel de urgencia */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Nivel de urgencia</label>
                <select className="w-full rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40 sm:w-48">
                  <option value="Baja">Normal</option>
                  <option value="Media">Medio</option>
                  <option value="Alta">Urgente</option>
                </select>
              </div>

              {/* Row 5: Puntos relevantes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Puntos relevantes de la sesión</label>
                <textarea
                  rows={4}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none resize-none focus:border-emerald-500/40"
                  placeholder="Describa los puntos relevantes tratados durante la sesión..."
                />
              </div>

              {/* Row 6: Compromisos y acuerdos */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Compromisos y acuerdos</label>
                <textarea
                  rows={3}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none resize-none focus:border-emerald-500/40"
                  placeholder="Registre los compromisos y acuerdos establecidos..."
                />
              </div>

              {/* Row 7: Firmas digitales */}
              <div className="flex items-center gap-6 rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                <label className="flex items-center gap-2 text-xs text-white/50">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                  Confirmación del tutor (firma digital)
                </label>
                <label className="flex items-center gap-2 text-xs text-white/50">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/5 accent-emerald-500" />
                  Confirmación del alumno (firma digital)
                </label>
              </div>

              {/* Submit */}
              <div className="flex gap-3">
                <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Registrar sesión
                </Button>
                <Button size="sm" variant="outline" className="gap-2 border-white/10 bg-white/4 text-white/60 hover:bg-white/8">
                  Cancelar
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto">
          {["todas", "programada", "realizada", "cancelada", "pendiente"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filterStatus === s ? "bg-emerald-600/15 text-emerald-400" : "text-white/40 hover:bg-white/6 hover:text-white/60"
              )}
            >
              {s === "todas" ? "Todas" : s.replace(/\b\w/, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Sessions table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Alumno", "Fecha", "Horario", "Motivos", "Urgencia", "Estatus", "PDF"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const alumno = ALUMNOS.find((a) => a.id === s.alumnoId);
                const motivoLabels = s.motivos
                  .map((m) => MOTIVOS_TUTORIA.find((mt) => mt.codigo === m)?.descripcion ?? m)
                  .join(", ");

                return (
                  <TableRow key={s.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{s.alumnoNombre}</p>
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
                    <TableCell className="max-w-[180px]">
                      <p className="truncate text-xs text-white/40">{motivoLabels}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={s.urgencia}
                        variant={s.urgencia === "Alta" ? "danger" : s.urgencia === "Media" ? "warning" : "success"}
                      />
                    </TableCell>
                    <TableCell><StatusBadge status={s.estatus} /></TableCell>
                    <TableCell>
                      {alumno && s.estatus === "realizada" && (
                        <button
                          onClick={() => generateSesionPDF(s, alumno)}
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <FileText className="h-3 w-3" /> PDF
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}
