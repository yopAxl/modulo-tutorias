"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { getAlumnosByDocente, formatFecha } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, X, Search, Loader2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];

// Estos son los datos que tenías en la página anterior (Dashboard)
const CALIFICACIONES_DATA = [
  { id: "c1", alumnoNombre: "Axel Eduardo García Torres", asignatura: "Cálculo Diferencial", calificacion: 6.5, periodo: "2026-1", tipoEvaluacion: "ordinario", observaciones: "Mejorar participación", fecha: "2026-03-15" },
  { id: "c2", alumnoNombre: "Fernanda Ramírez Félix", asignatura: "Cálculo Diferencial", calificacion: 9.2, periodo: "2026-1", tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-15" },
  { id: "c3", alumnoNombre: "Sofía Beltrán Chávez", asignatura: "Ing. de Software", calificacion: 9.5, periodo: "2026-1", tipoEvaluacion: "ordinario", observaciones: "Excelente proyecto", fecha: "2026-03-14" },
  { id: "c4", alumnoNombre: "Luis Ángel Ponce Villa", asignatura: "Cálculo Diferencial", calificacion: 6.0, periodo: "2026-1", tipoEvaluacion: "extraordinario", observaciones: "Pendiente revisión", fecha: "2026-03-12" },
  { id: "c5", alumnoNombre: "Vladimir Cortez Silva", asignatura: "Ing. de Software", calificacion: 9.8, periodo: "2026-1", tipoEvaluacion: "ordinario", observaciones: "", fecha: "2026-03-10" },
];

export default function CalificacionesDocentePage() {
  const router = useRouter();
  const supabase = createClient();

  const [docenteNombre, setDocenteNombre] = useState("");
  const [docenteId, setDocenteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  useEffect(() => {
    async function cargarSesion() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setDocenteNombre(user.user_metadata?.nombre_completo || user.email || "Docente");
        setDocenteId(user.id);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    cargarSesion();
  }, [router, supabase]);

  const alumnosDelGrupo = getAlumnosByDocente(docenteId || "d1");

  // Filtramos los datos que venían del dashboard
  const filtered = CALIFICACIONES_DATA.filter((c) => {
    const matchSearch = c.alumnoNombre.toLowerCase().includes(search.toLowerCase()) || 
                        c.asignatura.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "todos" || c.tipoEvaluacion === filterTipo;
    return matchSearch && matchTipo;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Gestión de Calificaciones"
          subtitle={`Visualizando ${filtered.length} registros de tu grupo`}
          actions={
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-pink-600 text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500"
            >
              <Plus className="h-4 w-4" /> Registrar nueva
            </Button>
          }
        />

        {/* Formulario (Opcional) */}
        {showForm && (
          <SectionCard className="border-pink-500/30 bg-pink-500/5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Nueva entrada de calificación</p>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-white/40">Alumno</label>
                  <select className="w-full rounded-lg border border-white/8 bg-[#1a222b] px-3 py-2 text-sm text-white outline-none">
                    {alumnosDelGrupo.map(a => <option key={a.id}>{a.nombre}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-white/40">Materia</label>
                  <input className="w-full rounded-lg border border-white/8 bg-[#1a222b] px-3 py-2 text-sm text-white" placeholder="Ej. Cálculo" />
               </div>
               <div className="flex items-end">
                  <Button className="w-full bg-pink-600 hover:bg-pink-500">Guardar Registro</Button>
               </div>
            </div>
          </SectionCard>
        )}

        {/* Buscador y Filtros Rápidos */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-pink-500/40"
              placeholder="Filtrar por alumno o asignatura..."
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 p-1">
            {["todos", "ordinario", "extraordinario"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipo(t)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-all",
                  filterTipo === t ? "bg-pink-600 text-white shadow-md" : "text-white/40 hover:text-white/70"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla Principal con los datos del Dashboard */}
        <SectionCard>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold uppercase text-white/30">Alumno</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-white/30">Asignatura</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-white/30 text-center">Calificación</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-white/30">Tipo</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase text-white/30">Fecha Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{c.alumnoNombre}</p>
                      <p className="text-[10px] text-white/30">Periodo: {c.periodo}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/70">
                        {c.asignatura}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <GpaCell value={c.calificacion} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.tipoEvaluacion} variant="neutral" />
                    </TableCell>
                    <TableCell className="text-sm text-white/40">
                      {formatFecha(c.fecha)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <Filter className="h-8 w-8 text-white/10 mb-2" />
              <p className="text-sm text-white/30 italic">No se encontraron resultados para tu búsqueda.</p>
            </div>
          )}
        </SectionCard>
      </main>
    </div>
  );
}