import { FormEvent, useState } from "react";
import { Boxes } from "lucide-react";
import { useAuth } from "./AuthContext";
import backroomImage from "../../../backroom-image.webp";

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
    <main
      className="relative flex min-h-[100dvh] items-center justify-center overflow-y-auto bg-slate-950 bg-cover bg-center px-4 py-8 sm:py-10"
      style={{ backgroundImage: `url("${backroomImage}")` }}
    >
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" aria-hidden="true" />
      <section className="relative z-10 my-auto w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
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
