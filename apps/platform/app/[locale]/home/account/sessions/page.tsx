import { SessionsSection } from "./sessions-section";

export default async function SessionsPage() {
  return (
    <div className="flex max-w-[720px] flex-col gap-[18px]">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Seguridad · Dispositivos
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Dispositivos y sesiones</h1>
        <p className="text-pretty text-[13px] leading-normal text-muted-foreground">
          Todos los lugares donde tu cuenta tiene sesión abierta. Si ves algo que no reconoces, ciérralo aquí mismo.
        </p>
      </header>
      <SessionsSection />
    </div>
  );
}
