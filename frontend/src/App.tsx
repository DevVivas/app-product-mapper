import { useState } from "react";
import { AppShell, Section } from "./layout/AppShell";
import { BuscadorView } from "./views/BuscadorView";
import { EquivalenciasView } from "./views/EquivalenciasView";
import { ProveedoresView } from "./views/ProveedoresView";
import { ProductosView } from "./views/ProductosView";
import { ConfiguracionView } from "./views/ConfiguracionView";

export function App() {
  const [section, setSection] = useState<Section>("buscador");

  return (
    <AppShell section={section} onSectionChange={setSection}>
      {section === "buscador" && <BuscadorView />}
      {section === "equivalencias" && <EquivalenciasView />}
      {section === "proveedores" && <ProveedoresView />}
      {section === "productos" && <ProductosView />}
      {section === "configuracion" && <ConfiguracionView />}
    </AppShell>
  );
}