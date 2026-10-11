import { FormEvent, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useProviders } from "../hooks/useProviders";
import { useLocalProducts } from "../hooks/useLocalProducts";
import { useSearch } from "../hooks/useSearch";
import { KpiCard } from "../components/ui/KpiCard";
import { DataTable, Column } from "../components/ui/DataTable";
import { EmptyState } from "../components/ui/Feedback";
import { Pagination } from "../components/ui/Pagination";
import { EquivalenceFormModal, EquivalenceFormValues } from "../components/EquivalenceFormModal";
import { equivalenceService } from "../services/equivalenceService";
import { localProductService } from "../services/localProductService";
import { SearchResult } from "../types";
import { ApiError } from "../services/api";

export function BuscadorView() {
  const { rows: providers } = useProviders({ limit: 200 });
  const { rows: products, refresh: refreshProducts } = useLocalProducts({ limit: 200 });
  const { results, total, page, pageCount, status, error, search, goToPage, lastQuery, refresh, reset } = useSearch();

  const [query, setQuery] = useState("");
  const [providerId, setProviderId] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SearchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const pendingSearch = useRef<number | null>(null);

  useEffect(() => {
    if (pendingSearch.current) {
      window.clearTimeout(pendingSearch.current);
      pendingSearch.current = null;
    }
    const q = query.trim();
    if (!q) {
      reset();
      return;
    }
    pendingSearch.current = window.setTimeout(() => {
      pendingSearch.current = null;
      search(q, providerId ? Number(providerId) : undefined, 1);
    }, 450);
    return () => {
      if (pendingSearch.current) {
        window.clearTimeout(pendingSearch.current);
        pendingSearch.current = null;
      }
    };
  }, [query, providerId, search, reset]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pendingSearch.current) {
      window.clearTimeout(pendingSearch.current);
      pendingSearch.current = null;
    }
    search(query, providerId ? Number(providerId) : undefined, 1);
  }

  async function handleDelete(result: SearchResult) {
    if (!window.confirm(`¿Eliminar la equivalencia "${result.providerName}"? Esta acción no se puede deshacer.`)) return;
    try {
      await equivalenceService.remove(result.id);
      await refresh();
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
          await localProductService.update(editing.localProductId, {
            code: values.localCode.trim(),
            name: values.localName.trim(),
          });
          localProductId = editing.localProductId;
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

  const columns: Column<SearchResult>[] = [
    {
      key: "provider",
      label: "Proveedor",
      render: (r) => <p className="font-semibold text-foreground whitespace-nowrap">{r.provider.name}</p>,
    },
    {
      key: "providerCode",
      label: "Código",
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.providerCode}</span>,
    },
    {
      key: "providerName",
      label: "Producto proveedor",
      render: (r) => <span className="text-sm text-foreground">{r.providerName}</span>,
    },
    {
      key: "localCode",
      label: "Código",
      render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.localCode}</span>,
    },
    {
      key: "localName",
      label: "Producto",
      render: (r) => <span className="text-sm text-foreground">{r.localName}</span>,
    },
    {
      key: "actions",
      label: "Acciones",
      render: (r) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditing(r);
              setModalOpen(true);
            }}
            className="px-2 py-1 rounded text-xs font-semibold text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
          >
            Editar
          </button>
          <button
            onClick={() => handleDelete(r)}
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
        <KpiCard label="Proveedores" value={String(providers.length)} sub="en directorio" trend="Registrados" dir="flat" />
        <KpiCard label="Productos" value={String(products.length)} sub="en catálogo" trend="Total" dir="flat" />
        <KpiCard label="Equivalencias" value={String(total)} sub={lastQuery ? `resultados de «${lastQuery.query}»` : "sin búsqueda aún"} trend="Resultados" dir="flat" />
        <KpiCard label="Conversión" value="PM" sub="proveedor → producto" trend="Listo" dir="flat" />
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-4 shadow-card">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Buscar producto</label>
        <div className="flex gap-2">
          <select
            className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-input-background border border-border rounded-lg outline-none transition focus:ring-2 focus:ring-ring cursor-pointer shrink-0"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
          >
            <option value="">Todos los proveedores</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-input-background border border-border rounded-lg outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              placeholder="Código o nombre de producto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || status === "loading"}
            className="flex items-center gap-1.5 pl-4 pr-5 py-2.5 text-sm bg-accent text-accent-foreground rounded-full hover:brightness-95 transition-all font-bold shadow-card disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Search size={13} />
            {status === "loading" ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </form>

      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {status !== "idle" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-card">
          {status === "success" && results.length === 0 && lastQuery ? (
            <EmptyState
              title={`Sin resultados para «${lastQuery.query}»`}
              message="Prueba con otro código o nombre, o registra una equivalencia nueva."
            />
          ) : (
            <DataTable
              columns={columns}
              rows={results}
              rowKey={(r) => r.id}
              emptyMessage="Escribe un término para buscar."
            />
          )}

          {status === "success" && results.length > 0 && (
            <>
              <Pagination page={page} pageCount={pageCount} total={total} onChange={goToPage} />
              <div className="flex items-center justify-end px-4 py-3 border-t border-border bg-muted/10">
                <button
                  onClick={() => {
                    setEditing(null);
                    setModalOpen(true);
                  }}
                  className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                >
                  + Nueva equivalencia
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {status === "success" && results.length > 0 && (
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-dashed border-border text-[13px] font-medium text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        >
          + Agregar otra equivalencia
        </button>
      )}

      <EquivalenceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitForm}
        providers={providers}
        localProducts={products}
        initial={editing}
        prefillQuery={lastQuery?.query}
        submitting={submitting}
        errorMessage={formError}
      />
    </div>
  );
}