"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { ALUMNOS, formatFecha, formatTamano } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, FileText, X, Plus, Loader2 } from "lucide-react";

// Datos de Emiliano para mantener consistencia
const FallbackAlumno = {
  id: "a1",
  matricula: "tic-310097",
  nombre: "Emiliano Estrada Parra",
  genero: "M",
  carrera: "IDGS",
  grupo: "83",
  cuatrimestre: 8,
  promedio: 9.8,
  riesgo: "Bajo" as const,
  correo: "tic-310097@utnay.edu.mx",
  telefono: "3112447230",
  tutorId: "t1",
  docenteId: "d1",
  activo: true,
};

// Documentos extraídos de la imagen image_6019e0.png
const MIS_DOCUMENTOS_MOCK = [
  {
    id: "d1",
    nombreArchivo: "Comprobante de inscripción",
    tipoDocumento: "PDF",
    tamanoBytes: 1024 * 450, // 450 KB aprox
    fecha: "2026-01-10",
    estado: "Aprobado"
  },
  {
    id: "d2",
    nombreArchivo: "Historial académico",
    tipoDocumento: "PDF",
    tamanoBytes: 1024 * 820, // 820 KB aprox
    fecha: "2026-01-15",
    estado: "Aprobado"
  },
  {
    id: "d3",
    nombreArchivo: "Justificante médico – Feb 2026",
    tipoDocumento: "PDF",
    tamanoBytes: 1024 * 310, // 310 KB aprox
    fecha: "2026-02-20",
    estado: "Pendiente"
  }
];

const NAV_ITEMS = [
  { icon: "📊", label: "Mi panel", href: "/dashboard/alumno" },
  { icon: "📅", label: "Mis sesiones", href: "/dashboard/alumno/sesiones" },
  { icon: "📁", label: "Expediente", href: "/dashboard/alumno/expediente" },
  { icon: "📄", label: "Documentos", href: "/dashboard/alumno/documentos" },
];

const TIPOS_DOCUMENTO = [
  { codigo: "kardex", descripcion: "Kárdex" },
  { codigo: "constancia", descripcion: "Constancia" },
  { codigo: "plan_accion", descripcion: "Plan de acción" },
  { codigo: "justificante", descripcion: "Justificante" },
  { codigo: "otro", descripcion: "Otro" },
];

export default function DocumentosAlumnoPage() {
  const supabase = createClient();
  const [alumno, setAlumno] = useState(FallbackAlumno);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    async function inicializarSesion() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email) {
          const alumnoReal = ALUMNOS.find(a => a.correo === user.email);
          if (alumnoReal) setAlumno(alumnoReal);
        }
      } catch (error) {
        console.error("Error cargando documentos:", error);
      } finally {
        setLoading(false);
      }
    }
    inicializarSesion();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Alumno" userName={alumno.nombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Mis Documentos"
          subtitle={`${MIS_DOCUMENTOS_MOCK.length} documentos en tu expediente`}
          actions={
            <Button
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <Upload className="h-4 w-4" /> Subir documento
            </Button>
          }
        />

        {/* Formulario de subida */}
        {showUpload && (
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <p className="text-sm font-semibold text-white">Subir nuevo documento</p>
              <button onClick={() => setShowUpload(false)} className="text-white/30 hover:text-white/60">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Tipo de documento</label>
                <select className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/40 appearance-none">
                  <option value="">Seleccionar tipo</option>
                  {TIPOS_DOCUMENTO.map((t) => (
                    <option key={t.codigo} value={t.codigo}>{t.descripcion}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Descripción</label>
                <input className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40" placeholder="Descripción breve" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">Archivo</label>
                <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 px-6 py-8 transition-colors hover:border-emerald-500/30 cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-8 w-8 text-white/20" />
                    <p className="text-sm text-white/40">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                    <p className="text-xs text-white/20">PDF, PNG, JPG · Máx 10 MB</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end sm:col-span-2">
                <Button size="sm" className="gap-2 bg-emerald-600 text-white hover:bg-emerald-500">
                  <Plus className="h-4 w-4" /> Subir documento
                </Button>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Tabla de Documentos - Actualizada con la imagen image_6019e0.png */}
        <SectionCard>
          <div className="border-b border-white/6 px-5 py-4">
            <p className="text-sm font-semibold text-white">Documentos disponibles</p>
            <p className="text-xs text-white/40">Solo se muestran documentos con visibilidad pública</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Documento</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-center">Tipo</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Fecha</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MIS_DOCUMENTOS_MOCK.map((d) => (
                <TableRow key={d.id} className="border-white/4 hover:bg-white/3">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-white/30" />
                      <span className="text-sm font-medium text-white/80">{d.nombreArchivo}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/40 border border-white/10">
                      {d.tipoDocumento}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-white/50">{formatFecha(d.fecha)}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge 
                      status={d.estado} 
                      variant={d.estado === "Aprobado" ? "success" : "warning"} 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {MIS_DOCUMENTOS_MOCK.length === 0 && (
            <p className="py-10 text-center text-sm text-white/30">No tienes documentos disponibles.</p>
          )}
        </SectionCard>
      </main>
    </div>
  );
}