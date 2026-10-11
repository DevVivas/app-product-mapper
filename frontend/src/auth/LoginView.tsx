import { FormEvent, useState } from "react";
import { Boxes } from "lucide-react";
import { useAuth } from "./AuthContext";

const inputClass =
  "h-11 w-full rounded-lg bg-input-background border border-border px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring";

export function LoginView() {
  const { configured, error: sessionError, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Boxes size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold">ProductMapper</h1>
            <p className="text-sm text-muted-foreground">Inicia sesión para continuar</p>
          </div>
        </div>

        {!configured ? (
          <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            Falta configurar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en el entorno
            de compilación del frontend.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              Correo electrónico
              <input
                className={inputClass}
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block space-y-1.5 text-sm font-medium">
              Contraseña
              <input
                className={inputClass}
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {(formError || sessionError) && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError ?? sessionError}
              </p>
            )}

            <button
              className="h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Ingresando…" : "Iniciar sesión"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
