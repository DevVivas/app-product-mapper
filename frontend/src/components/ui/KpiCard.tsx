import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  trend?: string;
  dir?: "up" | "down" | "flat";
}

export function KpiCard({ label, value, sub, trend = "—", dir = "flat" }: KpiCardProps) {
  const color = dir === "up" ? "text-emerald-600" : dir === "down" ? "text-red-500" : "text-slate-400";
  const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;

  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-3 shadow-card sm:p-4">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1.5 truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${color}`}>
          <Icon size={11} />
          {trend}
        </span>
        <span className="min-w-0 truncate text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}