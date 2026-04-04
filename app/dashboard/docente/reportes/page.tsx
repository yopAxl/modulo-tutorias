"use client";

import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { getAlumnosByDocente, getCalificacionesByDocente, formatFecha } from "@/app/_lib/mock-data";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { Download, Users, BarChart3, AlertTriangle } from "lucide-react";

const DOCENTE_ID = "d1";
const DOCENTE_NOMBRE = "Mtro. José Antonio Pérez Ruiz";
const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];

export default function ReportesDocentePage() {
  const alumnos = getAlumnosByDocente(DOCENTE_ID);
  const calificaciones = getCalificacionesByDocente(DOCENTE_ID);

  const REPORTES = [
    {
      id: "rd1",
      titulo: "Lista de grupo",
      descripcion: `${alumnos.length} alumnos con datos académicos.`,
      icono: Users,
      color: "text-pink-400 bg-pink-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Lista de Grupo",
          `Docente: ${DOCENTE_NOMBRE}`,
          ["Nombre", "Matrícula", "Carrera", "Grupo", "Promedio", "Riesgo"],
          alumnos.map((a) => [a.nombre, a.matricula, a.carrera, a.grupo, a.promedio.toFixed(1), a.riesgo]),
          "lista_grupo.pdf"
        );
      },
    },
    {
      id: "rd2",
      titulo: "Calificaciones registradas",
      descripcion: `${calificaciones.length} evaluaciones del período actual.`,
      icono: BarChart3,
      color: "text-amber-400 bg-amber-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Calificaciones Registradas",
          `Docente: ${DOCENTE_NOMBRE} · Período 2026-1`,
          ["Alumno", "Asignatura", "Calificación", "Tipo", "Fecha"],
          calificaciones.map((c) => [c.alumnoNombre, c.asignatura, c.calificacion.toFixed(1), c.tipoEvaluacion, formatFecha(c.fecha)]),
          "calificaciones_docente.pdf"
        );
      },
    },
    {
      id: "rd3",
      titulo: "Alumnos en riesgo del grupo",
      descripcion: `Alumnos con riesgo Medio y Alto.`,
      icono: AlertTriangle,
      color: "text-red-400 bg-red-500/10",
      generate: () => {
        const enRiesgo = alumnos.filter((a) => a.riesgo !== "Bajo");
        generateReportPDF(
          "Reporte: Alumnos en Riesgo – Mi Grupo",
          `Docente: ${DOCENTE_NOMBRE} · ${enRiesgo.length} alumnos`,
          ["Nombre", "Matrícula", "Promedio", "Riesgo", "Correo"],
          enRiesgo.map((a) => [a.nombre, a.matricula, a.promedio.toFixed(1), a.riesgo, a.correo]),
          "riesgo_grupo.pdf"
        );
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={DOCENTE_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader title="Reportes" subtitle="Genera reportes de tu grupo en PDF" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORTES.map((r) => {
            const Icon = r.icono;
            return (
              <SectionCard key={r.id} className="flex flex-col">
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.titulo}</p>
                      <p className="mt-0.5 text-xs text-white/40">{r.descripcion}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/6 px-5 py-3">
                  <Button
                    size="sm"
                    onClick={r.generate}
                    className="gap-2 bg-pink-600/15 text-pink-400 hover:bg-pink-600/25 border border-pink-500/20"
                    variant="outline"
                  >
                    <Download className="h-3.5 w-3.5" /> Descargar PDF
                  </Button>
                </div>
              </SectionCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
