import { Loader2, SearchX } from "lucide-react";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 size={20} className="animate-spin text-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, message }: {
  icon?: typeof SearchX;
  title: string;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
        <Icon size={20} className="text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {message && <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">{message}</p>}
      </div>
    </div>
  );
}