"use client";

import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import {
  ALUMNOS, getCalificacionesByAlumno, getPlanesAccionByAlumno, formatFecha
} from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const FallbackAlumno = {
  id: "a1", matricula: "—", nombre: "Alumno (Sin datos)",
  genero: "M", carrera: "—", grupo: "—", cuatrimestre: 1,
  promedio: 0, riesgo: "Bajo" as const,
  correo: "—", telefono: "—",
  tutorId: "t1", docenteId: "d1", activo: true,
};
const ALUMNO_ID = "a1";
const alumno = ALUMNOS.find((a) => a.id === ALUMNO_ID) || FallbackAlumno;
const calificaciones = getCalificacionesByAlumno(ALUMNO_ID);
const planesAccion = getPlanesAccionByAlumno(ALUMNO_ID);

const NAV_ITEMS = [
  { icon: "📊", label: "Mi panel", href: "/dashboard/alumno" },
  { icon: "📅", label: "Mis sesiones", href: "/dashboard/alumno/sesiones" },
  { icon: "📁", label: "Expediente", href: "/dashboard/alumno/expediente" },
  { icon: "📄", label: "Documentos", href: "/dashboard/alumno/documentos" },
];

export default function ExpedienteAlumnoPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Alumno" userName={alumno.nombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader title="Mi Expediente Académico" subtitle="Vista de solo lectura de tu información" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Personal info */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Datos personales</p>
            </div>
            <div className="divide-y divide-white/4 px-5">
              {([
                ["Matrícula", alumno.matricula, true],
                ["Nombre", alumno.nombre, false],
                ["Carrera", alumno.carrera, false],
                ["Grupo", alumno.grupo, false],
                ["Cuatrimestre", `${alumno.cuatrimestre}°`, false],
                ["Correo", alumno.correo, false],
                ["Teléfono", alumno.telefono, true],
              ] as [string, string, boolean][]).map(([label, value, mono]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-white/40">{label}</span>
                  <span className={cn("text-sm font-semibold text-white/90", mono && "font-mono text-xs")}>{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-medium text-white/40">Promedio</span>
                <GpaCell value={alumno.promedio} />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs font-medium text-white/40">Riesgo académico</span>
                <RiskBadge riesgo={alumno.riesgo} />
              </div>
            </div>
          </SectionCard>

          {/* Calificaciones */}
          <SectionCard>
            <div className="border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Mis calificaciones</p>
              <p className="text-xs text-white/40">{calificaciones.length} materias registradas</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Asignatura", "Período", "Cal.", "Tipo"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {calificaciones.map((c) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/80">{c.asignatura}</TableCell>
                    <TableCell className="text-sm text-white/50">{c.periodo}</TableCell>
                    <TableCell><GpaCell value={c.calificacion} /></TableCell>
                    <TableCell><StatusBadge status={c.tipoEvaluacion} variant="neutral" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {calificaciones.length === 0 && (
              <p className="py-10 text-center text-sm text-white/30">Sin calificaciones registradas.</p>
            )}
          </SectionCard>
        </div>

        {/* Plan de acción */}
        {planesAccion.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <p className="text-sm font-semibold text-white">Mi Plan de Acción</p>
            </div>
            {planesAccion.map((p) => (
              <SectionCard key={p.id}>
                <div className="border-b border-white/6 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">Período {p.periodo}</p>
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
                        <p className="text-xs text-white/30">Fecha límite: {formatFecha(meta.fechaLimite)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
