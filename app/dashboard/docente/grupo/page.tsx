"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { GpaCell } from "@/app/_components/GpaCell";
import { Search, ChevronDown, ChevronUp, Mail, Phone, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. FORZAMOS LOS DATOS AQUÍ PARA QUE APAREZCAN SIEMPRE
const ALUMNOS_GRUPO = [
  {
    id: "a1",
    nombre: "Axel Eduardo García Torres",
    matricula: "20230001",
    carrera: "Ing. Software",
    promedio: 6.5,
    riesgo: "alto",
    correo: "axel.garcia@utn.edu.mx",
    telefono: "555-0101",
    calificaciones: [
      { id: "c1", asignatura: "Cálculo Diferencial", calificacion: 6.5 }
    ]
  },
  {
    id: "a2",
    nombre: "Fernanda Ramírez Félix",
    matricula: "20230002",
    carrera: "Ing. Software",
    promedio: 9.2,
    riesgo: "bajo",
    correo: "fer.ramirez@utn.edu.mx",
    telefono: "555-0102",
    calificaciones: [
      { id: "c2", asignatura: "Cálculo Diferencial", calificacion: 9.2 }
    ]
  },
  {
    id: "a3",
    nombre: "Sofía Beltrán Chávez",
    matricula: "20230003",
    carrera: "Ing. Software",
    promedio: 9.5,
    riesgo: "bajo",
    correo: "sofia.beltran@utn.edu.mx",
    telefono: "555-0103",
    calificaciones: [
      { id: "c3", asignatura: "Ing. de Software", calificacion: 9.5 }
    ]
  }
];

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones", href: "/dashboard/tutor/sesiones" },
];

export default function MiGrupoPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtro simple por nombre o matrícula
  const filtered = ALUMNOS_GRUPO.filter(a => 
    a.nombre.toLowerCase().includes(search.toLowerCase()) || 
    a.matricula.includes(search)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName="Tyran Gonzales Rojas" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader 
          title="Mi Grupo" 
          subtitle={`${filtered.length} alumnos bajo tu supervisión`} 
        />

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o matrícula..."
            className="w-full rounded-lg border border-white/8 bg-white/4 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-pink-500/40"
          />
        </div>

        {/* Lista de Alumnos */}
        <div className="flex flex-col gap-3">
          {filtered.map((a) => (
            <SectionCard key={a.id} className={expandedId === a.id ? "border-pink-500/30" : ""}>
              <button
                onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-xs font-bold text-pink-500 border border-pink-500/20">
                  {a.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{a.nombre}</p>
                  <p className="text-[11px] text-white/40">{a.matricula} · {a.carrera}</p>
                </div>
                <div className="flex items-center gap-3">
                  <GpaCell value={a.promedio} />
                  <RiskBadge riesgo={a.riesgo} />
                  {expandedId === a.id ? <ChevronUp className="h-4 w-4 text-pink-500" /> : <ChevronDown className="h-4 w-4 text-white/20" />}
                </div>
              </button>

              {expandedId === a.id && (
                <div className="border-t border-white/6 px-5 py-5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Contacto</p>
                      <div className="flex items-center gap-3 text-xs text-white/60"><Mail className="h-3.5 w-3.5" /> {a.correo}</div>
                      <div className="flex items-center gap-3 text-xs text-white/60"><Phone className="h-3.5 w-3.5" /> {a.telefono}</div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Calificaciones</p>
                      {a.calificaciones.map((c) => (
                        <div key={c.id} className="flex items-center justify-between rounded-md bg-white/5 p-2">
                          <span className="text-[11px] text-white/80">{c.asignatura}</span>
                          <GpaCell value={c.calificacion} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>
          ))}
        </div>
      </main>
    </div>
  );
}