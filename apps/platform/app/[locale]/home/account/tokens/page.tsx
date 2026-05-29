import { TokensManager } from "./tokens-manager";

export default function TokensPage() {
  return (
    <div className="flex max-w-[720px] flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Desarrollo · API
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Tokens personales</h1>
        <p className="text-pretty text-[13px] leading-normal text-muted-foreground">
          Genera tokens para automatizar tareas o conectar con la API. Heredan tus permisos en cada organización —
          trátalos como contraseñas.
        </p>
      </header>
      <TokensManager />
      <p className="text-[12.5px] leading-relaxed text-muted-foreground text-pretty">
        ¿Olvidaste guardar el secreto? Los tokens solo se muestran una vez al crearlos. Revoca y crea uno nuevo.
      </p>
    </div>
  );
}
