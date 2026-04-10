"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAuditLogs({ 
  page = 1, 
  pageSize = 15, 
  evento = "todos",
  search = ""
}: { 
  page?: number, 
  pageSize?: number, 
  evento?: string,
  search?: string
} = {}) {
  try {
    const supabase = createAdminClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 1. Iniciar consulta
    let query = supabase
      .schema('tutorias')
      .from("audit_log")
      .select("*", { count: "exact" });

    // 2. Aplicar filtros
    if (evento !== "todos") {
      query = query.eq("evento", evento);
    }

    if (search) {
      // Búsqueda simple en columnas de texto del log
      query = query.or(`tabla_afectada.ilike.%${search}%,evento.ilike.%${search}%,metadata->>nombre.ilike.%${search}%`);
    }

    // 3. Ejecutar con paginación
    const { data: logs, error: logsError, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (logsError) throw logsError;

    // 4. Obtener perfiles para los usuarios presentes en esta página
    const userIds = Array.from(new Set((logs || []).map(l => l.user_id).filter(Boolean)));
    
    let userMap = new Map();
    if (userIds.length > 0) {
      const [adminsRes, tutoresRes, docentesRes, alumnosRes] = await Promise.all([
        supabase.schema('tutorias').from("administradores").select("user_id, nombre_completo").in("user_id", userIds),
        supabase.schema('tutorias').from("tutores").select("user_id, nombre_completo").in("user_id", userIds),
        supabase.schema('tutorias').from("docentes").select("user_id, nombre_completo").in("user_id", userIds),
        supabase.schema('tutorias').from("alumnos").select("user_id, nombre_completo").in("user_id", userIds),
      ]);

      (adminsRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Administrador" }));
      (tutoresRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Tutor" }));
      (docentesRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Docente" }));
      (alumnosRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Alumno" }));
    }

    // 5. Enriquecer logs
    const enrichedLogs = (logs || []).map(log => {
      const profile = userMap.get(log.user_id);
      return {
        ...log,
        usuario_nombre: profile?.nombre || log.metadata?.nombre || log.user_id?.substring(0, 8) || "Sistema",
        usuario_rol: profile?.rol || (log.rol_activo ? log.rol_activo.replace("rol_", "") : "—")
      };
    });

    return { 
      data: enrichedLogs, 
      totalCount: count || 0,
      page,
      pageSize
    };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { error: `Error inesperado: ${error.message}` };
  }
}

