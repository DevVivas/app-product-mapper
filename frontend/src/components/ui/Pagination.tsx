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
    <div className="flex flex-col gap-3 border-t border-border bg-muted/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <span className="text-center text-xs text-muted-foreground sm:text-left">
        <span className="font-semibold text-foreground">{total}</span> resultado{total > 1 ? "s" : ""} · Página{" "}
        <span className="font-semibold text-foreground">{page}</span> de{" "}
        <span className="font-semibold text-foreground">{pageCount}</span>
      </span>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="flex min-h-10 items-center justify-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={13} />
          Anterior
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className="flex min-h-10 items-center justify-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}