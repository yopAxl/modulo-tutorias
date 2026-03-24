import { cn } from "@/lib/utils";

const STRIPE: Record<string, string> = {
  indigo: "bg-indigo-500",
  green:  "bg-emerald-500",
  amber:  "bg-amber-500",
  red:    "bg-red-500",
  pink:   "bg-pink-500",
};

export type AccentColor = keyof typeof STRIPE;

interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  subColor?: string;
  icon: React.ElementType;
  accent: AccentColor;
}

export function StatCard({
  label, value, sub, subColor = "text-white/40", icon: Icon, accent,
}: StatCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#161b27]">
      {/* colored top stripe */}
      <div className={cn("h-0.5 w-full", STRIPE[accent])} />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">{label}</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <Icon className="h-4 w-4 text-white/40" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
          <p className={cn("mt-1 text-xs", subColor)}>{sub}</p>
        </div>
      </div>
    </div>
  );
}
