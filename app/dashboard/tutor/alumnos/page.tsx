"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { 
  Search, ChevronDown, ChevronUp, CalendarDays, 
  AlertTriangle, ArrowRightLeft, Mail, Phone, Loader2, Users 
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones", href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: "Expedientes", href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: "Reportes", href: "/dashboard/tutor/reportes" },
];

// --- COMPONENTES AUXILIARES PARA EVITAR ERRORES DE IMPORTACIÓN ---

function RiskBadge({ riesgo }: { riesgo: string }) {
  const map: any = {
    Alto: "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase", map[riesgo] || map.Bajo)}>
      {riesgo}
    </span>
  );
}

function GpaCell({ value }: { value: number }) {
  return (
    <span className={cn("inline-flex min-w-10 items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold", {
      "bg-emerald-500/12 text-emerald-400": value >= 9,
      "bg-amber-500/12 text-amber-400": value >= 8 && value < 9,
      "bg-red-500/12 text-red-400": value < 8,
    })}>
      {value?.toFixed(1) || "0.0"}
    </span>
  );
}

// --- PÁGINA PRINCIPAL ---

export default function AlumnosTutorPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tutorNombre, setTutorNombre] = useState("");
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  
  const [search, setSearch] = useState("");
  const [filterRiesgo, setFilterRiesgo] = useState<string>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatosReales() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        setTutorId(user.id);
        setTutorNombre(user.user_metadata?.nombre_completo || user.email);

        // CONSULTA REAL A SUPABASE: Trae alumnos asignados a este tutor
        const { data, error } = await supabase
          .schema('tutorias')
          .from('asignaciones_tutor')
          .select(`
            id,
            alumnos (
              id,
              nombre_completo,
              matricula,
              carrera,
              cuatrimestre,
              promedio,
              nivel_riesgo,
              email,
              telefono
            )
          `)
          .eq('tutor_id', user.id)
          .eq('activa', true);

        if (error) throw error;

        // Formateamos la respuesta para que sea fácil de usar
        const alumnosFormateados = data.map(item => item.alumnos).filter(Boolean);
        setAlumnos(alumnosFormateados);

      } catch (err) {
        console.error("Error cargando alumnos:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatosReales();
  }, [router, supabase]);

  const filtered = alumnos.filter((a) => {
    const matchSearch = a.nombre_completo?.toLowerCase().includes(search.toLowerCase()) || 
                        a.matricula?.toLowerCase().includes(search.toLowerCase());
    const matchRiesgo = filterRiesgo === "todos" || a.nivel_riesgo === filterRiesgo;
    return matchSearch && matchRiesgo;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-white/40 font-medium">Buscando tus alumnos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <div>
          <h1 className="text-xl font-bold text-white">Mis Alumnos</h1>
          <p className="text-sm text-white/40">{alumnos.length} alumnos asignados actualmente.</p>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500/40"
              placeholder="Buscar por nombre o matrícula..."
            />
          </div>
          <div className="flex gap-1.5">
            {["todos", "Alto", "Medio", "Bajo"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRiesgo(r)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterRiesgo === r ? "bg-emerald-600/15 text-emerald-400" : "text-white/40 hover:bg-white/6"
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Alumnos */}
        <div className="flex flex-col gap-3">
          {filtered.map((a) => {
            const isExpanded = expandedId === a.id;
            return (
              <div key={a.id} className="rounded-xl border border-white/6 bg-[#151c24] overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-white/2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600/15 text-sm font-bold text-emerald-400">
                    {a.nombre_completo?.split(" ").map((n: any) => n[0]).join("").substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{a.nombre_completo}</p>
                    <p className="text-xs text-white/40">{a.matricula} · {a.carrera}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <GpaCell value={a.promedio} />
                    <RiskBadge riesgo={a.nivel_riesgo} />
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/6 bg-black/10 px-5 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-white/30">Contacto</p>
                        <div className="flex items-center gap-2 text-xs text-white/60"><Mail className="h-3.5 w-3.5" /> {a.email}</div>
                        <div className="flex items-center gap-2 text-xs text-white/60"><Phone className="h-3.5 w-3.5" /> {a.telefono}</div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase text-white/30">Académico</p>
                        <p className="text-xs text-white/60">Cuatrimestre: {a.cuatrimestre}°</p>
                        <p className="text-xs text-white/60">Estatus: Alumno Regular</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Estado vacío */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <Users className="h-10 w-10 text-white/10 mb-3" />
            <p className="text-sm text-white/40 italic">No se encontraron alumnos asignados.</p>
            <p className="text-[10px] text-white/20 mt-1">ID de tutor: {tutorId}</p>
          </div>
        )}
      </main>
    </div>
  );
}