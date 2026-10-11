import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Truck,
  ArrowLeftRight,
  Boxes,
  Settings,
  Search,
  Bell,
} from "lucide-react";

export type Section =
  | "buscador"
  | "equivalencias"
  | "proveedores"
  | "productos"
  | "configuracion";

interface AppShellProps {
  section: Section;
  onSectionChange: (section: Section) => void;
  children: ReactNode;
}

const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "buscador", label: "Buscador", icon: Search },
  { id: "equivalencias", label: "Equivalencias", icon: ArrowLeftRight },
  { id: "proveedores", label: "Proveedores", icon: Truck },
  { id: "productos", label: "Productos", icon: Boxes },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

const meta: Record<Section, { title: string; sub: string }> = {
  buscador: {
    title: "Buscador de productos",
    sub: "Conversión y búsqueda de productos entre proveedores y el sistema local",
  },
  equivalencias: {
    title: "Equivalencias",
    sub: "Catálogo de equivalencias proveedor ↔ producto",
  },
  proveedores: {
    title: "Proveedores",
    sub: "Gestión del directorio de proveedores",
  },
  productos: {
    title: "Productos",
    sub: "Catálogo de productos",
  },
  configuracion: {
    title: "Configuración",
    sub: "Ajustes del sistema",
  },
};

export function AppShell({ section, onSectionChange, children }: AppShellProps) {
  const { title, sub } = meta[section];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <aside className="w-60 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border shrink-0">
          <span className="w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
            <Boxes size={17} />
          </span>
          <span className="font-bold text-base tracking-tight">
            ProductMapper
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = section === id;
            return (
              <button
                key={id}
                onClick={() => onSectionChange(id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon size={16} className={active ? "text-sidebar-primary" : ""} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 h-16 bg-primary text-primary-foreground border-b border-border shrink-0 shadow-card">
          <div>
            <h1 className="text-base font-bold text-primary-foreground leading-tight">
              {title}
            </h1>
            <p className="text-xs text-primary-foreground/75">{sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md bg-white/10 text-primary-foreground opacity-0 pointer-events-none" aria-hidden>
              <Search size={14} />
            </button>
            <button className="relative p-2 rounded-md text-primary-foreground hover:bg-white/10 transition-colors">
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">{children}</main>
      </div>
    </div>
  );
}