"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { getAlumnosByDocente, getCalificacionesByAlumno } from "@/app/_lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronDown, ChevronUp, BookOpen, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCENTE_ID = "d1";
const DOCENTE_NOMBRE = "Mtro. José Antonio Pérez Ruiz";
const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];

export default function GrupoDocentePage() {
  const alumnos = getAlumnosByDocente(DOCENTE_ID);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = alumnos.filter((a) =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) || a.matricula.includes(search)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={DOCENTE_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Mi Grupo"
          subtitle={`${alumnos.length} alumnos · Detalle por alumno`}
        />

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40"
            placeholder="Buscar por nombre o matrícula..."
          />
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((a) => {
            const isExpanded = expandedId === a.id;
            const calificaciones = getCalificacionesByAlumno(a.id);

            return (
              <SectionCard key={a.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : a.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/2"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-600/15 text-sm font-bold text-pink-400">
                    {a.nombre.split(" ").slice(0, 2).map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{a.nombre}</p>
                    <p className="text-xs text-white/40">{a.matricula} · {a.carrera} · Grupo {a.grupo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <GpaCell value={a.promedio} />
                    <RiskBadge riesgo={a.riesgo} />
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/6 px-5 py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Contacto</p>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Mail className="h-3 w-3 text-white/30" /> {a.correo}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/50">
                          <Phone className="h-3 w-3 text-white/30" /> {a.telefono}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Calificaciones registradas</p>
                        {calificaciones.length > 0 ? calificaciones.map((c) => (
                          <div key={c.id} className="flex items-center justify-between text-xs">
                            <span className="text-white/50">{c.asignatura}</span>
                            <GpaCell value={c.calificacion} />
                          </div>
                        )) : (
                          <p className="text-xs text-white/30">Sin calificaciones</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            );
          })}
        </div>
      </main>
    </div>
  );
}
