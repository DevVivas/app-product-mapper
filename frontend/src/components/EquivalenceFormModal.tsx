import { FormEvent, useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { LocalProduct, Provider } from "../types";

export interface EquivalenceFormValues {
  providerId: number | "";
  providerCode: string;
  providerName: string;
  createNewLocalProduct: boolean;
  localProductId: number | "";
  localCode: string;
  localName: string;
}

export interface EquivalenceInitial {
  id: number;
  provider: { id: number; name: string };
  providerCode: string;
  providerName: string;
  localProductId: number;
  localCode: string;
  localName: string;
}

interface EquivalenceFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EquivalenceFormValues) => Promise<void>;
  providers: Provider[];
  localProducts: LocalProduct[];
  initial?: EquivalenceInitial | null;
  prefillQuery?: string;
  submitting?: boolean;
  errorMessage?: string | null;
}

function emptyValues(prefillQuery = ""): EquivalenceFormValues {
  const looksNumeric = /^\d+$/.test(prefillQuery.trim());
  return {
    providerId: "",
    providerCode: looksNumeric ? prefillQuery.trim() : "",
    providerName: !looksNumeric ? prefillQuery.trim() : "",
    createNewLocalProduct: false,
    localProductId: "",
    localCode: "",
    localName: "",
  };
}

const inputCls =
  "h-10 w-full rounded-lg bg-input-background border border-border px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
const labelCls = "text-xs font-semibold text-muted-foreground mb-1.5";

export function EquivalenceFormModal({
  open,
  onClose,
  onSubmit,
  providers,
  localProducts,
  initial,
  prefillQuery,
  submitting,
  errorMessage,
}: EquivalenceFormModalProps) {
  const [values, setValues] = useState<EquivalenceFormValues>(emptyValues(prefillQuery));

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        providerId: initial.provider.id,
        providerCode: initial.providerCode,
        providerName: initial.providerName,
        createNewLocalProduct: false,
        localProductId: initial.localProductId,
        localCode: initial.localCode,
        localName: initial.localName,
      });
    } else {
      setValues(emptyValues(prefillQuery));
    }
  }, [open, initial, prefillQuery]);

  if (!open) return null;

  function handleChange<K extends keyof EquivalenceFormValues>(key: K, value: EquivalenceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function chooseMode(createNew: boolean) {
    if (createNew && !values.createNewLocalProduct) {
      const selected = values.localProductId
        ? localProducts.find((p) => p.id === Number(values.localProductId))
        : null;
      if (selected) {
        handleChange("localCode", selected.code);
        handleChange("localName", selected.name);
      }
    }
    handleChange("createNewLocalProduct", createNew);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(values);
  }

  const isEdit = Boolean(initial);
  const modeExisting = !values.createNewLocalProduct;
  const modeCls = (active: boolean) =>
    active
      ? "flex-1 h-9 rounded-full text-[13px] font-semibold bg-primary text-primary-foreground transition-colors shadow-card"
      : "flex-1 h-9 rounded-full text-[13px] font-semibold text-muted-foreground bg-input-background border border-border hover:text-foreground transition-colors";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar equivalencia" : "Nueva equivalencia"}
      subtitle={
        isEdit
          ? "Modifica la conversión entre producto del proveedor y producto"
          : "Registra la conversión entre producto del proveedor y producto"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Proveedor</label>
          <select
            required
            className={`${inputCls} cursor-pointer`}
            value={values.providerId}
            onChange={(e) => handleChange("providerId", e.target.value ? Number(e.target.value) : "")}
          >
            <option value="" disabled>
              Selecciona un proveedor
            </option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Código del producto</label>
            <input
              required
              className={`${inputCls} font-mono`}
              value={values.providerCode}
              onChange={(e) => handleChange("providerCode", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Nombre del producto</label>
            <input
              required
              className={inputCls}
              value={values.providerName}
              onChange={(e) => handleChange("providerName", e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Producto</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => chooseMode(false)} className={modeCls(modeExisting)}>
              Usar producto existente
            </button>
            <button type="button" onClick={() => chooseMode(true)} className={modeCls(!modeExisting)}>
              Crear producto nuevo
            </button>
          </div>

          {modeExisting ? (
            <div className="flex flex-col gap-1 rounded-md bg-secondary/60 p-3">
              {localProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-1">
                  No hay productos creados todavía. Usa la opción "Crear producto nuevo".
                </p>
              ) : (
                <select
                  required
                  className={`${inputCls} bg-card cursor-pointer`}
                  value={values.localProductId}
                  onChange={(e) =>
                    handleChange("localProductId", e.target.value ? Number(e.target.value) : "")
                  }
                >
                  <option value="" disabled>
                    Selecciona un producto…
                  </option>
                  {localProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 rounded-md bg-secondary/60 p-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Código</label>
                <input
                  required
                  className={`${inputCls} bg-card font-mono`}
                  value={values.localCode}
                  onChange={(e) => handleChange("localCode", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Nombre</label>
                <input
                  required
                  className={`${inputCls} bg-card`}
                  value={values.localName}
                  onChange={(e) => handleChange("localName", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-9 px-5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}