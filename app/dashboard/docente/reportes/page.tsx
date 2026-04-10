"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { createClient } from "@/lib/supabase/client";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { Download, Users, BarChart3, AlertTriangle, Loader2 } from "lucide-react";

// DATOS SINCRONIZADOS PARA LOS REPORTES
const DATOS_REPORTES = {
  alumnos: [
    { nombre: "Axel Eduardo García Torres", matricula: "20230001", carrera: "Ing. Software", grupo: "7A", promedio: 6.5, riesgo: "Alto", correo: "axel.garcia@utn.edu.mx" },
    { nombre: "Fernanda Ramírez Félix", matricula: "20230002", carrera: "Ing. Software", grupo: "7A", promedio: 9.2, riesgo: "Bajo", correo: "fer.ramirez@utn.edu.mx" },
    { nombre: "Sofía Beltrán Chávez", matricula: "20230003", carrera: "Ing. Software", grupo: "7A", promedio: 9.5, riesgo: "Bajo", correo: "sofia.beltran@utn.edu.mx" }
  ],
  calificaciones: [
    { alumnoNombre: "Axel Eduardo García Torres", asignatura: "Cálculo Diferencial", calificacion: 6.5, tipo: "Parcial 1", fecha: "2026-03-15" },
    { alumnoNombre: "Fernanda Ramírez Félix", asignatura: "Cálculo Diferencial", calificacion: 9.2, tipo: "Parcial 1", fecha: "2026-03-15" },
    { alumnoNombre: "Sofía Beltrán Chávez", asignatura: "Ing. de Software", calificacion: 9.5, tipo: "Parcial 1", fecha: "2026-03-14" }
  ]
};

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];
export default function ReportesTutorPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserName(user.user_metadata?.nombre_completo || "Tyran Gonzales Rojas");
      setLoading(false);
    }
    getSession();
  }, [router, supabase]);

  const REPORTES = [
    {
      id: "rd1",
      titulo: "Lista de grupo",
      descripcion: `${DATOS_REPORTES.alumnos.length} alumnos con datos académicos detallados.`,
      icono: Users,
      color: "text-pink-400 bg-pink-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Lista de Grupo",
          `Tutor: ${userName}`,
          ["Nombre", "Matrícula", "Carrera", "Promedio", "Riesgo"],
          DATOS_REPORTES.alumnos.map((a) => [a.nombre, a.matricula, a.carrera, a.promedio.toFixed(1), a.riesgo]),
          "lista_grupo_tutor.pdf"
        );
      },
    },
    {
      id: "rd2",
      titulo: "Calificaciones del Período",
      descripcion: `Resumen de las últimas evaluaciones registradas.`,
      icono: BarChart3,
      color: "text-amber-400 bg-amber-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Calificaciones Registradas",
          `Generado por: ${userName} · Período 2026`,
          ["Alumno", "Asignatura", "Calificación", "Fecha"],
          DATOS_REPORTES.calificaciones.map((c) => [c.alumnoNombre, c.asignatura, c.calificacion.toFixed(1), c.fecha]),
          "calificaciones_recientes.pdf"
        );
      },
    },
    {
      id: "rd3",
      titulo: "Alumnos en Situación de Riesgo",
      descripcion: `Lista filtrada de alumnos con riesgo Medio y Alto.`,
      icono: AlertTriangle,
      color: "text-red-400 bg-red-500/10",
      generate: () => {
        const enRiesgo = DATOS_REPORTES.alumnos.filter((a) => a.riesgo !== "Bajo");
        generateReportPDF(
          "Reporte: Prioridad de Atención",
          `Tutor: ${userName} · ${enRiesgo.length} alumnos detectados`,
          ["Nombre", "Matrícula", "Promedio", "Riesgo", "Correo"],
          enRiesgo.map((a) => [a.nombre, a.matricula, a.promedio.toFixed(1), a.riesgo, a.correo]),
          "alumnos_riesgo.pdf"
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={userName} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader 
          title="Centro de Reportes" 
          subtitle="Exporta la información de tus tutorados en formato oficial PDF" 
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORTES.map((r) => {
            const Icon = r.icono;
            return (
              <SectionCard key={r.id} className="flex flex-col border-white/5 hover:border-pink-500/20 transition-colors">
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${r.color}`}>
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
                    className="w-full gap-2 bg-pink-600/10 text-pink-400 hover:bg-pink-600/20 border border-pink-500/30"
                    variant="outline"
                  >
                    <Download className="h-3.5 w-3.5" /> Generar PDF
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