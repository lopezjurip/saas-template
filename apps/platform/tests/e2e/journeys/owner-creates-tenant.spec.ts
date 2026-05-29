import { expect, test } from "@playwright/test";
import { CREATE_CONFIRMED_USER, DELETE_TENANT_BY_SLUG, DELETE_USER_BY_EMAIL } from "../fixtures/supabase";

const PORT = process.env["PORT"] ?? "7003";
const APEX = process.env["NEXT_PUBLIC_APEX_HOSTNAME"] ?? "lvh.me";

test.describe("owner creates first tenant", () => {
  // Unique per run so parallel CI doesn't collide and re-runs against a stale DB don't trip
  // the (organization_id, email) pending-invite uniqueness or the tenant_slug unique index.
  const runId = Math.random().toString(36).slice(2, 8);
  const email = `owner-${runId}@humane.test`;
  const password = "password123";
  const tenantSlug = `acme-${runId}`;
  const tenantName = `Acme ${runId}`;

  test.beforeAll(async () => {
    await CREATE_CONFIRMED_USER(email, password, "Acme Owner");
  });

  test.afterAll(async () => {
    await DELETE_TENANT_BY_SLUG(tenantSlug);
    await DELETE_USER_BY_EMAIL(email);
  });

  test("login → /tenants/create → land on tenant subdomain", async ({ page }) => {
    // ----- sign in via the consolidated two-step /auth/email flow -----
    // Step 1: email input. Step 2 (same route, ?value=…&has_password=1): method picker
    // renders the password form for an account that has a password.
    await page.goto("/es/auth/email");
    await page.getByLabel("Correo electrónico").fill(email);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.waitForURL(/\/auth\/email\?/);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Password login sets the session and routes to `next`. Onboarding is not a hard gate.
    // Wait until we leave the auth flow, then force-navigate to the tenant creator — the
    // onboarding journey is exercised by its own spec.
    await page.waitForURL((url) => !url.pathname.includes("/auth/"));
    await page.goto("/es/tenants/create");

    // ----- create tenant -----
    await page.getByLabel("Nombre de la empresa").fill(tenantName);
    await page.getByLabel("Identificador").fill(tenantSlug);
    await page.getByRole("button", { name: /crear empresa/i }).click();

    // ----- assertion 1: hard-redirect to /[locale]/[slug]/[organization_id] -----
    // createTenant action does window.location.assign(`/${locale}/${slug}`). The tenant home
    // is now an org picker; with exactly one org it server-redirects to /[slug]/[organization_id].
    await page.waitForURL(new RegExp(`/es/${tenantSlug}/\\d+`));
    expect(page.url()).toMatch(new RegExp(`/es/${tenantSlug}/\\d+`));

    // ----- assertion 2: subdomain access works (RLS membership gate, proxy rewrite) -----
    // The proxy resolves the slug via service-role, verifies tenant membership (proxy.ts),
    // rewrites /[locale]/{tenant_slug}, then the page redirects to /{organization_id}.
    await page.goto(`https://${tenantSlug}.${APEX}:${PORT}/es`, { waitUntil: "networkidle" });
    // URL still on the subdomain (proxy didn't bounce to apex). The server-side redirect
    // from the org picker lands the browser at /es/{slug}/{org_id} on the subdomain host.
    await expect(page).toHaveURL(new RegExp(`^https://${tenantSlug}\\.${APEX}:${PORT}/es/`));
    // Org-home shows the organization (= tenant name when there's only one default org).
    await expect(page.getByText(tenantName).first()).toBeVisible();
    await expect(page.getByText("Miembros y permisos").first()).toBeVisible();
  });
});
