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
    // ----- sign in (two-step: identifier then password) -----
    await page.goto("/es/auth");
    await page.getByLabel("Correo o teléfono").fill(email);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    // /auth branches to /auth/email/login because the identifier exists in auth.users.
    await page.waitForURL(/\/auth\/email\/login/);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Onboarding is not a hard gate (see apps/platform/proxy.ts:161-164), but a freshly-created
    // user lands on /onboarding by default. Force-navigate to the tenant creator instead — the
    // onboarding journey is exercised by its own spec.
    await page.waitForURL(/\/(onboarding|dashboard)/);
    await page.goto("/es/tenants/create");

    // ----- create tenant -----
    await page.getByLabel("Nombre de la empresa").fill(tenantName);
    await page.getByLabel("Identificador").fill(tenantSlug);
    await page.getByRole("button", { name: /crear empresa/i }).click();

    // ----- assertion 1: hard-redirect to /[locale]/[slug] -----
    // createTenant action does window.location.assign(`/${locale}/${slug}`) so the new JWT
    // (with the tenant claim) is fetched on the next request.
    await page.waitForURL(`**/es/${tenantSlug}`);
    expect(page.url()).toContain(`/es/${tenantSlug}`);

    // ----- assertion 2: subdomain access works (RLS membership gate, proxy rewrite) -----
    // This is the more important RLS-touching assertion: the proxy resolves the slug
    // via service-role, verifies the user's tenant claim (proxy.ts:175), then rewrites
    // /[locale]/{tenant_slug}... and the tenant page renders.
    await page.goto(`https://${tenantSlug}.${APEX}:${PORT}/es`, { waitUntil: "networkidle" });
    // URL still on the subdomain — catches the "proxy 403'd and bounced to apex" failure mode.
    await expect(page).toHaveURL(new RegExp(`^https://${tenantSlug}\\.${APEX}:${PORT}/`));
    // Positive content from app/[locale]/[tenant_slug]/page.tsx: tenant name + the
    // "Tus organizaciones aquí" copy. CardTitle isn't a semantic heading in this version
    // of shadcn, so we assert on text rather than role.
    await expect(page.getByText(tenantName).first()).toBeVisible();
    await expect(page.getByText("Tus organizaciones aquí")).toBeVisible();
  });
});
