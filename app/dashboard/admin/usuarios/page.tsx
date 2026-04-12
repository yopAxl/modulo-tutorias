"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/app/_components/Sidebar";
import { PageHeader } from "@/app/_components/PageHeader";
import { SectionCard } from "@/app/_components/SectionCard";
import { StatusBadge } from "@/app/_components/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUsersAction } from "../actions";
import { toast } from "sonner";
import { CreateUserModal } from "../_components/CreateUserModal";
import SitemapFooter from "@/app/_components/SitemapFooter";
import { useI18n } from "@/app/_i18n/context";


export default function UsuariosPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0f151c]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    }>
      <UsuariosContent />
    </Suspense>
  );
}

function UsuariosContent() {
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

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRol, setFilterRol] = useState<string>("todos");
  const searchParams = useSearchParams();

  useEffect(() => {
    const rol = searchParams.get("rol");
    if (rol) setFilterRol(rol);
  }, [searchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getUsersAction();
    if (res.data) {
      setUsers((res.data as any).users || []);
    } else if (res.error) {
      toast.error(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const searchStr = search.toLowerCase();
    const matchSearch = 
      u.nombre.toLowerCase().includes(searchStr) || 
      u.correo.toLowerCase().includes(searchStr);
    const matchRol = filterRol === "todos" || u.rol === filterRol;
    return matchSearch && matchRol;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f151c]">
      <Sidebar role="Administrador" userName="Admin General" navItems={NAV_ITEMS} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 pt-18 md:p-8 md:pt-8">
        <PageHeader
          title="Gestión de Usuarios"
          subtitle={`${users.length} usuarios registrados en el sistema`}
          actions={<CreateUserModal onSuccess={fetchUsers} />}
        />

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/4 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40"
              placeholder="Buscar por nombre o correo..."
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["todos", "Administrador", "Tutor", "Docente", "Alumno"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRol(r)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  filterRol === r
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "text-white/40 hover:bg-white/6 hover:text-white/60"
                )}
              >
                {r === "todos" ? "Todos" : r}
              </button>
            ))}
          </div>
        </div>

        {/* Users table */}
        <SectionCard>
          <Table>
            <TableHeader>
              <TableRow className="border-white/6 hover:bg-transparent">
                {["Usuario", "Correo", "Rol", "Departamento", "Estado"].map((h) => (
                  <TableHead key={h} className="text-[11px] font-semibold uppercase tracking-wider text-white/30">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-white/4">
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                      <p className="text-sm text-white/40 italic">Cargando base de datos de usuarios...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="border-white/4 hover:bg-white/3">
                    <TableCell className="text-sm font-medium text-white/90">{u.nombre}</TableCell>
                    <TableCell className="text-sm text-white/50">{u.correo}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        u.rol === "Administrador" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        u.rol === "Tutor" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        u.rol === "Docente" ? "bg-pink-500/10 text-pink-400 border-pink-500/20" :
                        "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      )}>
                        <Shield className="h-3 w-3" /> {u.rol}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-white/40">{u.departamento || "—"}</TableCell>
                    <TableCell><StatusBadge status={u.activo ? "activo" : "inactivo"} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {filtered.length === 0 && !loading && (
            <p className="py-10 text-center text-sm text-white/30">No se encontraron usuarios que coincidan con la búsqueda.</p>
          )}
        </SectionCard>
      
        <div className="-mx-4 -mb-4 md:-mx-8 md:-mb-8 mt-12">
          <SitemapFooter />
        </div>
      </main>
    </div>
  );
}
