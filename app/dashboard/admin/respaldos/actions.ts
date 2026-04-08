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

