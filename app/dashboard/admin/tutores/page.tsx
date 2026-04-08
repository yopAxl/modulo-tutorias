"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatCard } from "@/app/_components/StatCard";
import { RiskBadge } from "@/app/_components/RiskBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  CalendarDays, 
  BarChart3, 
  Loader2, 
  Trash2, 
  Edit, 
  X, 
  MousePointer2,
  CheckSquare,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTutoresManagementData, deleteAssignmentsAction } from "../actions";
import { toast } from "sonner";
import { AssignTutorModal } from "../_components/AssignTutorModal";
import { EditAssignmentModal } from "../_components/EditAssignmentModal";
import { ConfirmModal } from "../_components/ConfirmModal";

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

export default function TutoresAdminPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    kpis: { totalTutores: number; totalAlumnos: number; totalSesiones: number; promedio: string };
    tutores: any[];
    asignaciones: any[];
  } | null>(null);

  // Estados de gestión masiva
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Estado para el modal de edición
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    ids: string[];
    names: string[];
  }>({
    isOpen: false,
    ids: [],
    names: []
  });

  // Estado para confirmación de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    ids: string[];
    isDeleting: boolean;
  }>({
    isOpen: false,
    ids: [],
    isDeleting: false
  });

  async function loadData() {
    try {
      const res = await getTutoresManagementData();
      if (res.error) throw new Error(res.error);
      if (res.data) setData(res.data);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === (data?.asignaciones?.length || 0)) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.asignaciones?.map(a => a.id) || []);
    }
  };

  const handleDeleteMany = async (ids: string[]) => {
    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const res = await deleteAssignmentsAction(ids);
      if (res.error) throw new Error(res.error);
      
      toast.success("Asignación(es) eliminada(s) correctamente.");
      setSelectedIds([]);
      setSelectionMode(false);
      setDeleteConfirm({ isOpen: false, ids: [], isDeleting: false });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar");
    } finally {
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-white/40">Cargando gestión de tutores...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || { totalTutores: 0, totalAlumnos: 0, totalSesiones: 0, promedio: "0.0" };
  const tutores = data?.tutores || [];
  const asignaciones = data?.asignaciones || [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Gestión de Tutores"
          subtitle={`${kpis.totalTutores} tutores activos · Asignaciones y carga de trabajo`}
          actions={<AssignTutorModal onSuccess={loadData} />}
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total tutores" value={kpis.totalTutores} sub="Activos este cuatrimestre" icon={GraduationCap} accent="green" />
          <StatCard label="Alumnos asignados" value={kpis.totalAlumnos} sub="Total en el sistema" icon={Users} accent="green" />
          <StatCard label="Sesiones totales" value={kpis.totalSesiones} sub="Este cuatrimestre" icon={CalendarDays} accent="amber" />
          <StatCard label="Prom. alumnos/tutor" value={kpis.promedio} sub="Distribución de carga" icon={BarChart3} accent="green" />
        </div>

        {/* Tutor detail cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tutores.map((tutor) => (
            <SectionCard key={tutor.id}>
              <div className="border-b border-white/6 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/15">
                    <GraduationCap className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tutor.nombre}</p>
                    <p className="text-xs text-white/40">{tutor.departamento}</p>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="mb-3 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-white">{tutor.alumnosAsignados}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Alumnos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-extrabold text-white">{tutor.sesionesTotales}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Sesiones</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-lg font-extrabold", tutor.enRiesgo > 0 ? "text-amber-400" : "text-emerald-400")}>{tutor.enRiesgo}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">En riesgo</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-white/35"><span className="text-white/50">Especialidad:</span> {tutor.especialidad}</p>
                  <p className="text-xs text-white/35"><span className="text-white/50">ID:</span> {tutor.id.split("-")[0]}...</p>
                </div>
              </div>
            </SectionCard>
          ))}
          {tutores.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-white/20 italic">
              No hay tutores registrados en el sistema.
            </div>
          )}
        </div>

        {/* Full tutor table */}
        <SectionCard>
          <div className="border-b border-white/6 px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Asignaciones tutor-alumno</p>
              <p className="text-xs text-white/40">Detalle de alumnos asignados a cada tutor</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {selectionMode ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleAll}
                    className="h-8 text-[10px] font-bold uppercase text-white/40 hover:text-white"
                  >
                    {selectedIds.length === asignaciones.length ? "Desmarcar todos" : "Seleccionar todos"}
                  </Button>
                  <div className="h-4 w-px bg-white/10 mx-1" />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={selectedIds.length === 0}
                    onClick={() => setDeleteConfirm({ isOpen: true, ids: selectedIds, isDeleting: false })}
                    className="h-8 px-3 text-[10px] font-bold uppercase bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                  >
                    <Trash2 className="h-3 w-3 mr-2" /> Eliminar ({selectedIds.length})
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                      const selectedAsigs = asignaciones.filter(a => selectedIds.includes(a.id));
                      setEditModal({
                        isOpen: true,
                        ids: selectedIds,
                        names: selectedAsigs.map(a => a.alumnoNombre)
                      });
                    }}
                    className="h-8 px-3 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
                  >
                    <Edit className="h-3 w-3 mr-2" /> Editar ({selectedIds.length})
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setSelectionMode(false); setSelectedIds([]); }}
                    className="h-8 w-8 p-0 text-white/20 hover:text-white/60"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectionMode(true)}
                  className="h-8 px-3 text-[10px] font-bold uppercase border-white/5 bg-white/2 text-white/40 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all"
                >
                  <MousePointer2 className="h-3 w-3 mr-2" /> Modo seleccionar
                </Button>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {selectionMode && (
                    <TableHead className="w-10">
                      <div 
                        onClick={toggleAll}
                        className="flex h-5 w-5 items-center justify-center cursor-pointer text-white/20 hover:text-emerald-500 transition-colors"
                      >
                        {selectedIds.length === asignaciones.length && asignaciones.length > 0 ? (
                          <CheckSquare className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                  )}
                  {["Tutor", "Alumno", "Matrícula", "Carrera", "Cuatr.", "Riesgo", "Acciones"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignaciones.map((a) => (
                  <TableRow 
                    key={a.id} 
                    className={cn(
                      "border-white/4 transition-colors",
                      selectedIds.includes(a.id) ? "bg-emerald-500/5 hover:bg-emerald-500/8" : "hover:bg-white/3"
                    )}
                  >
                    {selectionMode && (
                      <TableCell>
                        <div 
                          onClick={() => toggleSelection(a.id)}
                          className="flex h-5 w-5 items-center justify-center cursor-pointer text-white/20 hover:text-emerald-500 transition-colors"
                        >
                          {selectedIds.includes(a.id) ? (
                            <CheckSquare className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-white/60 truncate max-w-[150px]">{a.tutorNombre}</TableCell>
                    <TableCell className="text-sm font-medium text-white/90">{a.alumnoNombre}</TableCell>
                    <TableCell className="font-mono text-xs text-white/50">{a.matricula}</TableCell>
                    <TableCell className="text-sm text-white/50">{a.carrera}</TableCell>
                    <TableCell className="text-sm text-white/50">{a.cuatrimestre}°</TableCell>
                    <TableCell><RiskBadge riesgo={a.riesgo} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditModal({ isOpen: true, ids: [a.id], names: [a.alumnoNombre] })}
                          className="h-7 w-7 p-0 text-white/20 hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDeleteConfirm({ isOpen: true, ids: [a.id], isDeleting: false })}
                          className="h-7 w-7 p-0 text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {asignaciones.length === 0 && (
            <p className="py-10 text-center text-sm text-white/30">No se encontraron asignaciones de tutores.</p>
          )}
        </SectionCard>

        {/* Modales Adicionales */}
        <EditAssignmentModal 
          isOpen={editModal.isOpen}
          assignmentIds={editModal.ids}
          studentNames={editModal.names}
          onClose={() => setEditModal({ ...editModal, isOpen: false })}
          onSuccess={() => {
            loadData();
            setSelectedIds([]);
            setSelectionMode(false);
          }}
        />

        <ConfirmModal 
          isOpen={deleteConfirm.isOpen}
          loading={deleteConfirm.isDeleting}
          title="¿Confirmar eliminación?"
          description={`¿Estás seguro de que deseas desactivar ${deleteConfirm.ids.length === 1 ? 'esta asignación' : `estas ${deleteConfirm.ids.length} asignaciones`}? Los registros se marcarán como inactivos pero se conservará el historial.`}
          confirmText="Sí, eliminar"
          cancelText="No, cancelar"
          onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
          onConfirm={() => handleDeleteMany(deleteConfirm.ids)}
        />
      </main>
    </div>
  );
}
