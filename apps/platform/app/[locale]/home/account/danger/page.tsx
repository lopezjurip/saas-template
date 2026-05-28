// TODO: account deletion isn't implemented yet — needs a workflow that revokes sessions,
// drops/anonymizes the profile, and respects organization data ownership rules. Until then
// the page just shows the policy text so users know what to expect.

export default function DangerPage() {
  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Zona de riesgo</span>
        <h1 className="acc-section-title">Eliminar tu cuenta</h1>
        <p className="acc-section-sub">
          Al eliminar tu cuenta borramos tus datos personales, sesiones y tokens. Lo que hayas creado dentro de una
          organización sigue siendo de esa organización — habla con su admin si quieres bajarlo antes.
        </p>
      </header>
      <div className="acc-todo">
        <strong className="block text-foreground mb-1">Próximamente</strong>
        El flujo de eliminación de cuenta está en construcción. Por ahora, contáctanos para borrar tu cuenta
        manualmente.
      </div>
    </div>
  );
}
