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
    <div className="bg-card rounded-xl border border-border p-4 shadow-card">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-foreground tracking-tight">{value}</p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${color}`}>
          <Icon size={11} />
          {trend}
        </span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}