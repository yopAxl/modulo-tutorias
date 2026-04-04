import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div className={cn("rounded-xl border border-white/6 bg-[#151c24]", className)}>
      {children}
    </div>
  );
}

export function SectionCardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
