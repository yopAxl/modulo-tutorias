"use client";

import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { ALUMNOS, SESIONES, TUTORES, CALIFICACIONES, gpaClass, formatFecha } from "@/app/_lib/mock-data";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, CalendarDays, BarChart3 } from "lucide-react";

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

const REPORTES = [
  {
    id: "r1",
    titulo: "Alumnos en riesgo académico",
    descripcion: "Lista completa de alumnos con nivel de riesgo Medio y Alto.",
    icono: Users,
    color: "text-red-400 bg-red-500/10",
    generate: () => {
      const data = ALUMNOS.filter((a) => a.riesgo !== "Bajo");
      generateReportPDF(
        "Reporte: Alumnos en Riesgo Académico",
        `${data.length} alumnos · Generado el ${new Date().toLocaleDateString("es-MX")}`,
        ["Nombre", "Matrícula", "Carrera", "Cuatr.", "Promedio", "Riesgo"],
        data.map((a) => [a.nombre, a.matricula, a.carrera, `${a.cuatrimestre}°`, a.promedio.toFixed(1), a.riesgo]),
        "reporte_riesgo_academico.pdf"
      );
    },
  },
  {
    id: "r2",
    titulo: "Sesiones por tutor",
    descripcion: "Resumen de sesiones realizadas por cada tutor este cuatrimestre.",
    icono: CalendarDays,
    color: "text-emerald-400 bg-emerald-500/10",
    generate: () => {
      generateReportPDF(
        "Reporte: Sesiones por Tutor",
        `Cuatrimestre Enero–Abril 2026`,
        ["Tutor", "Departamento", "Alumnos", "Sesiones"],
        TUTORES.map((t) => [t.nombre, t.departamento, `${t.alumnosAsignados}`, `${t.sesionesEsteCorte}`]),
        "reporte_sesiones_tutor.pdf"
      );
    },
  },
  {
    id: "r3",
    titulo: "Calificaciones generales",
    descripcion: "Todas las calificaciones registradas en el período actual.",
    icono: BarChart3,
    color: "text-amber-400 bg-amber-500/10",
    generate: () => {
      generateReportPDF(
        "Reporte: Calificaciones Generales",
        `Período 2026-1 · ${CALIFICACIONES.length} registros`,
        ["Alumno", "Asignatura", "Calificación", "Tipo", "Fecha"],
        CALIFICACIONES.map((c) => [c.alumnoNombre, c.asignatura, c.calificacion.toFixed(1), c.tipoEvaluacion, formatFecha(c.fecha)]),
        "reporte_calificaciones.pdf"
      );
    },
  },
  {
    id: "r4",
    titulo: "Padrón de alumnos",
    descripcion: "Listado completo de alumnos activos en el sistema.",
    icono: FileText,
    color: "text-sky-400 bg-sky-500/10",
    generate: () => {
      generateReportPDF(
        "Padrón de Alumnos",
        `${ALUMNOS.length} alumnos registrados`,
        ["Nombre", "Matrícula", "Carrera", "Grupo", "Cuatr.", "Promedio", "Tutor"],
        ALUMNOS.map((a) => {
          const tutor = TUTORES.find((t) => t.id === a.tutorId);
          return [a.nombre, a.matricula, a.carrera, a.grupo, `${a.cuatrimestre}°`, a.promedio.toFixed(1), tutor?.nombre.split(" ").slice(0, 3).join(" ") ?? "—"];
        }),
        "padron_alumnos.pdf"
      );
    },
  },
];

export default function ReportesAdminPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Reportes"
          subtitle="Genera y descarga reportes en PDF del sistema"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    className="gap-2 bg-emerald-600/15 text-emerald-400 hover:bg-emerald-600/25 border border-emerald-500/20"
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
