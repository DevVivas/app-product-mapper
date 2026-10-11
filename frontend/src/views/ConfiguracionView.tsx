import { Boxes } from "lucide-react";

export function ConfiguracionView() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
        <Boxes size={22} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold">Módulo no implementado</p>
      <p className="text-xs text-center max-w-xs">
        La configuración del sistema estará disponible en una próxima versión.
      </p>
    </div>
  );
}