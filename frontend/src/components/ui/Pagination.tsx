import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, total, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
      <span className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{total}</span> resultado{total > 1 ? "s" : ""} · Página{" "}
        <span className="font-semibold text-foreground">{page}</span> de{" "}
        <span className="font-semibold text-foreground">{pageCount}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-muted-foreground rounded-full border border-border hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={13} />
          Anterior
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary-foreground rounded-full bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Siguiente
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}