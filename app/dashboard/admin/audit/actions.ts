"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAuditLogs() {
  try {
    const supabase = createAdminClient();

    // 1. Obtener logs
    const { data: logs, error: logsError } = await supabase
      .schema('tutorias')
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (logsError) throw logsError;

    // 2. Obtener perfiles para el mapeo (En paralelo para velocidad)
    const [adminsRes, tutoresRes, docentesRes, alumnosRes] = await Promise.all([
      supabase.schema('tutorias').from("administradores").select("user_id, nombre_completo"),
      supabase.schema('tutorias').from("tutores").select("user_id, nombre_completo"),
      supabase.schema('tutorias').from("docentes").select("user_id, nombre_completo"),
      supabase.schema('tutorias').from("alumnos").select("user_id, nombre_completo"),
    ]);

    // Crear un mapa de UserID -> { nombre, rol }
    const userMap = new Map();
    (adminsRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Administrador" }));
    (tutoresRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Tutor" }));
    (docentesRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Docente" }));
    (alumnosRes.data || []).forEach(u => userMap.set(u.user_id, { nombre: u.nombre_completo, rol: "Alumno" }));

    // 3. Enriquecer cada registro del log
    const enrichedLogs = (logs || []).map(log => {
      const profile = userMap.get(log.user_id);
      return {
        ...log,
        usuario_nombre: profile?.nombre || log.metadata?.nombre || log.user_id?.substring(0, 8) || "Sistema",
        usuario_rol: profile?.rol || log.rol_activo?.replace("rol_", "") || "—"
      };
    });

    return { data: enrichedLogs };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { error: `Error inesperado: ${error.message}` };
  }
}
