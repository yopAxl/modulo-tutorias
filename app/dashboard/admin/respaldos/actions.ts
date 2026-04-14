"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Consulta la lista de todos los archivos de respaldo almacenados
 * en el bucket privado "backups".
 */
export async function listBackups() {
  try {
    const supabaseAdmin = createAdminClient();

    // Obtenemos los metadatos de los archivos del bucket sin exponerlos
    const { data, error } = await supabaseAdmin.storage.from("backups").list();

    if (error) {
      console.error("Storage list Error:", error);
      return { error: "Error al conectarse con el sistema de respaldos." };
    }

    // Filtramos para asegurar que solo leemos archivos SQL y los ordenamos por fecha descendente
    const files = data
      .filter((file) => file.name.endsWith('.sql'))
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return { data: files };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { error: `Ocurrió un error inesperado al listar: ${error?.message}` };
  }
}

/**
 * Solicita una URL firmada (temporal segura de 60 segundos)
 * para permitir la descarga del lado del frontend.
 */
export async function getBackupDownloadUrl(filename: string) {
  try {
    const supabaseAdmin = createAdminClient();

    // signedUrl es ultra seguro, muere rápido y es un link de acceso único
    const { data, error } = await supabaseAdmin.storage.from("backups").createSignedUrl(filename, 60);

    if (error || !data) {
      console.error("Storage download Error:", error);
      return { error: "No se pudo generar el enlace autorizado de descarga." };
    }

    return { url: data.signedUrl };
  } catch (error: any) {
    console.error("Action Error:", error);
    return { error: `Ocurrió un error inesperado al solicitar descarga: ${error?.message}` };
  }
}

/**
 * Lanza manualmente la Github Action para generar un respaldo on-demand.
 * Usa GITHUB_ACCESS_TOKEN y GITHUB_REPO desde variables de entorno.
 */
export async function triggerManualBackup() {
  try {
    const token = process.env.GITHUB_ACCESS_TOKEN;
    const repo = process.env.GITHUB_REPO;

    if (!token || !repo) {
      return { error: "GitHub Token o Repo no configurado en las variables de entorno locales." };
    }

    // La rama en GitHub debe ser "main" (donde subimos el archivo yml)
    const ref = "main";

    const res = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/backup.yml/dispatches`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "Tutorias-Admin-Dashboard"
      },
      body: JSON.stringify({ ref })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Github API Error:", text);
      if (res.status === 404) {
        return { error: "GitHub no encontró el flujo de trabajo (asegúrate de que backup.yml esté en main)." };
      }
      return { error: `GitHub rechazó la petición: ${res.statusText}` };
    }

    // Registrar en el Log de Auditoría
    const supabaseUser = await createClient();
    await supabaseUser.rpc('registrar_audit', {
      p_evento: 'TRIGGER_BACKUP',
      p_tabla: 'storage.objects',
      p_metadata: {
        repo,
        workflow: 'backup.yml',
        solicitado_manualmente: true
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Trigger Backup Action Error:", error);
    return { error: `Error conectándose con Github: ${error?.message}` };
  }
}

/**
 * Lee la configuración desde la API de Cron-job.org
 */
export async function getBackupSchedule() {
  try {
    const apiKey = process.env.CRON_JOB_API_KEY;
    if (!apiKey) return { error: "Cron-job.org API Key no configurada." };

    const res = await fetch("https://api.cron-job.org/jobs", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) return { error: "Error al consultar Cron-job.org" };

    const data = await res.json();
    // Buscamos el trabajo por nombre
    const job = data.jobs.find((j: any) => j.title === "Database Backup");

    if (!job) {
      return { error: "No se encontró el trabajo 'Database Backup' en Cron-job.org. Por favor, créalo manualmente." };
    }

    // Cron-job usa arrays para horas y minutos [hh], [mm]
    const hour = job.schedule.hours[0] ?? 0;
    
    // El cron-job ya debería estar en hora local si se configuró así en su panel,
    // pero para ser consistentes con tu UI de Mazatlán, asumimos que se guarda en UTC en la API.
    const OFFSET_UTN = -7;
    let localHour = ((hour + OFFSET_UTN) % 24 + 24) % 24;
    const hora = `${String(localHour).padStart(2, "0")}:${String(job.schedule.minutes[0] || 0).padStart(2, "0")}`;

    let frecuencia = "diario";
    if (job.schedule.wdays.length < 7 && job.schedule.wdays[0] !== -1) frecuencia = "semanal";

    return { hora, frecuencia, jobId: job.jobId };
  } catch (error: any) {
    return { error: `Error leyendo cron: ${error.message}` };
  }
}

/**
 * Actualiza la configuración en Cron-job.org
 */
export async function saveBackupSchedule(hora: string, frecuencia: string) {
  try {
    const apiKey = process.env.CRON_JOB_API_KEY;
    const apiSecret = process.env.BACKUP_API_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;

    if (!apiKey || !apiSecret) return { error: "Variables de entorno (API Key o Secret) faltantes." };

    const current = await getBackupSchedule();
    if (current.error || !current.jobId) return { error: current.error };

    const [hh, mm] = hora.split(":").map(Number);
    
    // Convertir Mazatlán -> UTC para guardar en Cron-job.org (estándar recomendado)
    const OFFSET_UTN = -7;
    const utcHour = ((hh - OFFSET_UTN) % 24 + 24) % 24;

    // Limpiar la URL de protocolos y barras al final para evitar errores
    const cleanUrl = appUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const protocol = cleanUrl?.includes("localhost") ? "http" : "https";
    const webhookUrl = `${protocol}://${cleanUrl}/api/backup/trigger?secret=${apiSecret}`;

    const schedule: any = {
      timezone: "UTC",
      hours: [utcHour],
      minutes: [mm],
      mdays: [-1],
      months: [-1],
      wdays: frecuencia === "diario" ? [-1] : [1] // 1 = Lunes para semanal
    };

    const res = await fetch(`https://api.cron-job.org/jobs/${current.jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        job: {
          title: "Database Backup",
          url: webhookUrl,
          enabled: true,
          schedule: schedule
        }
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      return { error: `Cron-job.org error: ${errData.message || res.statusText}` };
    }

    return { success: true, cron: `${mm} ${utcHour} * * *` };
  } catch (error: any) {
    return { error: `Error guardando cron: ${error.message}` };
  }
}
