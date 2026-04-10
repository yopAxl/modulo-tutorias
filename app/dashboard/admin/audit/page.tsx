"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { formatFechaHora } from "@/app/_lib/mock-data";
import { getAuditLogs } from "./actions";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterEvento, setFilterEvento] = useState<string>("todos");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reiniciar a la primera página al buscar
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      const res = await getAuditLogs({
        page,
        pageSize,
        evento: filterEvento,
        search: debouncedSearch
      });

      if (res.data) {
        setLogs(res.data);
        setTotalCount(res.totalCount || 0);
      } else if (res.error) {
        toast.error(res.error);
      }
      setLoading(false);
    }
    loadLogs();
  }, [page, filterEvento, debouncedSearch, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Log de Auditoría"
          subtitle="Registro de eventos del sistema · Solo visible para administradores"
        />

        {/* Security notice */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <Shield className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-amber-400">Acceso restringido</p>
            <p className="text-xs text-white/40">Este log es de solo lectura. Ningún rol puede modificar ni eliminar registros.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              placeholder="Buscar por usuario o tabla..."
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["todos", "CREATE_USER", "TRIGGER_BACKUP", "LOGIN", "ACCESS_DENIED"].map((ev) => (
              <button
                key={ev}
                onClick={() => { setFilterEvento(ev); setPage(1); }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterEvento === ev
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {ev === "todos" ? "Todos" : ev.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <SectionCard>
          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="border-white/6 hover:bg-transparent">
                  {["Fecha", "Usuario", "Rol", "Evento", "Tabla", "IP", "Detalles"].map((h) => (
                    <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="border-white/4">
                    <TableCell colSpan={7} className="text-center py-20 text-sm text-white/40 italic">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-emerald-500" />
                        <span className="animate-pulse">Sincronizando historial...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.map((e) => (
                  <TableRow key={e.id} className="border-white/4 hover:bg-white/3 transition-colors duration-200">
                    <TableCell className="whitespace-nowrap text-xs text-white/50">{formatFechaHora(e.created_at)}</TableCell>
                    <TableCell className="text-sm font-medium text-white/80">
                      {e.usuario_nombre}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] font-semibold text-white/50 capitalize">
                        {e.usuario_rol}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={e.evento} variant={e.evento.includes('DENIED') ? 'danger' : (e.evento.includes('CREATE') ? 'success' : 'info')} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/40">{e.tabla_afectada || "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-white/30">{e.ip_address || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-[10px] text-white/30 hover:whitespace-normal hover:overflow-visible hover:bg-[#1a222c] cursor-help">
                      {Object.keys(e.metadata || {}).length > 0
                        ? JSON.stringify(e.metadata)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!loading && logs.length === 0 && (
              <p className="py-20 text-center text-sm text-white/30 italic">No se encontraron registros en esta búsqueda.</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-white/6 bg-white/[0.02] px-5 py-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/30">
                Mostrando <span className="font-semibold text-white/70">{logs.length}</span> de <span className="font-semibold text-white/70">{totalCount}</span> eventos
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/6 bg-white/4 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                onClick={() => handlePageChange(1)}
                disabled={page === 1 || loading}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/6 bg-white/4 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              <div className="mx-2 flex items-center gap-1.5 px-2">
                <span className="text-xs font-bold text-emerald-400">{page}</span>
                <span className="text-[10px] font-medium text-white/20 uppercase">de</span>
                <span className="text-xs font-semibold text-white/50">{totalPages || 1}</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/6 bg-white/4 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-white/6 bg-white/4 text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20"
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages || loading}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
