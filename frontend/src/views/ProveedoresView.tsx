import { useEffect, useState } from "react";
import { useProviders } from "../hooks/useProviders";
import { DataTable, Column } from "../components/ui/DataTable";
import { Toolbar } from "../components/ui/Toolbar";
import { LoadingState } from "../components/ui/Feedback";
import { Pagination } from "../components/ui/Pagination";
import { ProviderFormModal } from "../components/ProviderFormModal";
import { Provider } from "../types";
import { ApiError } from "../services/api";
import { KpiCard } from "../components/ui/KpiCard";

export function ProveedoresView() {
  const [search, setSearch] = useState("");
  const { rows, total, page, pageSize, loading, setPage, create, update, remove } = useProviders({ q: search });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (page > 1 && page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  async function handleSubmit(name: string) {
    setSubmitting(true);
    setFormError(null);
    try {
      if (editing) {
        await update(editing.id, { name });
      } else {
        await create(name);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el proveedor");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(p: Provider) {
    if (!window.confirm(`¿Eliminar el proveedor "${p.name}" y sus equivalencias? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(p.id);
    } catch (err) {
      console.error(err);
    }
  }

  const columns: Column<Provider>[] = [
    {
      key: "id",
      label: "ID",
      render: (p) => <span className="font-mono text-xs text-muted-foreground">PRV-{String(p.id).padStart(3, "0")}</span>,
    },
    {
      key: "name",
      label: "Proveedor",
      render: (p) => <p className="font-semibold text-foreground whitespace-nowrap">{p.name}</p>,
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
        <KpiCard label="Total proveedores" value={String(total)} sub="en directorio" trend="Registrados" dir="flat" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
        <Toolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por nombre…"
          count={rows.length}
          total={total}
          onNew={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          newLabel="Nuevo proveedor"
        />

        {loading ? (
          <LoadingState label="Cargando proveedores…" />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(p) => p.id} emptyMessage="No hay proveedores registrados." />
        )}

        {!loading && rows.length > 0 && <Pagination page={page} pageCount={pageCount} total={total} onChange={setPage} />}
      </div>

      <ProviderFormModal
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