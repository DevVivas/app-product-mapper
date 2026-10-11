import { FormEvent, useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Provider } from "../types";

interface ProviderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  initial?: Provider | null;
  submitting?: boolean;
  errorMessage?: string | null;
}

const inputCls =
  "h-10 w-full rounded-lg bg-input-background border border-border px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
const labelCls = "text-xs font-semibold text-muted-foreground mb-1.5";

export function ProviderFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  submitting,
  errorMessage,
}: ProviderFormModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(initial?.name ?? "");
  }, [open, initial]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(name.trim());
  }

  const isEdit = Boolean(initial);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar proveedor" : "Nuevo proveedor"}
      subtitle="Nombre del proveedor como se usará en las equivalencias"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Nombre</label>
          <input
            required
            autoFocus
            className={inputCls}
            placeholder="Ej: Distribuidora Andina S.A."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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