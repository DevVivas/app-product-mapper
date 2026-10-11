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
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border">
      <div className={`flex items-center gap-2 flex-1 min-w-0 ${searchClassName ?? "max-w-md"}`}>
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
      <div className="flex items-center gap-2">
        {count !== undefined && total !== undefined && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Mostrando <span className="font-semibold text-foreground">{count}</span> de{" "}
            <span className="font-semibold text-foreground">{total}</span>
          </span>
        )}
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-semibold text-[13px] shadow-card whitespace-nowrap"
          >
            {newLabel ?? "Nuevo"} <Plus size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
