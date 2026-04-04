import { cn } from "@/lib/utils";
import type { RiesgoNivel } from "@/app/_lib/mock-data";

const RISK_MAP = {
  Alto: "bg-red-500/10 text-red-400 border-red-500/20",
  Medio: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Bajo: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
} as const;

export function RiskBadge({ riesgo }: { riesgo: RiesgoNivel }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", RISK_MAP[riesgo])}>
      {riesgo}
    </span>
  );
}
