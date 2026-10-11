import { useState } from "react";
import { LoadingState } from "./components/ui/Feedback";
import { useAuth } from "./auth/AuthContext";
import { LoginView } from "./auth/LoginView";
import { AppShell, Section } from "./layout/AppShell";
import { BuscadorView } from "./views/BuscadorView";
import { EquivalenciasView } from "./views/EquivalenciasView";
import { ProveedoresView } from "./views/ProveedoresView";
import { ProductosView } from "./views/ProductosView";
import { ConfiguracionView } from "./views/ConfiguracionView";

export function App() {
  const [section, setSection] = useState<Section>("buscador");
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { user, loading, signOut } = useAuth();

  if (loading) return <LoadingState label="Verificando sesión…" />;
  if (!user) return <LoginView />;

  async function handleSignOut() {
    setSignOutError(null);
    try {
      await signOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "No se pudo cerrar sesión");
    }
  }

  return (
    <AppShell
      section={section}
      onSectionChange={setSection}
      userEmail={user.email ?? ""}
      onSignOut={() => void handleSignOut()}
    >
      {signOutError && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {signOutError}
        </p>
      )}
      {section === "buscador" && <BuscadorView />}
      {section === "equivalencias" && <EquivalenciasView />}
      {section === "proveedores" && <ProveedoresView />}
      {section === "productos" && <ProductosView />}
      {section === "configuracion" && <ConfiguracionView />}
    </AppShell>
  );
}