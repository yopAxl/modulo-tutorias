import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import {
  getAlumnosByTutor, getSesionesByTutor, PROXIMAS_SESIONES,
  formatFecha, gpaClass, type RiesgoNivel,
} from "@/app/_lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, CalendarDays, AlertTriangle, CalendarCheck2,
  Plus, Clock, ChevronRight, CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TUTOR_ID    = "t1";
const TUTOR_NOMBRE = "Dra. María Rodríguez López";
const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard",   href: "/dashboard/tutor" },
  { icon: "👥", label: "Mis alumnos", href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: "Sesiones",    href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: "Expedientes", href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: "Reportes",    href: "/dashboard/tutor/reportes" },
];

function RiskBadge({ riesgo }: { riesgo: RiesgoNivel }) {
  const map = {
    Alto:  "bg-red-500/10 text-red-400 border-red-500/20",
    Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Bajo:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", map[riesgo])}>
      {riesgo}
    </span>
  );
}

function GpaCell({ value }: { value: number }) {
  const cls = gpaClass(value);
  return (
    <span className={cn("inline-flex min-w-[2.75rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", {
      "bg-emerald-500/12 text-emerald-400": cls === "gpa-high",
      "bg-amber-500/12 text-amber-400":     cls === "gpa-mid",
      "bg-red-500/12 text-red-400":         cls === "gpa-low",
    })}>
      {value.toFixed(1)}
    </span>
  );
}

/* ─── Shared section card ─────────────────────────────────────────────── */
function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-[#161b27]", className)}>
      {children}
    </div>
  );
}

export default function TutorDashboard() {
  const alumnos  = getAlumnosByTutor(TUTOR_ID);
  const sesiones = getSesionesByTutor(TUTOR_ID);

  const alumnosAlto   = alumnos.filter((a) => a.riesgo === "Alto").length;
  const alumnosMedio  = alumnos.filter((a) => a.riesgo === "Medio").length;
  const alumnosEnRiesgo = alumnos.filter((a) => a.riesgo !== "Bajo");

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      <Sidebar role="Tutor" userName={TUTOR_NOMBRE} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Panel de Tutor</h1>
            <p className="mt-0.5 text-sm text-white/50">
              Bienvenida, {TUTOR_NOMBRE.split(" ")[1]}. Cuatrimestre Enero–Abril 2026.
            </p>
          </div>
          <Button size="sm" className="gap-2 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500">
            <Plus className="h-4 w-4" /> Nueva sesión
          </Button>
        </div>

        {/* ── KPIs ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Alumnos asignados" value={alumnos.length} sub="↑ Este cuatrimestre" subColor="text-emerald-400" icon={Users} accent="indigo" />
          <StatCard label="Sesiones este mes" value={sesiones.length} sub="↑ 3 más que el mes anterior" subColor="text-emerald-400" icon={CalendarDays} accent="indigo" />
          <StatCard label="En riesgo alto" value={alumnosAlto} sub={`${alumnosMedio} más en Medio`} subColor="text-amber-400" icon={AlertTriangle} accent="red" />
          <StatCard label="Próximas sesiones" value={PROXIMAS_SESIONES.length} sub="Esta semana" icon={CalendarCheck2} accent="green" />
        </div>

        {/* ── Middle row ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {/* Alumnos en riesgo */}
          <SectionCard className="col-span-2">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">Alumnos en riesgo</p>
                <p className="text-xs text-white/40">{alumnosEnRiesgo.length} alumnos requieren atención</p>
              </div>
              <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                Ver todos <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Alumno</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Cuatr.</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Prom.</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Riesgo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnosEnRiesgo.map((a) => (
                  <TableRow key={a.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                    <TableCell>
                      <p className="text-sm font-medium text-white/90">{a.nombre}</p>
                      <p className="text-xs text-white/35">{a.matricula} · {a.carrera}</p>
                    </TableCell>
                    <TableCell className="text-sm text-white/60">{a.cuatrimestre}°</TableCell>
                    <TableCell><GpaCell value={a.promedio} /></TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          {/* Próximas sesiones */}
          <SectionCard>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="text-sm font-semibold text-white">Próximas sesiones</p>
              <p className="text-xs text-white/40">Agenda de esta semana</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {PROXIMAS_SESIONES.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.03] px-4 py-3 transition-colors hover:border-indigo-500/30">
                  <div className="min-w-[2.25rem] text-center">
                    <p className="text-xl font-extrabold leading-none text-indigo-400">{p.dia}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/35">{p.mes}</p>
                  </div>
                  <div className="h-8 w-px bg-white/[0.08]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white/90">
                      {p.alumnoNombre.split(" ").slice(0, 2).join(" ")}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-white/40">
                      <Clock className="h-3 w-3" /> {p.hora}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── Últimas sesiones ──────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Últimas sesiones registradas</p>
              <p className="text-xs text-white/40">Historial reciente de atenciones</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
              Ver historial <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {sesiones.map((s) => (
              <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                  <CalendarRange className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white/90">{s.alumnoNombre}</p>
                  <p className="mt-0.5 truncate text-xs text-white/50">{s.temas.join(" · ")}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-white/35">
                      <CalendarDays className="h-3 w-3" /> {formatFecha(s.fecha)}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-white/35">
                      <Clock className="h-3 w-3" /> {s.horaInicio}–{s.horaFin}
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", {
                      "border-red-500/20 bg-red-500/10 text-red-400":       s.urgencia === "Alta",
                      "border-amber-500/20 bg-amber-500/10 text-amber-400": s.urgencia === "Media",
                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400": s.urgencia === "Baja",
                    })}>
                      {s.urgencia}
                    </span>
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-white/35">{s.duracionMin} min</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Todos los alumnos ─────────────────────────────────── */}
        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Todos mis alumnos</p>
              <p className="text-xs text-white/40">{alumnos.length} alumnos asignados este cuatrimestre</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                {["Alumno", "Carrera", "Cuatr.", "Promedio", "Riesgo", "Contacto"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alumnos.map((a) => (
                <TableRow key={a.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                  <TableCell>
                    <p className="text-sm font-medium text-white/90">{a.nombre}</p>
                    <p className="text-xs text-white/35">{a.matricula}</p>
                  </TableCell>
                  <TableCell className="text-sm text-white/60">{a.carrera}</TableCell>
                  <TableCell className="text-sm text-white/60">{a.cuatrimestre}°</TableCell>
                  <TableCell><GpaCell value={a.promedio} /></TableCell>
                  <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                  <TableCell>
                    <p className="text-xs text-white/40">{a.correo}</p>
                    <p className="text-xs text-white/40">{a.telefono}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </main>
    </div>
  );
}
