import { useEffect, useState } from "react";
import { useLocalProducts } from "../hooks/useLocalProducts";
import { DataTable, Column } from "../components/ui/DataTable";
import { Toolbar } from "../components/ui/Toolbar";
import { LoadingState } from "../components/ui/Feedback";
import { Pagination } from "../components/ui/Pagination";
import { ProductoFormModal } from "../components/ProductoFormModal";
import { LocalProduct } from "../types";
import { ApiError } from "../services/api";
import { KpiCard } from "../components/ui/KpiCard";

export function ProductosView() {
  const [search, setSearch] = useState("");
  const { rows, total, page, pageSize, loading, setPage, create, update, remove } = useLocalProducts({ q: search });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LocalProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (page > 1 && page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  async function handleSubmit(data: { code: string; name: string }) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await update(editing.id, data);
      } else {
        await create(data);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el producto");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(p: LocalProduct) {
    if (!window.confirm(`¿Eliminar el producto "${p.name}" y sus equivalencias? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(p.id);
    } catch (err) {
      console.error(err);
    }
  }

  const columns: Column<LocalProduct>[] = [
    {
      key: "code",
      label: "Código",
      render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.code}</span>,
    },
    {
      key: "name",
      label: "Producto",
      render: (p) => <p className="font-semibold text-foreground">{p.name}</p>,
    },
    {
      key: "createdAt",
      label: "Creado",
      render: (p) => (
        <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {new Date(p.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (p) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditing(p);
              setModalOpen(true);
            }}
            className="px-2 py-1 rounded text-xs font-semibold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(p)}
            className="px-2 py-1 rounded text-xs font-semibold text-destructive hover:bg-red-50 transition-colors whitespace-nowrap"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Productos" value={String(total)} sub="en catálogo" trend="Total" dir="flat" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
        <Toolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por código o nombre…"
          count={rows.length}
          total={total}
          onNew={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          newLabel="Nuevo producto"
        />

        {loading ? (
          <LoadingState label="Cargando productos…" />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(p) => p.id} emptyMessage="No hay productos registrados." />
        )}

        {!loading && rows.length > 0 && <Pagination page={page} pageCount={pageCount} total={total} onChange={setPage} />}
      </div>

      <ProductoFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        submitting={submitting}
        errorMessage={formError}
      />
    </div>
  );
}