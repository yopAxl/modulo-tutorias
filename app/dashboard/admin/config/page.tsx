"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard, SectionCardHeader } from "@/app/_components/SectionCard";
import { getCatalogsAction } from "./actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, BookOpen, AlertTriangle, ArrowRightLeft, Loader2 } from "lucide-react";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { CreateCatalogModal } from "./_components/CreateCatalogModal";
import { toast } from "sonner";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";


export default function ConfigPage() {
  const { t } = useI18n();

  const NAV_ITEMS = [
  { icon: "📊", label: t("nav.admin.dashboard"), href: "/dashboard/admin" },
  { icon: "👥", label: t("nav.admin.users"), href: "/dashboard/admin/usuarios" },
  { icon: "🎓", label: t("nav.admin.tutors"), href: "/dashboard/admin/tutores" },
  { icon: "📋", label: t("nav.admin.sessions"), href: "/dashboard/admin/sesiones" },
  { icon: "📈", label: t("nav.admin.reports"), href: "/dashboard/admin/reportes" },
  { icon: "📁", label: t("nav.admin.backups"), href: "/dashboard/admin/respaldos" },
  { icon: "📚", label: t("nav.admin.audit"), href: "/dashboard/admin/audit" },
  { icon: "⚙️", label: t("nav.admin.settings"), href: "/dashboard/admin/config" },
];
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    motivos: any[];
    urgencias: any[];
    canalizaciones: any[];
  }>({
    motivos: [],
    urgencias: [],
    canalizaciones: [],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await getCatalogsAction();
    if (res.error) {
      toast.error(res.error);
    } else {
      setData({
        motivos: res.motivos || [],
        urgencias: res.urgencias || [],
        canalizaciones: res.canalizaciones || [],
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && data.motivos.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0f151c]">
        <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-white/40 italic">Cargando catálogos del sistema...</p>
          </div>
        </main>
      </div>
    );
  }

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
            <SectionCardHeader
              title="Motivos de tutoría"
              subtitle="Catálogo R07-M01-01"
              action={
                <CreateCatalogModal
                  tableName="cat_motivo_tutoria"
                  title="Motivo de Tutoría"
                  onSuccess={loadData}
                  hasOrder
                />
              }
            />
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/6 hover:bg-transparent sticky top-0 bg-[#151c24] z-10 shadow-sm">
                    {["Código", "Descripción", "Estado"].map((h) => (
                      <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.motivos.map((m) => (
                    <TableRow key={m.codigo} className="border-white/4 hover:bg-white/3 transition-colors">
                      <TableCell className="font-mono text-xs text-white/50">{m.codigo}</TableCell>
                      <TableCell className="text-sm text-white/80">{m.descripcion}</TableCell>
                      <TableCell><StatusBadge status={m.activo ? "activo" : "inactivo"} /></TableCell>
                    </TableRow>
                  ))}
                  {data.motivos.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center py-10 text-white/20 italic">No hay registros</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* Niveles de urgencia */}
          <SectionCard>
            <SectionCardHeader
              title="Niveles de urgencia"
              subtitle="Prioridades de atención"
              action={
                <CreateCatalogModal
                  tableName="cat_nivel_urgencia"
                  title="Nivel de Urgencia"
                  onSuccess={loadData}
                  hasOrder
                />
              }
            />
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/6 hover:bg-transparent sticky top-0 bg-[#151c24] z-10 shadow-sm">
                    {["Código", "Descripción", "Orden", "Estado"].map((h) => (
                      <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.urgencias.map((n) => (
                    <TableRow key={n.codigo} className="border-white/4 hover:bg-white/3 transition-colors">
                      <TableCell className="font-mono text-xs text-white/50">{n.codigo}</TableCell>
                      <TableCell className="text-sm text-white/80">{n.descripcion}</TableCell>
                      <TableCell className="text-xs text-white/40 text-center">{n.orden || 0}</TableCell>
                      <TableCell><StatusBadge status={n.activo ? "activo" : "inactivo"} /></TableCell>
                    </TableRow>
                  ))}
                  {data.urgencias.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-white/20 italic">No hay registros</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </SectionCard>

          {/* Tipos de canalización */}
          <SectionCard>
            <SectionCardHeader
              title="Tipos de canalización"
              subtitle="Servicios de apoyo disponibles"
              action={
                <CreateCatalogModal
                  tableName="cat_tipo_canalización"
                  title="Tipo de Canalización"
                  onSuccess={loadData}
                />
              }
            />
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/6 hover:bg-transparent sticky top-0 bg-[#151c24] z-10 shadow-sm">
                    {["Código", "Descripción", "Estado"].map((h) => (
                      <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.canalizaciones.map((t) => (
                    <TableRow key={t.codigo} className="border-white/4 hover:bg-white/3 transition-colors">
                      <TableCell className="font-mono text-xs text-white/50">{t.codigo}</TableCell>
                      <TableCell className="text-sm text-white/80">{t.descripcion}</TableCell>
                      <TableCell><StatusBadge status={t.activo ? "activo" : "inactivo"} /></TableCell>
                    </TableRow>
                  ))}
                  {data.canalizaciones.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center py-10 text-white/20 italic">No hay registros</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
      
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
