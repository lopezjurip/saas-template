import { fetchGeoMap } from "@packages/api-ip/geo";
import { createServerClient, getSupabaseServerSession } from "@packages/supabase/client.server";
import { JWT_DECODE_PAYLOAD } from "@packages/utils/jwt";
import { UAParser } from "ua-parser-js";
import { type SessionRow, SessionsSection } from "./sessions-section";

function parseUserAgent(ua: string | null): { device: string; browser: string; kind: "mobile" | "desktop" } {
  if (!ua) return { device: "Dispositivo desconocido", browser: "Navegador desconocido", kind: "desktop" };
  const parser = new UAParser(ua);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  const isMobile = device.type === "mobile" || device.type === "tablet";
  const deviceName = device.model ?? (isMobile ? "Teléfono" : (os.name ?? "Dispositivo"));
  const browserStr = [browser.name, os.name].filter(Boolean).join(" · ") || "Navegador desconocido";
  return { device: deviceName, browser: browserStr, kind: isMobile ? "mobile" : "desktop" };
}

function formatLastActive(date: Date | null): string {
  if (!date) return "Desconocido";
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 2) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days === 1 ? "" : "s"}`;
}

export default async function SessionsPage() {
  const [supabase, session] = await Promise.all([createServerClient(), getSupabaseServerSession()]);

  const currentSessionId = session
    ? ((JWT_DECODE_PAYLOAD(session.access_token) as { session_id?: string } | null)?.session_id ?? null)
    : null;

  const { data: rawSessions } = await supabase.rpc("viewer_sessions");

  const rows: SessionRow[] = [];

  if (rawSessions && rawSessions.length > 0) {
    const ips = rawSessions.map((s) => s.ip ?? "").filter(Boolean);
    const geoMap = await fetchGeoMap(ips);

    for (const s of rawSessions) {
      const { device, browser, kind } = parseUserAgent(s.user_agent ?? null);
      const lastActiveDate = s.refreshed_at ? new Date(s.refreshed_at) : s.created_at ? new Date(s.created_at) : null;
      const location = s.ip ? (geoMap.get(s.ip) ?? s.ip) : "Ubicación desconocida";
      const stale = lastActiveDate ? Date.now() - lastActiveDate.getTime() > 30 * 24 * 60 * 60 * 1000 : false;

      rows.push({
        id: s.id,
        kind,
        device,
        browser,
        location,
        lastActive: formatLastActive(lastActiveDate),
        current: s.id === currentSessionId,
        stale,
      });
    }
  }

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Seguridad · Dispositivos
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">Dispositivos y sesiones</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">
          Todos los lugares donde tu cuenta tiene sesión abierta. Si ves algo que no reconoces, ciérralo aquí mismo.
        </p>
      </header>
      <SessionsSection sessions={rows} />
    </div>
  );
}
