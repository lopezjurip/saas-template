import { SessionsSection } from "./sessions-section";

export default async function SessionsPage() {
  return (
    <div className="acc-section">
      <header className="acc-section-head">
        <span className="acc-section-eyebrow">Seguridad · Dispositivos</span>
        <h1 className="acc-section-title">Dispositivos y sesiones</h1>
        <p className="acc-section-sub">
          Todos los lugares donde tu cuenta tiene sesión abierta. Si ves algo que no reconoces, ciérralo aquí mismo.
        </p>
      </header>
      <SessionsSection />
    </div>
  );
}
