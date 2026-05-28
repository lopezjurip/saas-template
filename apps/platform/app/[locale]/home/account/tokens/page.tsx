// TODO: backend for API tokens isn't wired yet. Schema would need a `personal_tokens`
// table with prefix + hashed secret + scopes, and an authedAction to mint/revoke.

export default function TokensPage() {
  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Desarrollo · API</span>
        <h1 className="acc-section-title">Tokens personales</h1>
        <p className="acc-section-sub">
          Genera tokens para automatizar tareas o conectar con la API. Heredan tus permisos en cada organización —
          trátalos como contraseñas.
        </p>
      </header>
      <div className="acc-todo">
        <strong className="block text-foreground mb-1">Próximamente</strong>
        Estamos terminando el backend de tokens personales. Cuando esté listo podrás crearlos y revocarlos desde aquí.
      </div>
    </div>
  );
}
