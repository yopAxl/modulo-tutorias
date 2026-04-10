"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import {
  getAlumnosByTutor, getCalificacionesByAlumno, getSesionesByTutor,
  getCanalizacionesByAlumno, getIncidenciasByAlumno, getDocumentosByAlumno,
  getPlanesAccionByAlumno, formatFecha, formatTamano, TIPOS_CANALIZACION,
} from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, BookOpen, CalendarDays, AlertTriangle, ArrowRightLeft, FileText, Target, CheckCircle2 } from "lucide-react";
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

type Tab = "datos" | "calificaciones" | "sesiones" | "canalizaciones" | "incidencias" | "documentos" | "plan";

export default function ExpedientesTutorPage() {
  const alumnos = getAlumnosByTutor(TUTOR_ID);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>(alumnos[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("datos");

  const alumno = alumnos.find((a) => a.id === selectedAlumnoId);
  if (!alumno) return null;

  const calificaciones = getCalificacionesByAlumno(alumno.id);
  const sesiones = getSesionesByTutor(TUTOR_ID).filter((s) => s.alumnoId === alumno.id);
  const canalizaciones = getCanalizacionesByAlumno(alumno.id);
  const incidencias = getIncidenciasByAlumno(alumno.id);
  const documentos = getDocumentosByAlumno(alumno.id); // tutor sees all
  const planesAccion = getPlanesAccionByAlumno(alumno.id);

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "datos", label: "Datos", icon: User },
    { key: "calificaciones", label: "Calificaciones", icon: BookOpen },
    { key: "sesiones", label: "Sesiones", icon: CalendarDays },
    { key: "canalizaciones", label: "Canalizaciones", icon: ArrowRightLeft },
    { key: "incidencias", label: "Incidencias", icon: AlertTriangle },
    { key: "documentos", label: "Documentos", icon: FileText },
    { key: "plan", label: "Plan de acción", icon: Target },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={TUTOR_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader title="Expedientes" subtitle="Expediente integral por alumno" />

        {/* Alumno selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={selectedAlumnoId}
            onChange={(e) => { setSelectedAlumnoId(e.target.value); setTab("datos"); }}
            className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40"
          >
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>{a.nombre} — {a.matricula}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <GpaCell value={alumno.promedio} />
            <RiskBadge riesgo={alumno.riesgo} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-white/6 bg-white/2 p-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                tab === key ? "bg-emerald-600/15 text-emerald-400" : "text-white/40 hover:text-white/60"
              )}
            >
              <Icon className="h-3 w-3" /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "datos" && (
          <SectionCard>
            <div className="divide-y divide-white/4 px-5">
              {([
                ["Matrícula", alumno.matricula, true],
                ["Nombre completo", alumno.nombre, false],
                ["Género", alumno.genero === "M" ? "Masculino" : alumno.genero === "F" ? "Femenino" : "Otro", false],
                ["Carrera", alumno.carrera, false],
                ["Grupo", alumno.grupo, false],
                ["Cuatrimestre", `${alumno.cuatrimestre}°`, false],
                ["Correo institucional", alumno.correo, false],
                ["Teléfono", alumno.telefono, true],
              ] as [string, string, boolean][]).map(([label, value, mono]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-white/40">{label}</span>
                  <span className={cn("text-sm font-semibold text-white/90", mono && "font-mono text-xs")}>{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {tab === "calificaciones" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Asignatura", "Período", "Calificación", "Tipo", "Observaciones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.map((c) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/90">{c.asignatura}</TableCell>
                    <TableCell className="text-sm text-white/50">{c.periodo}</TableCell>
                    <TableCell><GpaCell value={c.calificacion} /></TableCell>
                    <TableCell><StatusBadge status={c.tipoEvaluacion} variant="neutral" /></TableCell>
                    <TableCell className="text-xs text-white/40">{c.observaciones || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {calificaciones.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">Sin calificaciones registradas.</p>
            )}
          </SectionCard>
        )}

        {tab === "sesiones" && (
          <SectionCard>
            <div className="divide-y divide-white/4">
              {sesiones.map((s) => (
                <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10">
                    <CalendarDays className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90">{s.temas[0]}</p>
                    <p className="mt-0.5 text-xs text-white/40">{s.acuerdos}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-[11px] text-white/35">{formatFecha(s.fecha)}</span>
                      <span className="text-[11px] text-white/35">{s.horaInicio}–{s.horaFin}</span>
                      <StatusBadge status={s.estatus} />
                    </div>
                  </div>
                </div>
              ))}
              {sesiones.length === 0 && (
                <p className="py-10 text-center text-sm text-white/30">Sin sesiones registradas.</p>
              )}
            </div>
          </SectionCard>
        )}

        {tab === "canalizaciones" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Servicio", "Fecha", "Motivo", "Estatus", "Seguimiento"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {canalizaciones.map((c) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm text-white/80">{TIPOS_CANALIZACION.find(t => t.codigo === c.tipoServicio)?.descripcion ?? c.tipoServicio}</TableCell>
                    <TableCell className="text-sm text-white/50">{formatFecha(c.fechaCanalizacion)}</TableCell>
                    <TableCell className="text-xs text-white/40 max-w-[200px]"><p className="truncate">{c.motivo}</p></TableCell>
                    <TableCell><StatusBadge status={c.estatus} /></TableCell>
                    <TableCell className="text-xs text-white/40">{c.seguimiento || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {canalizaciones.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">Sin canalizaciones registradas.</p>
            )}
          </SectionCard>
        )}

        {tab === "incidencias" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Fecha", "Tipo", "Descripción", "Estatus", "Resolución"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidencias.map((i) => (
                  <TableRow key={i.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm text-white/50">{formatFecha(i.fecha)}</TableCell>
                    <TableCell><StatusBadge status={i.tipoIncidencia} variant="neutral" /></TableCell>
                    <TableCell className="text-xs text-white/40 max-w-[200px]"><p className="truncate">{i.descripcion}</p></TableCell>
                    <TableCell><StatusBadge status={i.estatus} /></TableCell>
                    <TableCell className="text-xs text-white/40">{i.resolucion || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {incidencias.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">Sin incidencias registradas.</p>
            )}
          </SectionCard>
        )}

        {tab === "documentos" && (
          <SectionCard>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Archivo", "Tipo", "Privacidad", "Tamaño", "Fecha"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {documentos.map((d) => (
                  <TableRow key={d.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/90">{d.nombreArchivo}</TableCell>
                    <TableCell><StatusBadge status={d.tipoDocumento} variant="neutral" /></TableCell>
                    <TableCell><StatusBadge status={d.nivelPrivacidad} variant={d.nivelPrivacidad === "visible" ? "success" : "warning"} /></TableCell>
                    <TableCell className="text-xs text-white/50 font-mono">{formatTamano(d.tamanoBytes)}</TableCell>
                    <TableCell className="text-sm text-white/50">{formatFecha(d.fecha)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {documentos.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">Sin documentos registrados.</p>
            )}
          </SectionCard>
        )}

        {tab === "plan" && (
          <div className="flex flex-col gap-4">
            {planesAccion.map((p) => (
              <SectionCard key={p.id}>
                <div className="border-b border-white/6 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Plan de Acción · {p.periodo}</p>
                      <p className="text-xs text-white/40">{p.objetivoGeneral}</p>
                    </div>
                    <StatusBadge status={p.estatus} />
                  </div>
                </div>
                <div className="flex flex-col gap-3 p-5">
                  {p.metas.map((meta, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        meta.lograda ? "bg-emerald-600/20" : "bg-white/6"
                      )}>
                        <CheckCircle2 className={cn("h-3 w-3", meta.lograda ? "text-emerald-400" : "text-white/20")} />
                      </div>
                      <div>
                        <p className={cn("text-sm", meta.lograda ? "text-white/50 line-through" : "text-white/80")}>{meta.descripcion}</p>
                        <p className="text-xs text-white/30">Límite: {formatFecha(meta.fechaLimite)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 text-xs text-white/30">
                    Revisión programada: {formatFecha(p.fechaRevision)}
                  </div>
                </div>
              </SectionCard>
            ))}
            {planesAccion.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">No hay planes de acción para este alumno.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}