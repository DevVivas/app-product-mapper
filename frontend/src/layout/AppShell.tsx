import type { ReactNode } from "react";
import {
  Truck,
  ArrowLeftRight,
  Boxes,
  Settings,
  Search,
  LogOut,
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
  userEmail: string;
  onSignOut: () => void;
  children: ReactNode;
}

const navItems: { id: Section; label: string; mobileLabel: string; icon: typeof Search }[] = [
  { id: "buscador", label: "Buscador", mobileLabel: "Buscar", icon: Search },
  { id: "equivalencias", label: "Equivalencias", mobileLabel: "Equiv.", icon: ArrowLeftRight },
  { id: "proveedores", label: "Proveedores", mobileLabel: "Proveed.", icon: Truck },
  { id: "productos", label: "Productos", mobileLabel: "Productos", icon: Boxes },
  { id: "configuracion", label: "Configuración", mobileLabel: "Ajustes", icon: Settings },
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

export function AppShell({ section, onSectionChange, userEmail, onSignOut, children }: AppShellProps) {
  const { title, sub } = meta[section];

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden font-sans">
      <aside className="hidden lg:flex w-60 shrink-0 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
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
                aria-current={active ? "page" : undefined}
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
        <header className="flex items-center justify-between gap-3 px-4 sm:px-6 min-h-14 sm:h-16 bg-primary text-primary-foreground border-b border-border shrink-0 shadow-card">
          <div className="min-w-0">
            <h1 className="truncate text-sm sm:text-base font-bold text-primary-foreground leading-tight">
              {title}
            </h1>
            <p className="hidden sm:block truncate text-xs text-primary-foreground/75">{sub}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <span className="hidden max-w-56 truncate text-xs text-primary-foreground/80 lg:block">
              {userEmail}
            </span>
            <button
              onClick={onSignOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex items-center gap-2 rounded-md px-2 sm:px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-white/10"
            >
              <LogOut size={15} />
              <span className="hidden min-[400px]:inline">Salir</span>
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-6 sm:py-5 lg:pb-5">
          {children}
        </main>
      </div>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-sidebar/95 px-1 pt-1 pb-[env(safe-area-inset-bottom)] shadow-card backdrop-blur lg:hidden"
      >
        {navItems.map(({ id, mobileLabel, icon: Icon }) => {
          const active = section === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSectionChange(id)}
              aria-label={meta[id].title}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-0.5 py-2 text-[9px] font-semibold leading-tight transition-colors ${
                active
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/65 hover:text-sidebar-foreground"
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}