import { triggerManualBackup } from "@/app/dashboard/admin/respaldos/actions";
import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint para que Cron-job.org lo llame.
 * Debe incluir el ?secret=TU_SECRET para funcionar.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Validación de seguridad simple pero efectiva
  if (!secret || secret !== process.env.BACKUP_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Cron-job trigger: Iniciando respaldo automático...");
  
  const res = await triggerManualBackup();
  
  if (res.error) {
    console.error("Cron-job trigger error:", res.error);
    return NextResponse.json({ error: res.error }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true, 
    message: "Respaldo disparado exitosamente vía Cron-job.org" 
  });
}
