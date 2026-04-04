"use client";

import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { MOTIVOS_TUTORIA, TIPOS_CANALIZACION, NIVELES_URGENCIA } from "@/app/_lib/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, BookOpen, AlertTriangle, ArrowRightLeft, Plus } from "lucide-react";
import { StatusBadge } from "@/app/_components/StatusBadge";

const NAV_ITEMS = [
  { icon: "📊", label: "Dashboard", href: "/dashboard/admin" },
  { icon: "👥", label: "Usuarios", href: "/dashboard/admin/usuarios" },
  { icon: "🎓", label: "Tutores", href: "/dashboard/admin/tutores" },
  { icon: "📋", label: "Sesiones", href: "/dashboard/admin/sesiones" },
  { icon: "📈", label: "Reportes", href: "/dashboard/admin/reportes" },
  { icon: "📁", label: "Respaldos", href: "/dashboard/admin/respaldos" },
  { icon: "📚", label: "Auditoría", href: "/dashboard/admin/audit" },
  { icon: "⚙️", label: "Configuración", href: "/dashboard/admin/config" },
];

export default function ConfigPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Configuración del Sistema"
          subtitle="Gestión de catálogos y parámetros del sistema"
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Motivos de tutoría */}
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Motivos de tutoría</p>
                  <p className="text-xs text-white/40">Catálogo R07-M01-01</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 border-white/10 bg-white/4 text-xs text-white/50 hover:bg-white/8">
                <Plus className="h-3 w-3" /> Agregar
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Código", "Descripción", "Estado"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOTIVOS_TUTORIA.map((m) => (
                  <TableRow key={m.codigo} className="border-white/4 hover:bg-white/3">
                    <TableCell className="font-mono text-xs text-white/50">{m.codigo}</TableCell>
                    <TableCell className="text-sm text-white/80">{m.descripcion}</TableCell>
                    <TableCell><StatusBadge status="activo" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          {/* Niveles de urgencia */}
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Niveles de urgencia</p>
                  <p className="text-xs text-white/40">Catálogo de prioridades</p>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Código", "Descripción"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {NIVELES_URGENCIA.map((n) => (
                  <TableRow key={n.codigo} className="border-white/4 hover:bg-white/3">
                    <TableCell className="font-mono text-xs text-white/50">{n.codigo}</TableCell>
                    <TableCell className="text-sm text-white/80">{n.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          {/* Tipos de canalización */}
          <SectionCard>
            <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-pink-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Tipos de canalización</p>
                  <p className="text-xs text-white/40">Servicios disponibles</p>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Código", "Descripción", "Estado"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {TIPOS_CANALIZACION.map((t) => (
                  <TableRow key={t.codigo} className="border-white/4 hover:bg-white/3">
                    <TableCell className="font-mono text-xs text-white/50">{t.codigo}</TableCell>
                    <TableCell className="text-sm text-white/80">{t.descripcion}</TableCell>
                    <TableCell><StatusBadge status="activo" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>

          {/* General settings */}
          <SectionCard>
            <div className="flex items-center gap-2 border-b border-white/6 px-5 py-4">
              <Settings className="h-4 w-4 text-white/40" />
              <div>
                <p className="text-sm font-semibold text-white">Parámetros generales</p>
                <p className="text-xs text-white/40">Configuración global del sistema</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Nombre de la institución</p>
                  <p className="text-xs text-white/40">Se muestra en reportes PDF</p>
                </div>
                <span className="text-sm font-medium text-white/60">Universidad Tecnológica de Nayarit</span>
              </div>
              <div className="h-px bg-white/6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Cuatrimestre actual</p>
                  <p className="text-xs text-white/40">Período académico vigente</p>
                </div>
                <span className="text-sm font-medium text-white/60">Enero – Abril 2026</span>
              </div>
              <div className="h-px bg-white/6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/80">Formato de sesión</p>
                  <p className="text-xs text-white/40">Código del formato oficial</p>
                </div>
                <span className="font-mono text-sm text-white/60">R07-M01-01</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
