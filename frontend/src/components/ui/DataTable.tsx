import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, rows, rowKey, emptyMessage = "Sin resultados." }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="responsive-table w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-left ${col.className ?? ""}`}>
                <span className="font-semibold uppercase tracking-wider text-muted-foreground text-[10px]">
                  {col.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
              {columns.map((col) => (
                <td
                  key={col.key}
                  data-label={col.label}
                  className={`px-4 py-3 ${col.className ?? ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr data-empty-row="true">
              <td
                data-empty="true"
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}