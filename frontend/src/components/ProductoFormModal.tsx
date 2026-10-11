import { FormEvent, useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { LocalProduct } from "../types";

interface ProductoFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { code: string; name: string }) => Promise<void>;
  initial?: LocalProduct | null;
  submitting?: boolean;
  errorMessage?: string | null;
}

const inputCls =
  "h-10 w-full rounded-lg bg-input-background border border-border px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground";
const labelCls = "text-xs font-semibold text-muted-foreground mb-1.5";

export function ProductoFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  submitting,
  errorMessage,
}: ProductoFormModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) {
      setCode(initial?.code ?? "");
      setName(initial?.name ?? "");
    }
  }, [open, initial]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({ code: code.trim(), name: name.trim() });
  }

  const isEdit = Boolean(initial);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar producto" : "Nuevo producto"}
      subtitle="Producto del catálogo interno"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Código</label>
          <input
            required
            autoFocus
            className={`${inputCls} font-mono`}
            placeholder="Ej: 780123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Nombre</label>
          <input
            required
            className={inputCls}
            placeholder="Ej: BEBIDA COCA COLA 1.5 LT RETORNABLE"
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