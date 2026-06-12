import { NotificationsMatrix } from "./notifications-matrix";

export default function NotificationsPage() {
  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Preferencias · Notificaciones
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Notificaciones</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">
          Las alertas de seguridad llegan siempre. Todo lo demás lo decides tú. Estas preferencias aplican a tu cuenta
          personal — cada organización tiene las suyas.
        </p>
      </header>
      <NotificationsMatrix />
    </div>
  );
}
