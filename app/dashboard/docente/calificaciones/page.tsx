"use client";

import { useState } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { GpaCell } from "@/app/_components/GpaCell";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { getAlumnosByDocente, getCalificacionesByDocente, formatFecha } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCENTE_ID = "d1";
const DOCENTE_NOMBRE = "Mtro. José Antonio Pérez Ruiz";
const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/docente" },
  { icon: "👥", label: "Mi grupo", href: "/dashboard/docente/grupo" },
  { icon: "📝", label: "Calificaciones", href: "/dashboard/docente/calificaciones" },
  { icon: "📁", label: "Reportes", href: "/dashboard/docente/reportes" },
];

export default function CalificacionesDocentePage() {
  const calificaciones = getCalificacionesByDocente(DOCENTE_ID);
  const alumnos = getAlumnosByDocente(DOCENTE_ID);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  const filtered = calificaciones.filter((c) => {
    const matchSearch = c.alumnoNombre.toLowerCase().includes(search.toLowerCase()) || c.asignatura.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === "todos" || c.tipoEvaluacion === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Docente" userName={DOCENTE_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Calificaciones"
          subtitle={`${calificaciones.length} calificaciones registradas`}
          actions={
            <Button
              size="sm"
              onClick={() => setShowForm(!showForm)}
              className="gap-2 bg-pink-600 text-white shadow-lg shadow-pink-600/20 hover:bg-pink-500"
            >
              <Plus className="h-4 w-4" /> Registrar calificación
            </Button>
          }
        />

        {/* Form */}
        {showForm && (
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Registrar nueva calificación</p>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Alumno</label>
                <select className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/40">
                  <option value="">Seleccionar alumno</option>
                  {alumnos.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Asignatura</label>
                <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40" placeholder="Ej: Cálculo Diferencial" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Período</label>
                <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40" placeholder="Ej: 2026-1" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Calificación (0-10)</label>
                <input type="number" min="0" max="10" step="0.1" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40" placeholder="8.5" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Tipo de evaluación</label>
                <select className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-pink-500/40">
                  <option value="ordinario">Ordinario</option>
                  <option value="extraordinario">Extraordinario</option>
                  <option value="titulo">Título</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Observaciones</label>
                <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40" placeholder="Opcional" />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-3">
                <Button size="sm" className="gap-2 bg-pink-600 text-white hover:bg-pink-500">
                  <Plus className="h-4 w-4" /> Guardar calificación
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-pink-500/40"
              placeholder="Buscar por alumno o materia..."
            />
          </div>
          <div className="flex gap-1.5">
            {["todos", "ordinario", "extraordinario", "titulo"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterTipo(t)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterTipo === t ? "bg-pink-600/15 text-pink-400" : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {t === "todos" ? "Todos" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Alumno", "Asignatura", "Período", "Calificación", "Tipo", "Observaciones", "Fecha"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="border-white/4 hover:bg-white/3">
                  <TableCell className="text-sm font-medium text-white/90">{c.alumnoNombre.split(" ").slice(0, 2).join(" ")}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border border-white/8 bg-white/4 px-2 py-0.5 text-xs text-white/60">
                      {c.asignatura}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/50">{c.periodo}</TableCell>
                  <TableCell><GpaCell value={c.calificacion} /></TableCell>
                  <TableCell><StatusBadge status={c.tipoEvaluacion} variant="neutral" /></TableCell>
                  <TableCell className="text-xs text-white/40">{c.observaciones || "—"}</TableCell>
                  <TableCell className="text-sm text-white/40">{formatFecha(c.fecha)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-white/30">No se encontraron calificaciones.</p>
          )}
        </SectionCard>
      </main>
    </div>
  );
}
