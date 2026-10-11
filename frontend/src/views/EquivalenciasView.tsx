import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useEquivalences } from "../hooks/useEquivalences";
import { useProviders } from "../hooks/useProviders";
import { useLocalProducts } from "../hooks/useLocalProducts";
import { DataTable, Column } from "../components/ui/DataTable";
import { Toolbar } from "../components/ui/Toolbar";
import { LoadingState } from "../components/ui/Feedback";
import { Pagination } from "../components/ui/Pagination";
import { EquivalenceFormModal, EquivalenceFormValues } from "../components/EquivalenceFormModal";
import { equivalenceService } from "../services/equivalenceService";
import { localProductService } from "../services/localProductService";
import { Equivalence } from "../types";
import { ApiError } from "../services/api";
import { KpiCard } from "../components/ui/KpiCard";

export function EquivalenciasView() {
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("todos");

  const providerId = providerFilter === "todos" ? undefined : Number(providerFilter);
  const { rows: equivalences, total, page, pageSize, loading, setPage, refresh, remove } = useEquivalences({
    q: search,
    providerId,
  });
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const { rows: providers } = useProviders({ limit: 200 });
  const { rows: products, refresh: refreshProducts } = useLocalProducts({ limit: 200 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equivalence | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (page > 1 && page > pageCount) setPage(pageCount);
  }, [page, pageCount, setPage]);

  async function handleDelete(eq: Equivalence) {
    if (!window.confirm(`¿Eliminar la equivalencia "${eq.providerName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await remove(eq.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmitForm(values: EquivalenceFormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      let localProductId: number;
      if (values.createNewLocalProduct) {
        if (editing) {
          await localProductService.update(editing.localProduct.id, {
            code: values.localCode.trim(),
            name: values.localName.trim(),
          });
          localProductId = editing.localProduct.id;
        } else {
          const newProduct = await localProductService.create({
            code: values.localCode.trim(),
            name: values.localName.trim(),
          });
          localProductId = newProduct.id;
        }
      } else {
        localProductId = Number(values.localProductId);
      }

      const payload = {
        providerId: Number(values.providerId),
        providerCode: values.providerCode.trim(),
        providerName: values.providerName.trim(),
        localProductId,
      };

      if (editing) {
        await equivalenceService.update(editing.id, payload);
      } else {
        await equivalenceService.create(payload);
      }

      setModalOpen(false);
      await refresh();
      await refreshProducts();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar la equivalencia");
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<Equivalence>[] = [
    {
      key: "provider",
      label: "Proveedor",
      render: (e) => <p className="font-semibold text-foreground whitespace-nowrap">{e.provider.name}</p>,
    },
    {
      key: "providerCode",
      label: "Código prov.",
      render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.providerCode}</span>,
    },
    {
      key: "providerName",
      label: "Producto proveedor",
      render: (e) => <span className="text-sm text-foreground">{e.providerName}</span>,
    },
    {
      key: "localCode",
      label: "Código",
      render: (e) => <span className="font-mono text-xs text-muted-foreground">{e.localProduct.code}</span>,
    },
    {
      key: "localName",
      label: "Producto",
      render: (e) => <span className="text-sm text-foreground">{e.localProduct.name}</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      render: (e) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditing(e);
              setModalOpen(true);
            }}
            className="px-2 py-1 rounded text-xs font-semibold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(e)}
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
        <KpiCard label="Equivalencias" value={String(total)} sub="en catálogo" trend="Total" dir="flat" />
        <KpiCard label="Proveedores" value={String(providers.length)} sub="en directorio" trend="Registrados" dir="flat" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
        <Toolbar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Buscar por código, proveedor o producto…"
          count={equivalences.length}
          total={total}
          onNew={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          newLabel="Nueva equivalencia"
          searchClassName="max-w-[640px]"
        >
          <div className="relative shrink-0">
            <select
              className="appearance-none pl-3 pr-8 py-2 w-44 shrink-0 text-sm bg-input-background border border-border rounded-lg outline-none transition focus:ring-2 focus:ring-ring cursor-pointer"
              value={providerFilter}
              onChange={(e) => {
                setProviderFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="todos">Todos los proveedores</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </Toolbar>

        {loading ? (
          <LoadingState label="Cargando equivalencias…" />
        ) : (
          <DataTable
            columns={columns}
            rows={equivalences}
            rowKey={(e) => e.id}
            emptyMessage="No hay equivalencias registradas."
          />
        )}

        {!loading && equivalences.length > 0 && (
          <Pagination page={page} pageCount={pageCount} total={total} onChange={setPage} />
        )}
      </div>

      <EquivalenceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitForm}
        providers={providers}
        localProducts={products}
        initial={
          editing
            ? {
                id: editing.id,
                provider: { id: editing.provider.id, name: editing.provider.name },
                providerCode: editing.providerCode,
                providerName: editing.providerName,
                localProductId: editing.localProduct.id,
                localCode: editing.localProduct.code,
                localName: editing.localProduct.name,
              }
            : null
        }
        submitting={submitting}
        errorMessage={formError}
      />
    </div>
  );
}