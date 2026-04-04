import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_MAP: Record<StatusVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  danger: "bg-red-500/10 text-red-400 border-red-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  neutral: "bg-white/6 text-white/50 border-white/10",
};

/** Auto-map common Spanish status words to variants */
const AUTO_VARIANT: Record<string, StatusVariant> = {
  activo: "success", completado: "success", concluida: "success", realizada: "success", aprobado: "success",
  pendiente: "warning", en_proceso: "warning", en_atencion: "warning", programada: "warning", medio: "warning",
  abierta: "info",
  cancelada: "danger", fallido: "danger", cerrada: "neutral", archivada: "neutral", no_presentado: "danger",
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, variant, label, className }: StatusBadgeProps) {
  const v = variant ?? AUTO_VARIANT[status.toLowerCase()] ?? "neutral";
  const display = label ?? status.replace(/_/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", VARIANT_MAP[v], className)}>
      {display}
    </span>
  );
}
