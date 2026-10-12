import { ReactNode } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";

export function Toolbar({
  search,
  onSearch,
  placeholder,
  filter,
  onFilter,
  filterOptions,
  filtersLabelAll = "Todos",
  children,
  onNew,
  newLabel,
  count,
  total,
  searchClassName,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  filter?: string;
  onFilter?: (v: string) => void;
  filterOptions?: string[];
  filtersLabelAll?: string;
  children?: ReactNode;
  onNew?: () => void;
  newLabel?: string;
  count?: number;
  total?: number;
  searchClassName?: string;
}) {
  return (
    <div className="flex flex-col items-stretch gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-4">
      <div className={`flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center ${searchClassName ?? "sm:max-w-md"} sm:flex-1`}>
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-3 py-2 text-sm bg-input-background border border-border rounded-lg outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder={placeholder ?? "Buscar…"}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {filter !== undefined && onFilter && filterOptions && (
          <div className="relative shrink-0">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm bg-input-background border border-border rounded-lg outline-none transition focus:ring-2 focus:ring-ring cursor-pointer"
              value={filter}
              onChange={(e) => onFilter(e.target.value)}
            >
              <option value="todos">{filtersLabelAll}</option>
              {filterOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        )}
        {children}
      </div>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        {count !== undefined && total !== undefined && (
          <span className="text-xs text-muted-foreground sm:whitespace-nowrap">
            Mostrando <span className="font-semibold text-foreground">{count}</span> de{" "}
            <span className="font-semibold text-foreground">{total}</span>
          </span>
        )}
        {onNew && (
          <button
            onClick={onNew}
            className="flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-3 sm:px-4 py-2 text-center text-xs sm:text-[13px] font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 sm:whitespace-nowrap"
          >
            {newLabel ?? "Nuevo"} <Plus size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
