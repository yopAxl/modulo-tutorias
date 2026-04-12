"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { formatFecha } from "@/app/_lib/mock-data";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, CalendarDays, BarChart3, Loader2 } from "lucide-react";
import { 
  getRiskReportData, 
  getSessionsByTutorReportData, 
  getQualificationsReportData, 
  getStudentRosterReportData 
} from "./actions";
import { toast } from "sonner";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";


export default function ReportesAdminPage() {
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
  const [loadingReport, setLoadingReport] = useState<string | null>(null);

  const handleGenerateReport = async (reportId: string) => {
    setLoadingReport(reportId);
    try {
      if (reportId === "r1") {
        const data = await getRiskReportData();
        if ("error" in data) throw new Error(data.error);
        
        await generateReportPDF(
          "Reporte: Alumnos en Riesgo Académico",
          `${data.length} alumnos · Generado el ${new Date().toLocaleDateString("es-MX")}`,
          ["Nombre", "Matrícula", "Carrera", "Cuatr.", "Promedio", "Riesgo"],
          data.map((a: any) => [
            a.nombre_completo, 
            a.matricula, 
            a.carrera, 
            `${a.cuatrimestre}°`, 
            Number(a.promedio_general).toFixed(1), 
            a.riesgo_academico.toUpperCase()
          ]),
          "reporte_riesgo_academico.pdf"
        );
      } 
      else if (reportId === "r2") {
        const data = await getSessionsByTutorReportData();
        if ("error" in data) throw new Error(data.error);

        await generateReportPDF(
          "Reporte: Sesiones por Tutor",
          `Cuatrimestre Enero–Abril 2026`,
          ["Tutor", "Departamento", "Alumnos Asignados", "Sesiones Realizadas"],
          data.map((t: any) => [
            t.nombre, 
            t.departamento, 
            String(t.alumnos), 
            String(t.sesiones)
          ]),
          "reporte_sesiones_tutor.pdf"
        );
      }
      else if (reportId === "r3") {
        const data = await getQualificationsReportData();
        if ("error" in data) throw new Error(data.error);

        await generateReportPDF(
          "Reporte: Calificaciones Generales",
          `Período 2026-1 · ${data.length} registros`,
          ["Alumno", "Asignatura", "Calificación", "Tipo", "Fecha Registro"],
          data.map((c: any) => [
            c.alumnoNombre, 
            c.asignatura, 
            Number(c.calificacion).toFixed(1), 
            c.tipo.toUpperCase(), 
            new Date(c.fecha).toLocaleDateString("es-MX")
          ]),
          "reporte_calificaciones.pdf"
        );
      }
      else if (reportId === "r4") {
        const data = await getStudentRosterReportData();
        if ("error" in data) throw new Error(data.error);

        await generateReportPDF(
          "Padrón de Alumnos",
          `${data.length} alumnos registrados`,
          ["Nombre", "Matrícula", "Carrera", "Grupo", "Cuatr.", "Promedio", "Tutor Asignado"],
          data.map((a: any) => [
            a.nombre, 
            a.matricula, 
            a.carrera, 
            a.grupo, 
            `${a.cuatrimestre}°`, 
            Number(a.promedio).toFixed(1), 
            a.tutor
          ]),
          "padron_alumnos.pdf"
        );
      }
      toast.success("Documento generado con éxito");
    } catch (error: any) {
      console.error(error);
      toast.error("Error al generar el PDF: " + error.message);
    } finally {
      setLoadingReport(null);
    }
  };

  const REPORTES_CONFIG = [
    {
      id: "r1",
      titulo: "Alumnos en riesgo académico",
      descripcion: "Lista completa de alumnos con nivel de riesgo Medio y Alto.",
      icono: Users,
      color: "text-red-400 bg-red-500/10",
    },
    {
      id: "r2",
      titulo: "Sesiones por tutor",
      descripcion: "Resumen de sesiones realizadas por cada tutor este cuatrimestre.",
      icono: CalendarDays,
      color: "text-emerald-400 bg-emerald-500/10",
    },
    {
      id: "r3",
      titulo: "Calificaciones generales",
      descripcion: "Todas las calificaciones registradas en el período actual.",
      icono: BarChart3,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      id: "r4",
      titulo: "Padrón de alumnos",
      descripcion: "Listado completo de alumnos activos en el sistema.",
      icono: FileText,
      color: "text-sky-400 bg-sky-500/10",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Reportes"
          subtitle="Genera y descarga reportes en PDF del sistema"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REPORTES_CONFIG.map((r) => {
            const Icon = r.icono;
            const isDownloading = loadingReport === r.id;
            return (
              <SectionCard key={r.id} className="flex flex-col border-white/5 transition-all hover:border-emerald-500/20">
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r.color} shadow-lg shadow-black/20`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-wide">{r.titulo}</p>
                      <p className="mt-1 text-xs text-white/40 leading-relaxed">{r.descripcion}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/6 px-5 py-4 bg-white/[0.01]">
                  <Button
                    size="sm"
                    disabled={!!loadingReport}
                    onClick={() => handleGenerateReport(r.id)}
                    className="w-full gap-2.5 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition-all font-semibold"
                    variant="outline"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {isDownloading ? "Generando PDF..." : "Generar Documento"}
                  </Button>
                </div>
              </SectionCard>
            );
          })}
        </div>
      
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}
