import Sidebar from "@/app/_components/Sidebar";
import { StatCard } from "@/app/_components/StatCard";
import { ALUMNOS, SESIONES, formatFecha, gpaClass } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, CalendarDays, AlertTriangle, FolderOpen, Download, Clock, CalendarRange, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ALUMNO_ID = "a1";
const alumno    = ALUMNOS.find((a) => a.id === ALUMNO_ID)!;
const mySesiones = SESIONES.filter((s) => s.alumnoId === ALUMNO_ID);

const NAV_ITEMS = [
  { icon: "📊", label: "Mi panel",     href: "/dashboard/alumno" },
  { icon: "📅", label: "Mis sesiones", href: "/dashboard/alumno/sesiones" },
  { icon: "📁", label: "Expediente",   href: "/dashboard/alumno/expediente" },
  { icon: "📄", label: "Documentos",   href: "/dashboard/alumno/documentos" },
];

const DOCUMENTOS = [
  { id: "d1", nombre: "Comprobante de inscripción",      tipo: "PDF", fecha: "10 Ene 2026", estado: "Aprobado" },
  { id: "d2", nombre: "Historial académico",              tipo: "PDF", fecha: "15 Ene 2026", estado: "Aprobado" },
  { id: "d3", nombre: "Justificante médico – Feb 2026",  tipo: "PDF", fecha: "20 Feb 2026", estado: "Pendiente" },
];

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-white/[0.06] bg-[#161b27]", className)}>{children}</div>;
}

export default function AlumnoDashboard() {
  const gpc          = gpaClass(alumno.promedio);
  const promedioColor = gpc === "gpa-high" ? "text-emerald-400" : gpc === "gpa-mid" ? "text-amber-400" : "text-red-400";
  const riesgoMap     = {
    Alto:  { text: "Alto",  cls: "bg-red-500/10 text-red-400 border-red-500/20" },
    Medio: { text: "Medio", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    Bajo:  { text: "Bajo",  cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  };
  const pendientes = DOCUMENTOS.filter((d) => d.estado === "Pendiente").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1117]">
      <Sidebar role="Alumno" userName={alumno.nombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Mi Panel Académico</h1>
            <p className="mt-0.5 text-sm text-white/50">
              Hola, {alumno.nombre.split(" ")[0]}. Aquí puedes consultar tu seguimiento.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white">
            <Download className="h-3.5 w-3.5" /> Descargar expediente
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Mi promedio"
            value={alumno.promedio.toFixed(1)}
            sub="Promedio general acumulado"
            subColor={promedioColor}
            icon={BarChart3}
            accent={gpc === "gpa-high" ? "green" : gpc === "gpa-mid" ? "amber" : "red"}
          />
          <StatCard label="Sesiones con tutor" value={mySesiones.length} sub="Este cuatrimestre"          icon={CalendarDays}  accent="indigo" />
          <StatCard label="Documetos subidos"   value={DOCUMENTOS.length} sub={pendientes > 0 ? `${pendientes} pendiente(s)` : "Todos aprobados"} subColor={pendientes > 0 ? "text-amber-400" : "text-emerald-400"} icon={FolderOpen} accent="amber" />
          <StatCard
            label="Estado académico"
            value={alumno.riesgo}
            sub="Nivel de riesgo"
            subColor={riesgoMap[alumno.riesgo].cls.match(/text-[^\s]+/)?.[0] ?? ""}
            icon={AlertTriangle}
            accent={alumno.riesgo === "Alto" ? "red" : alumno.riesgo === "Medio" ? "amber" : "green"}
          />
        </div>

        {/* Datos + sesiones */}
        <div className="grid grid-cols-2 gap-4">
          {/* Info académica */}
          <SectionCard>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="text-sm font-semibold text-white">Mi información académica</p>
              <p className="text-xs text-white/40">Datos de tu expediente institucional</p>
            </div>
            <div className="divide-y divide-white/[0.04] px-5">
              {([
                ["Matrícula",           alumno.matricula, true],
                ["Nombre completo",     alumno.nombre,    false],
                ["Carrera",             alumno.carrera,   false],
                ["Cuatrimestre",        `${alumno.cuatrimestre}°`, false],
                ["Correo institucional",alumno.correo,    false],
                ["Teléfono",            alumno.telefono,  true],
              ] as [string, string, boolean][]).map(([label, value, mono]) => (
                <div key={label} className="flex items-center justify-between py-3">
                  <span className="text-xs font-medium text-white/40">{label}</span>
                  <span className={cn("text-sm font-semibold text-white/90", mono && "font-mono text-xs")}>{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Mis sesiones */}
          <SectionCard>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="text-sm font-semibold text-white">Mis sesiones de tutoría</p>
              <p className="text-xs text-white/40">{mySesiones.length} sesiones este cuatrimestre</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {mySesiones.length > 0 ? mySesiones.map((s) => (
                <div key={s.id} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                    <CalendarRange className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white/90">{s.temas[0]}</p>
                    <p className="mt-0.5 truncate text-xs text-white/40">{s.temas.slice(1).join(" · ")}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-white/35">
                        <CalendarDays className="h-3 w-3" /> {formatFecha(s.fecha)}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-white/35">
                        <Clock className="h-3 w-3" /> {s.duracionMin} min
                      </span>
                    </div>
                    {s.acuerdos && (
                      <div className="mt-2 rounded-md border border-indigo-500/15 bg-indigo-500/8 px-3 py-2 text-xs text-indigo-300">
                        💡 {s.acuerdos}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <p className="py-10 text-center text-sm text-white/30">Sin sesiones registradas aún.</p>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Documentos */}
        <SectionCard>
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-white">Mis documentos</p>
              <p className="text-xs text-white/40">Expediente y archivos académicos</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
              Subir documento <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                {["Documento", "Tipo", "Fecha", "Estado"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOCUMENTOS.map((d) => (
                <TableRow key={d.id} className="border-white/[0.04] hover:bg-white/[0.03]">
                  <TableCell className="text-sm font-medium text-white/90">{d.nombre}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-white/50">
                      {d.tipo}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/50">{d.fecha}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", {
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": d.estado === "Aprobado",
                      "bg-amber-500/10 text-amber-400 border-amber-500/20":       d.estado === "Pendiente",
                    })}>
                      {d.estado}
                    </span>
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
