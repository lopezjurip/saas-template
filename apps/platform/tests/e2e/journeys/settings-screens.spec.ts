import { expect, type Page, test } from "@playwright/test";
import { CREATE_CONFIRMED_USER, DELETE_TENANT_BY_SLUG, DELETE_USER_BY_EMAIL } from "../fixtures/supabase";

// Settings screens require a real tenant + org (no mock backing).
// The owner account gets the wildcard permission grant on creation, so every
// settings tab is reachable without extra DB setup.

test.describe("settings screens", () => {
  const runId = Math.random().toString(36).slice(2, 8);
  const email = `settings-${runId}@humane.test`;
  const password = "password123";
  const tenantSlug = `settings-co-${runId}`;
  const tenantName = `Settings Co ${runId}`;
  let orgId: string;

  test.beforeAll(async ({ browser }) => {
    await CREATE_CONFIRMED_USER(email, password, "Settings Owner");

    // Create the tenant via the UI to get a real org_id from the redirect URL.
    const page = await browser.newPage();
    await signIn(page, email, password);
    await page.goto("/es/tenants/create");
    await page.getByLabel("Nombre", { exact: true }).fill(tenantName);
    await page.getByLabel("Identificador").fill(tenantSlug);
    await page.getByRole("button", { name: /crear empresa/i }).click();
    await page.waitForURL(new RegExp(`/es/t/${tenantSlug}/\\d+`));
    const match = page.url().match(/\/(\d+)(?:\/|$)/);
    if (!match?.[1]) throw new Error(`org_id not found in URL: ${page.url()}`);
    orgId = match[1];
    await page.close();
  });

  test.afterAll(async () => {
    await DELETE_TENANT_BY_SLUG(tenantSlug);
    await DELETE_USER_BY_EMAIL(email);
  });

  test.beforeEach(async ({ page }) => {
    await signIn(page, email, password);
  });

  test("sidebar renders all nav links on general settings", async ({ page }) => {
    await page.goto(`/es/t/${tenantSlug}/${orgId}/settings/general`);

    // Sidebar title (from settings layout.tsx — the RSC serialization bug would break this).
    await expect(page.getByText("Configuración")).toBeVisible();

    // All four sidebar nav links must be present.
    await expect(page.getByRole("link", { name: "General" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Miembros" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Facturación" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Acceso externo" })).toBeVisible();

    // Page content (from general-settings.tsx).
    await expect(page.getByRole("heading", { name: "Ajustes de la organización" })).toBeVisible();
  });

  test("members page renders without error", async ({ page }) => {
    await page.goto(`/es/t/${tenantSlug}/${orgId}/settings/members`);
    await expect(page.getByText("Configuración")).toBeVisible();
  });

  test("billing page renders without error", async ({ page }) => {
    await page.goto(`/es/t/${tenantSlug}/${orgId}/settings/billing`);
    await expect(page.getByText("Configuración")).toBeVisible();
  });

  test("external-access page renders without error", async ({ page }) => {
    await page.goto(`/es/t/${tenantSlug}/${orgId}/settings/external-access`);
    await expect(page.getByText("Configuración")).toBeVisible();
  });
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/es/auth");
  await page.getByLabel("Cuenta").fill(email);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL(/\/auth\/email\?/);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar con contraseña" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/"));
}
