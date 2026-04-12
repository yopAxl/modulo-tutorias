"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, AlertTriangle, Download, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDocenteDashboardStats } from "../actions";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { toast } from "sonner";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";


export default function ReportesDocentePage() {
  const { t } = useI18n();

  const NAV_ITEMS = [
  { icon: "📊", label: t("nav.docente.dashboard"), href: "/dashboard/docente" },
  { icon: "👥", label: t("nav.docente.group"), href: "/dashboard/docente/grupo" },
  { icon: "📝", label: t("nav.docente.grades"), href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: t("nav.docente.reports"), href: "/dashboard/docente/reportes" },
];
  const router = useRouter();
  const supabase = createClient();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docenteNombre, setDocenteNombre] = useState("Cargando...");

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const res = await getDocenteDashboardStats(user.id);
        if (res.error === "PERFIL_NO_ENCONTRADO") {
          setData({ error: "PERFIL_NO_ENCONTRADO" });
          setDocenteNombre(user.user_metadata?.nombre_completo || user.email || "Docente");
        } else if (res.data) {
          setData(res.data);
          setDocenteNombre(res.data.docente.nombre_completo || user.user_metadata?.nombre_completo || user.email);
        } else {
          toast.error(res.error || "Error al cargar datos para reportes");
        }
      } catch (err) {
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (data?.error === "PERFIL_NO_ENCONTRADO") {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0f151c]">
        <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-8">
          <SectionCard className="max-w-md p-8 text-center border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Perfil de Docente no encontrado</h2>
            <p className="text-sm text-white/60 mb-6">
               Tu cuenta no tiene un perfil de docente asociado. Contacta al administrador para que registre tu perfil.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/10 hover:bg-white/5">
              Reintentar
            </Button>
          </SectionCard>
        </main>
      </div>
    );
  }

  const alumnos = data?.alumnos || [];
  const calificaciones = data?.calificacionesRecientes || [];

  const REPORTES = [
    {
      id: "rd1",
      titulo: "Lista de grupo",
      descripcion: `${alumnos.length} alumnos con datos académicos detallados.`,
      icono: Users,
      color: "text-emerald-400 bg-emerald-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Lista de Grupo",
          `Docente: ${docenteNombre}`,
          ["Nombre", "Matrícula", "Carrera", "Promedio", "Riesgo"],
          alumnos.map((a: any) => [a.nombre_completo, a.matricula, a.carrera, a.promedio?.toFixed(1) || "0.0", a.riesgo]),
          "lista_grupo_docente.pdf"
        );
      },
    },
    {
      id: "rd2",
      titulo: "Calificaciones del Período",
      descripcion: `Resumen de las últimas ${calificaciones.length} evaluaciones registradas.`,
      icono: BarChart3,
      color: "text-amber-400 bg-amber-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Calificaciones Registradas",
          `Generado por: ${docenteNombre} · Período Actual`,
          ["Alumno", "Asignatura", "Calificación", "Fecha"],
          calificaciones.map((c: any) => [c.nombre, c.materia, c.cal.toFixed(1), c.fecha]),
          "calificaciones_recientes.pdf"
        );
      },
    },
    {
      id: "rd3",
      titulo: "Alumnos en Situación de Riesgo",
      descripcion: `Lista filtrada de alumnos con atención prioritaria.`,
      icono: AlertTriangle,
      color: "text-red-400 bg-red-500/10",
      generate: () => {
        const enRiesgo = alumnos.filter((a: any) => a.riesgo !== "Bajo");
        generateReportPDF(
          "Reporte: Prioridad de Atención",
          `Docente: ${docenteNombre} · ${enRiesgo.length} alumnos detectados`,
          ["Nombre", "Matrícula", "Promedio", "Riesgo", "Correo"],
          enRiesgo.map((a: any) => [a.nombre_completo, a.matricula, a.promedio?.toFixed(1) || "0.0", a.riesgo, a.correo_institucional]),
          "alumnos_riesgo.pdf"
        );
      },
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader 
          title="Centro de Reportes" 
          subtitle="Exporta la información académica oficial en formato PDF" 
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORTES.map((r) => {
            const Icon = r.icono;
            return (
              <SectionCard key={r.id} className="flex flex-col border-white/5 hover:border-emerald-500/20 transition-all group">
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{r.titulo}</p>
                      <p className="mt-1 text-xs text-white/40 leading-relaxed">{r.descripcion}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/5 bg-white/[0.01] px-5 py-4">
                  <Button
                    size="sm"
                    onClick={r.generate}
                    className="w-full gap-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/30 shadow-sm"
                    variant="outline"
                  >
                    <Download className="h-3.5 w-3.5" /> Generar PDF
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