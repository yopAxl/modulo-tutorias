"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { GpaCell } from "@/app/_components/GpaCell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getDocenteDashboardStats } from "../actions";
import { toast } from "sonner";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];

export default function CalificacionesDocentePage() {
  const router = useRouter();
  const supabase = createClient();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docenteNombre, setDocenteNombre] = useState("Cargando...");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

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
          toast.error(res.error || "Error al cargar calificaciones");
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

  const calificaciones = data?.calificacionesRecientes || [];
  const filtered = calificaciones.filter((c: any) => {
    return c.nombre?.toLowerCase().includes(search.toLowerCase()) || 
           c.materia?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Gestión de Calificaciones"
          subtitle={`Visualizando ${filtered.length} registros cargados recientemente`}
          actions={
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> Registrar nueva
            </Button>
          }
        />

        {showForm && (
          <SectionCard className="border-emerald-500/20 bg-emerald-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Nueva entrada de calificación</p>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
               <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Alumno</label>
                  <select className="w-full rounded-lg border border-white/8 bg-[#0f151c] px-3 py-2 text-sm text-white outline-none">
                    <option value="">Seleccionar alumno...</option>
                    {data?.alumnos?.map((a: any) => <option key={a.id} value={a.id}>{a.nombre_completo}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Calificación (0-10)</label>
                  <input type="number" step="0.1" max="10" min="0" className="w-full rounded-lg border border-white/8 bg-[#0f151c] px-3 py-2 text-sm text-white outline-none" placeholder="Ej. 8.5" />
               </div>
               <div className="flex items-end">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md">Guardar Registro</Button>
               </div>
            </div>
          </SectionCard>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500/40"
              placeholder="Buscar por alumno o asignatura..."
            />
          </div>
        </div>

        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent text-left">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-white/30">Alumno</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-white/30">Asignatura</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-white/30 text-center">Calificación</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-white/30 text-right">Fecha Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? filtered.map((c: any) => (
                <TableRow key={c.id} className="border-white/4 hover:bg-white/3 transition-colors">
                  <TableCell>
                    <p className="text-sm font-medium text-white/90">{c.nombre}</p>
                    <p className="text-[10px] text-white/30 uppercase font-mono">{c.matricula || "S/M"}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
                      {c.materia}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <GpaCell value={c.cal} />
                  </TableCell>
                  <TableCell className="text-right text-xs text-white/40 font-mono">
                    {c.fecha}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center text-sm text-white/20 italic font-medium border-t border-white/4">
                    No se encontraron registros de calificaciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}