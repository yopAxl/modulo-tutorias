import { cn } from "@/lib/utils";
import { gpaClass } from "@/app/_lib/mock-data";

export function GpaCell({ value }: { value: number }) {
  const cls = gpaClass(value);
  return (
    <span className={cn("inline-flex min-w-11 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold", {
      "bg-emerald-500/12 text-emerald-400": cls === "gpa-high",
      "bg-amber-500/12 text-amber-400": cls === "gpa-mid",
      "bg-red-500/12 text-red-400": cls === "gpa-low",
    })}>
      {value.toFixed(1)}
    </span>
  );
}
