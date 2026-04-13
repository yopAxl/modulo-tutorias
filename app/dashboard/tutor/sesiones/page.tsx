"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarDays, Clock, FileText, Loader2, AlertTriangle, Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getTutorSesiones, getCatalogosTutoria, getExpedienteAlumno } from "../actions";
import { toast } from "sonner";

// Componentes Refactorizados
import { CreateSessionModal } from "../_components/CreateSessionModal";
import { SessionDetailsModal } from "../_components/SessionDetailsModal";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";

// Formateador de fecha
function formatFechaReal(dateStr: string) {
  if (!dateStr) return "Sin fecha";
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}


export default function SesionesTutorPage() {
  const { t } = useI18n();

  const NAV_ITEMS = [
  { icon: "📊", label: t("nav.tutor.dashboard"), href: "/dashboard/tutor" },
  { icon: "👥", label: t("nav.tutor.students"), href: "/dashboard/tutor/alumnos" },
  { icon: "📅", label: t("nav.tutor.sessions"), href: "/dashboard/tutor/sesiones" },
  { icon: "📁", label: t("nav.tutor.records"), href: "/dashboard/tutor/expedientes" },
  { icon: "📈", label: t("nav.tutor.reports"), href: "/dashboard/tutor/reportes" },
];
  const router = useRouter();
  const supabase = createClient();
  
  const [tutorNombre, setTutorNombre] = useState("Cargando...");
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [sesiones, setSesiones] = useState<any[]>([]);
  const [misAlumnos, setMisAlumnos] = useState<any[]>([]);
  const [catalogos, setCatalogos] = useState<any>({ motivos: [] });

  // Estados de Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionToEdit, setSessionToEdit] = useState<any | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<string>("todas");

  async function loadData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const [resSesiones, resCatalogos] = await Promise.all([
        getTutorSesiones(user.id),
        getCatalogosTutoria()
      ]);

      if (resSesiones.error === "PERFIL_NO_ENCONTRADO") {
        setTutorId("NO_PROFILE");
        setTutorNombre(user.user_metadata?.nombre_completo || user.email || "Usuario");
      } else if (resSesiones.data) {
        setTutorId(resSesiones.data.tutor.id);
        setTutorNombre(resSesiones.data.tutor.nombre_completo || user.email);
        setSesiones(resSesiones.data.sesiones);
        setMisAlumnos(resSesiones.data.alumnosAsignados);
      }

      if (resCatalogos.data) {
        setCatalogos(resCatalogos.data);
      }

    } catch (err) {
      toast.error("Error al cargar sesiones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [router, supabase]);

  const filtered = sesiones.filter(
    (s) => filterStatus === "todas" || s.estatus === filterStatus
  );

  const handleOpenDetails = async (session: any) => {
    // Necesitamos mapear los nombres de motivos para el modal de detalle
    const sessionWithMotivos: any = {
      ...session,
      alumnoNombre: session.alumnos?.nombre_completo || "Alumno",
      motivos: session.sesion_motivos?.map((sm: any) => {
        return catalogos.motivos.find((m: any) => m.codigo === sm.motivo_codigo)?.descripcion || sm.motivo_codigo;
      }) || []
    };

    // Para sesiones realizadas, cargar datos de seguimiento del alumno
    if (session.estatus === "realizada" && session.alumno_id) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const expRes = await getExpedienteAlumno(user.id, session.alumno_id);
          if (expRes.data) {
            sessionWithMotivos._canalizaciones = expRes.data.canalizaciones || [];
            sessionWithMotivos._incidencias = expRes.data.incidencias || [];
            sessionWithMotivos._planes = expRes.data.planes || [];
          }
        }
      } catch (err) {
        // Fallo silencioso — el modal mostrará "sin datos"
      }
    }

    setSelectedSession(sessionWithMotivos);
    setIsDetailsModalOpen(true);
  };

  const handleOpenEdit = async (e: React.MouseEvent, session: any) => {
    e.stopPropagation();
    
    // Para sesiones realizadas, cargar datos de seguimiento existentes
    if (session.estatus === "realizada" && session.alumno_id) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const expRes = await getExpedienteAlumno(user.id, session.alumno_id);
          if (expRes.data) {
            session._existingCanalizaciones = expRes.data.canalizaciones || [];
            session._existingIncidencias = expRes.data.incidencias || [];
            session._existingPlanes = expRes.data.planes || [];
          }
        }
      } catch (err) {
        // Fallo silencioso
      }
    }
    
    setSessionToEdit(session);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateModalOpen(false);
    setSessionToEdit(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (tutorId === "NO_PROFILE") {
    return (
      <div className="flex h-screen overflow-hidden bg-[#0f151c]">
        <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-md w-full rounded-xl border border-amber-500/20 bg-amber-500/5 p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Perfil de Tutor no encontrado</h2>
            <p className="text-sm text-white/60 mb-6">
              Tu cuenta no tiene un perfil de tutor asociado. 
              Contacta al administrador para habilitar tu acceso a este módulo.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Tutor" userName={tutorNombre} navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Sesiones de Tutoría"
          subtitle={`${sesiones.length} sesiones registradas`}
          actions={
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-2 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" /> Nueva sesión
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {["todas", "programada", "realizada", "cancelada", "pendiente"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filterStatus === s ? "bg-emerald-600/15 text-emerald-400" : "text-white/40 hover:bg-white/6 hover:text-white/60"
              )}
            >
              {s === "todas" ? "Todas" : s.replace(/\b\w/, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Alumno</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Fecha</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Horario</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-center">Urgencia</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-center">Estatus</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow 
                  key={s.id} 
                  onClick={() => handleOpenDetails(s)}
                  className="border-white/4 hover:bg-white/3 cursor-pointer transition-colors group"
                >
                  <TableCell>
                    <p className="text-sm font-medium text-white/90">{s.alumnos?.nombre_completo || "—"}</p>
                    <p className="text-[10px] text-white/30 font-mono">{s.alumnos?.matricula || ""}</p>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-white/60">
                      <CalendarDays className="h-3.5 w-3.5 text-white/20" /> {formatFechaReal(s.fecha)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-sm text-white/50">
                      <Clock className="h-3.5 w-3.5 text-white/20" /> {s.hora_inicio?.slice(0, 5)} - {s.hora_fin?.slice(0, 5)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge 
                      status={s.nivel_urgencia} 
                      variant={s.nivel_urgencia === "alta" ? "danger" : s.nivel_urgencia === "media" ? "warning" : "success"}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={s.estatus} />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => handleOpenEdit(e, s)}
                        className="h-8 w-8 text-white/20 hover:text-emerald-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 group-hover:text-white/60">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <FileText className="h-10 w-10 text-white/5 mx-auto mb-3" />
              <p className="text-sm text-white/20 font-medium">No se encontraron sesiones registradas.</p>
            </div>
          )}
        </SectionCard>
      
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>

      {/* Modales */}
      <CreateSessionModal 
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreate}
        alumnos={misAlumnos}
        catalogos={catalogos}
        tutorId={tutorId!}
        sessionToEdit={sessionToEdit}
        onSuccess={loadData}
      />

      <SessionDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        session={selectedSession}
        tutorName={tutorNombre}
      />
    </div>
  );
}
