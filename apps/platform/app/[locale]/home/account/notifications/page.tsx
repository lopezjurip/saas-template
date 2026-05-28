// TODO: notification preferences require a `notification_preferences` table per user
// (system/marketing/channel toggles). For now the page shows the catalog but the toggles
// don't persist anywhere — render as a "próximamente" placeholder until the schema lands.

export default function NotificationsPage() {
  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Preferencias · Notificaciones</span>
        <h1 className="acc-section-title">Notificaciones</h1>
        <p className="acc-section-sub">Las alertas de seguridad llegan siempre. Todo lo demás lo decides tú.</p>
      </header>
      <div className="acc-todo">
        <strong className="block text-foreground mb-1">Próximamente</strong>
        Las preferencias de notificación se guardan en la organización. Estamos terminando el modelo para que cada
        usuario tenga sus propios canales.
      </div>
    </div>
  );
}
