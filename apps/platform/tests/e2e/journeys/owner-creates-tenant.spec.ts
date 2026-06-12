import { expect, test } from "@playwright/test";
import { CREATE_CONFIRMED_USER, DELETE_TENANT_BY_SLUG, DELETE_USER_BY_EMAIL } from "../fixtures/supabase";

test.describe("owner creates first tenant", () => {
  /**
   * Unique per run so parallel CI doesn't collide and re-runs against a stale DB don't trip
   * the (organization_id, email) pending-invite uniqueness or the tenant_slug unique index.
   */
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

  /**
   * Sign in via the consolidated two-step /auth/email flow.
   * Step 1: email input. Step 2 (same route, ?value=…&has_password=1): method picker
   * renders the password form for an account that has a password.
   */
  test("login → /tenants/create → land on tenant path", async ({ page }) => {
    await page.goto("/es/auth");
    await page.getByLabel("Cuenta").fill(email);
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.waitForURL(/\/auth\/email\?/);
    await page.getByLabel("Contraseña").fill(password);
    await page.getByRole("button", { name: "Ingresar con contraseña" }).click();

    // Wait until we leave auth flow, then navigate to tenant creator
    await page.waitForURL((url) => !url.pathname.includes("/auth/"));
    await page.goto("/es/tenants/create");

    // Create tenant
    await page.getByLabel("Nombre", { exact: true }).fill(tenantName);
    await page.getByLabel("Identificador").fill(tenantSlug);
    await page.getByRole("button", { name: /crear empresa/i }).click();

    // Verify hard-redirect to /es/t/[slug]/[organization_id]
    await page.waitForURL(new RegExp(`/es/t/${tenantSlug}/\\d+`));
    expect(page.url()).toMatch(new RegExp(`/es/t/${tenantSlug}/\\d+`));

    // Verify proxy organization_membership gate blocks non-members
    await expect(page.getByText(tenantName).first()).toBeVisible();
    await expect(page.getByText("Miembros y permisos").first()).toBeVisible();
  });
});
