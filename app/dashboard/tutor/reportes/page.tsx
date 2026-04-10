"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { getAlumnosByTutor, getSesionesByTutor, formatFecha } from "@/app/_lib/mock-data";
import { generateReportPDF } from "@/app/_lib/pdf-utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Download, Users, CalendarDays, AlertTriangle, FileText, Loader2 } from "lucide-react";

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

  // Estados para la sesión dinámica
  const [tutorNombre, setTutorNombre] = useState("");
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerSesion() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        // Extraemos el nombre de la metadata o usamos el correo como respaldo
        const nombreCompleto = user.user_metadata?.nombre_completo || user.email || "Tutor";
        setTutorNombre(nombreCompleto);
        setTutorId(user.id);
      } catch (error) {
        console.error("Error al obtener sesión:", error);
      } finally {
        setLoading(false);
      }
    }
    obtenerSesion();
  }, [router, supabase]);

  // Obtenemos los datos (temporalmente de mock-data, pero usando el ID real del usuario)
  const alumnos = getAlumnosByTutor(tutorId || "");
  const sesiones = getSesionesByTutor(tutorId || "");
  const enRiesgo = alumnos.filter((a) => a.riesgo !== "Bajo");

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
          alumnos.map((a) => [a.nombre, a.matricula, a.carrera, `${a.cuatrimestre}°`, a.promedio.toFixed(1), a.riesgo]),
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
          enRiesgo.map((a) => [a.nombre, a.matricula, a.promedio.toFixed(1), a.riesgo, a.correo]),
          "reporte_alumnos_riesgo.pdf"
        );
      },
    },
    {
      id: "rt3",
      titulo: "Historial de sesiones",
      descripcion: `${sesiones.length} sesiones registradas este cuatrimestre.`,
      icono: CalendarDays,
      color: "text-amber-400 bg-amber-500/10",
      generate: () => {
        generateReportPDF(
          "Reporte: Historial de Sesiones",
          `Tutor: ${tutorNombre} · Cuatrimestre Ene–Abr 2026`,
          ["Alumno", "Fecha", "Horario", "Duración", "Urgencia", "Estatus"],
          sesiones.map((s) => [s.alumnoNombre, formatFecha(s.fecha), `${s.horaInicio}–${s.horaFin}`, `${s.duracionMin} min`, s.urgencia, s.estatus]),
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
          ["Alumno", "Fecha", "Motivos", "Puntos relevantes", "Acuerdos"],
          sesiones.map((s) => [s.alumnoNombre, formatFecha(s.fecha), s.motivos.join(", "), s.temas.join("; "), s.acuerdos]),
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