"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Tipos de retorno ────────────────────────────────────────────────────────

export type AlumnoPerfil = {
  id: string;
  matricula: string;
  nombre_completo: string;
  genero: string;
  telefono: string;
  correo_institucional: string;
  carrera: string;
  grupo: string;
  cuatrimestre: number;
  promedio_general: number;
  riesgo_academico: string;
  activo: boolean;
  created_at: string;
};

export type SesionAlumno = {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  duracion_minutos: number;
  puntos_relevantes: string | null;
  compromisos_acuerdos: string | null;
  nivel_urgencia: string;
  estatus: string;
  confirmado_tutor: boolean;
  confirmado_alumno: boolean;
  fecha_confirmacion_alumno: string | null;
  tutor: { nombre_completo: string } | null;
  motivos: { motivo_codigo: string; detalle: string | null }[];
};

export type CalificacionAlumno = {
  id: string;
  asignatura: string;
  periodo: string;
  calificacion: number;
  tipo_evaluacion: string;
  observaciones: string | null;
  created_at: string;
};

export type DocumentoAlumno = {
  id: string;
  tipo_documento: string;
  nombre_archivo: string;
  storage_path: string;
  storage_bucket: string;
  nivel_privacidad: string;
  mime_type: string;
  tamano_bytes: number;
  created_at: string;
};

export type PlanAccionAlumno = {
  id: string;
  periodo: string;
  objetivo_general: string;
  metas: { descripcion: string; fecha_limite: string; lograda: boolean }[];
  estatus: string;
  fecha_inicio: string;
  fecha_revision: string | null;
  tutor: { nombre_completo: string } | null;
};

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Obtiene el perfil completo del alumno autenticado.
 * RLS garantiza que solo puede ver su propio registro.
 */
export async function getAlumnoPerfil(): Promise<
  { data: AlumnoPerfil } | { error: string }
> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { error: "No autenticado" };
    }

    const { data, error } = await supabase
      .schema("tutorias")
      .from("alumnos")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      console.error("getAlumnoPerfil error:", error);
      return { error: "No se encontró el perfil de alumno." };
    }

    return { data: data as AlumnoPerfil };
  } catch (error: any) {
    console.error("getAlumnoPerfil unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Obtiene las sesiones de tutoría del alumno autenticado.
 * Incluye nombre del tutor y motivos de cada sesión.
 */
export async function getSesionesAlumno(): Promise<
  { data: SesionAlumno[] } | { error: string }
> {
  try {
    const supabase = await createClient();

    const alumnoResult = await getAlumnoPerfil();
    if ("error" in alumnoResult) return { error: alumnoResult.error };

    const { data, error } = await supabase
      .schema("tutorias")
      .from("sesiones_tutoria")
      .select(
        `
        id, fecha, hora_inicio, hora_fin, duracion_minutos,
        puntos_relevantes, compromisos_acuerdos, nivel_urgencia,
        estatus, confirmado_tutor, confirmado_alumno, fecha_confirmacion_alumno,
        tutor:tutor_id ( nombre_completo ),
        motivos:sesion_motivos ( motivo_codigo, detalle )
      `
      )
      .eq("alumno_id", alumnoResult.data.id)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("getSesionesAlumno error:", error);
      return { error: "Error al cargar las sesiones." };
    }

    // Supabase returns joined relations as arrays; normalize tutor to single object
    const normalized = (data ?? []).map((s: any) => ({
      ...s,
      tutor: Array.isArray(s.tutor) ? (s.tutor[0] ?? null) : s.tutor,
    })) as unknown as SesionAlumno[];
    return { data: normalized };
  } catch (error: any) {
    console.error("getSesionesAlumno unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Obtiene las calificaciones del alumno autenticado.
 */
export async function getCalificacionesAlumno(): Promise<
  { data: CalificacionAlumno[] } | { error: string }
> {
  try {
    const supabase = await createClient();

    const alumnoResult = await getAlumnoPerfil();
    if ("error" in alumnoResult) return { error: alumnoResult.error };

    const { data, error } = await supabase
      .schema("tutorias")
      .from("calificaciones")
      .select("id, asignatura, periodo, calificacion, tipo_evaluacion, observaciones, created_at")
      .eq("alumno_id", alumnoResult.data.id)
      .order("periodo", { ascending: false });

    if (error) {
      console.error("getCalificacionesAlumno error:", error);
      return { error: "Error al cargar calificaciones." };
    }

    return { data: (data ?? []) as CalificacionAlumno[] };
  } catch (error: any) {
    console.error("getCalificacionesAlumno unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Obtiene los documentos visibles del alumno autenticado.
 * RLS filtra automáticamente documentos con nivel_privacidad='visible'.
 */
export async function getDocumentosAlumno(): Promise<
  { data: DocumentoAlumno[] } | { error: string }
> {
  try {
    const supabase = await createClient();

    const alumnoResult = await getAlumnoPerfil();
    if ("error" in alumnoResult) return { error: alumnoResult.error };

    const { data, error } = await supabase
      .schema("tutorias")
      .from("documentos")
      .select(
        "id, tipo_documento, nombre_archivo, storage_path, storage_bucket, nivel_privacidad, mime_type, tamano_bytes, created_at"
      )
      .eq("alumno_id", alumnoResult.data.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getDocumentosAlumno error:", error);
      return { error: "Error al cargar documentos." };
    }

    return { data: (data ?? []) as DocumentoAlumno[] };
  } catch (error: any) {
    console.error("getDocumentosAlumno unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Obtiene los planes de acción del alumno autenticado.
 */
export async function getPlanesAccionAlumno(): Promise<
  { data: PlanAccionAlumno[] } | { error: string }
> {
  try {
    const supabase = await createClient();

    const alumnoResult = await getAlumnoPerfil();
    if ("error" in alumnoResult) return { error: alumnoResult.error };

    const { data, error } = await supabase
      .schema("tutorias")
      .from("planes_accion")
      .select(
        `
        id, periodo, objetivo_general, metas, estatus,
        fecha_inicio, fecha_revision,
        tutor:tutor_id ( nombre_completo )
      `
      )
      .eq("alumno_id", alumnoResult.data.id)
      .order("fecha_inicio", { ascending: false });

    if (error) {
      console.error("getPlanesAccionAlumno error:", error);
      return { error: "Error al cargar planes de acción." };
    }

    // Supabase returns joined relations as arrays; normalize tutor to single object
    const normalized = (data ?? []).map((p: any) => ({
      ...p,
      tutor: Array.isArray(p.tutor) ? (p.tutor[0] ?? null) : p.tutor,
    })) as unknown as PlanAccionAlumno[];
    return { data: normalized };
  } catch (error: any) {
    console.error("getPlanesAccionAlumno unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Genera una URL firmada temporal para descargar un documento del storage.
 * El alumno solo puede pedir URLs de sus propios documentos visibles (RLS).
 */
export async function getDocumentoUrl(
  storagePath: string,
  bucket: string = "tutorias-docs"
): Promise<{ url: string } | { error: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 60); // 60 segundos

    if (error || !data) {
      console.error("getDocumentoUrl error:", error);
      return { error: "No se pudo generar el enlace de descarga." };
    }

    return { url: data.signedUrl };
  } catch (error: any) {
    console.error("getDocumentoUrl unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Sube un documento al bucket de Supabase Storage y registra
 * los metadatos en la tabla tutorias.documentos.
 */
export async function subirDocumentoAlumno(formData: FormData): Promise<
  { success: true } | { error: string }
> {
  try {
    const supabase = await createClient();

    const alumnoResult = await getAlumnoPerfil();
    if ("error" in alumnoResult) return { error: alumnoResult.error };

    const file = formData.get("archivo") as File | null;
    const tipoDocumento = formData.get("tipo_documento") as string | null;
    const nombreDescriptivo = formData.get("nombre_archivo") as string | null;

    if (!file || !tipoDocumento) {
      return { error: "Archivo y tipo de documento son requeridos." };
    }

    const alumnoId = alumnoResult.data.id;
    const ext = file.name.split(".").pop() ?? "pdf";
    const storagePath = `alumnos/${alumnoId}/${Date.now()}_${tipoDocumento}.${ext}`;

    // 1. Subir archivo al bucket
    const { error: uploadError } = await supabase.storage
      .from("tutorias-docs")
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("subirDocumentoAlumno upload error:", uploadError);
      return { error: "Error al subir el archivo: " + uploadError.message };
    }

    // 2. Registrar metadatos en la tabla documentos
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: dbError } = await supabase
      .schema("tutorias")
      .from("documentos")
      .insert({
        alumno_id: alumnoId,
        tipo_documento: tipoDocumento,
        nombre_archivo: nombreDescriptivo || file.name,
        storage_bucket: "tutorias-docs",
        storage_path: storagePath,
        nivel_privacidad: "visible",
        subido_por: user!.id,
        mime_type: file.type,
        tamano_bytes: file.size,
      });

    if (dbError) {
      console.error("subirDocumentoAlumno db error:", dbError);
      // Intentar eliminar el archivo ya subido para no dejar huérfanos
      await supabase.storage.from("tutorias-docs").remove([storagePath]);
      return { error: "Error al registrar el documento: " + dbError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("subirDocumentoAlumno unexpected:", error);
    return { error: error.message };
  }
}

/**
 * Confirma la asistencia del alumno a una sesión (firma digital).
 */
export async function confirmarAsistenciaAlumno(
  sesionId: string
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await createClient();

    const alumnoResult = await getAlumnoPerfil();
    if ("error" in alumnoResult) return { error: alumnoResult.error };

    const { error } = await supabase
      .schema("tutorias")
      .from("sesiones_tutoria")
      .update({
        confirmado_alumno: true,
        fecha_confirmacion_alumno: new Date().toISOString(),
      })
      .eq("id", sesionId)
      .eq("alumno_id", alumnoResult.data.id); // Extra seguridad + RLS

    if (error) {
      console.error("confirmarAsistenciaAlumno error:", error);
      return { error: "No se pudo confirmar la asistencia." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("confirmarAsistenciaAlumno unexpected:", error);
    return { error: error.message };
  }
}
