"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, CalendarDays, FileText, Download, Loader2 } from "lucide-react";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { createClient } from "@/lib/supabase/client";
import { getTutorReportData } from "../actions";
import { toast } from "sonner";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones", href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: "Expedientes", href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: "Reportes", href: "/dashboard/tutor/reportes" },
];

export default function ReportesTutorPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tutorNombre, setTutorNombre] = useState("Cargando...");
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [sesiones, setSesiones] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const res = await getTutorReportData(user.id);

        if (res.error === "PERFIL_NO_ENCONTRADO") {
          setTutorId("NO_PROFILE");
          setTutorNombre(user.user_metadata?.nombre_completo || user.email);
        } else if (res.data) {
          setTutorId(res.data.tutor.id);
          setTutorNombre(res.data.tutor.nombre_completo || user.email);
          setAlumnos(res.data.alumnos);
          setSesiones(res.data.sesiones);
        }
      } catch (err) {
        toast.error("Error al cargar datos de reportes");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, supabase]);

  const enRiesgo = alumnos.filter((a) => a.riesgo_academico && a.riesgo_academico !== "bajo");

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const REPORTES = [
    {
      id: "rt1",
      titulo: "Mis alumnos asignados",
      descripcion: `Lista de ${alumnos.length} alumnos con datos académicos y riesgo.`,
      icono: Users,
      color: "text-emerald-400 bg-emerald-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Alumnos Asignados",
          `Tutor: ${tutorNombre} · ${alumnos.length} alumnos`,
          ["Nombre", "Matrícula", "Carrera", "Cuatr.", "Promedio", "Riesgo"],
          alumnos.map((a) => [a.nombre_completo || a.nombre, a.matricula, a.carrera, `${a.cuatrimestre}°`, (parseFloat(a.promedio_general) || 0).toFixed(1), a.riesgo_academico]),
          "reporte_mis_alumnos.pdf"
        );
      },
    },
    {
      id: "rt2",
      titulo: "Alumnos en riesgo",
      descripcion: `${enRiesgo.length} alumnos con riesgo Medio o Alto.`,
      icono: AlertTriangle,
      color: "text-red-400 bg-red-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Alumnos en Riesgo",
          `Tutor: ${tutorNombre} · ${enRiesgo.length} alumnos`,
          ["Nombre", "Matrícula", "Promedio", "Riesgo", "Correo"],
          enRiesgo.map((a) => [a.nombre_completo || a.nombre, a.matricula, (parseFloat(a.promedio_general) || 0).toFixed(1), a.riesgo_academico, a.correo_institucional || a.correo]),
          "reporte_alumnos_riesgo.pdf"
        );
      },
    },
    {
      id: "rt3",
      titulo: "Historial de sesiones",
      descripcion: `${sesiones.length} sesiones registradas.`,
      icono: CalendarDays,
      color: "text-amber-400 bg-amber-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Historial de Sesiones",
          `Tutor: ${tutorNombre}`,
          ["Alumno", "Fecha", "Horario", "Urgencia", "Estatus"],
          sesiones.map((s) => [s.alumnos?.nombre_completo || "S/A", s.fecha ? new Date(s.fecha).toLocaleDateString() : '—', `${s.hora_inicio?.substring(0, 5)}–${s.hora_fin?.substring(0, 5)}`, s.nivel_urgencia, s.estatus]),
          "reporte_sesiones.pdf"
        );
      },
    },
    {
      id: "rt4",
      titulo: "Consolidado R07-M01-01",
      descripcion: "Reporte general con todas las sesiones en formato oficial.",
      icono: FileText,
      color: "text-sky-400 bg-sky-500/10",
      generate: () => {
        generateReportPDF(
          "Consolidado de Sesiones · Formato R07-M01-01",
          `Tutor: ${tutorNombre}`,
          ["Alumno", "Fecha", "Acuerdos"],
          sesiones.map((s) => [s.alumnos?.nombre_completo || "S/A", s.fecha ? new Date(s.fecha).toLocaleDateString() : '—', s.compromisos_acuerdos || "S/A"]),
          "consolidado_r07m0101.pdf"
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (tutorId === "NO_PROFILE") {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0f151c]">
        <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Perfil de Tutor no encontrado</h2>
            <p className="text-sm text-white/60 mb-6">
              Contacta al administrador para habilitar tu perfil de tutor.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Reportes"
          subtitle="Genera y descarga reportes de tus alumnos y sesiones"
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