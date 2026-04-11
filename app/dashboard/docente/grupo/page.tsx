"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronUp, Mail, Phone, BookOpen, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getAlumnosGrupoDocente } from "../actions";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📈", label: "Reportes", href: "/dashboard/docente/reportes" },
];

export default function MiGrupoPage() {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docenteNombre, setDocenteNombre] = useState("");

  useEffect(() => {
    async function cargar() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        setDocenteNombre(user.user_metadata?.nombre_completo || user.email || "Docente");
        const res = await getAlumnosGrupoDocente(user.id);
        
        if (res.error === "PERFIL_NO_ENCONTRADO") {
          setData({ error: "PERFIL_NO_ENCONTRADO" });
        } else if (res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    cargar();
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

  const alumnos = Array.isArray(data) ? data : [];
  const filtered = alumnos.filter(a => 
    a.nombre_completo?.toLowerCase().includes(search.toLowerCase()) || 
    a.matricula?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={docenteNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader 
          title="Mi Grupo" 
          subtitle={`${filtered.length} alumnos detectados vinculados a tus materias`} 
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o matrícula..."
            className="w-full rounded-lg border border-white/8 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-emerald-500/40"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length > 0 ? filtered.map((a) => (
            <SectionCard key={a.id} className={expandedId === a.id ? "border-emerald-500/30" : ""}>
              <button
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                  {a.nombre_completo?.substring(0, 2).toUpperCase() || "AL"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{a.nombre_completo}</p>
                  <p className="text-[11px] text-white/40">{a.matricula} · {a.carrera}</p>
                </div>
                <div className="flex items-center gap-3">
                  <GpaCell value={parseFloat(a.promedio_general) || 0} />
                  <RiskBadge riesgo={a.riesgo_academico === 'alto' ? 'Alto' : (a.riesgo_academico === 'medio' ? 'Medio' : 'Bajo')} />
                  {expandedId === a.id ? <ChevronUp className="h-4 w-4 text-emerald-500" /> : <ChevronDown className="h-4 w-4 text-white/20" />}
                </div>
              </button>

              {expandedId === a.id && (
                <div className="border-t border-white/6 px-5 py-5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Información del Alumno</p>
                      <div className="flex items-center gap-3 text-xs text-white/60"><Mail className="h-3.5 w-3.5" /> {a.correo_institucional || a.email || "Sin correo"}</div>
                      <div className="flex items-center gap-3 text-xs text-white/60"><Phone className="h-3.5 w-3.5" /> {a.telefono || "No registrado"}</div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Detalles Académicos</p>
                      <div className="flex items-center justify-between rounded-md bg-white/5 p-2">
                        <span className="text-[11px] text-white/80">Grupo</span>
                        <span className="text-[11px] text-white/60 font-mono">{a.grupo || "S/G"}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-white/5 p-2">
                        <span className="text-[11px] text-white/80">Cuatrimestre</span>
                        <span className="text-[11px] text-white/60 font-mono">{a.cuatrimestre}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <BookOpen className="h-10 w-10 text-white/5 mb-3" />
              <p className="text-sm text-white/30 italic">No se encontraron alumnos relacionados.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}