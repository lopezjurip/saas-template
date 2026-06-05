import { expect, type Page, test } from "@playwright/test";
import { CREATE_CONFIRMED_USER, DELETE_USER_BY_EMAIL } from "../fixtures/supabase";

// Admin agencies screens (/admin/agencies/**) are backed by the agencies-mock fixture —
// no tenant/membership needed, any confirmed auth user reaches them.

test.describe("admin agencies screens", () => {
  const runId = Math.random().toString(36).slice(2, 8);
  const email = `admin-ag-${runId}@humane.test`;
  const password = "password123";

  test.beforeAll(async () => {
    await CREATE_CONFIRMED_USER(email, password, "Admin User");
  });

  test.afterAll(async () => {
    await DELETE_USER_BY_EMAIL(email);
  });

  test.beforeEach(async ({ page }) => {
    await signIn(page, email, password);
  });

  test("directory renders listing and new-agency button", async ({ page }) => {
    await page.goto("/es/admin/agencies");
    await expect(page.getByRole("heading", { name: "Agencias" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Nueva agencia/i })).toBeVisible();
    // BDO is seeded in mock data.
    await expect(page.getByText("BDO Auditores")).toBeVisible();
  });

  test("agency detail renders for known slug", async ({ page }) => {
    await page.goto("/es/admin/agencies/bdo-auditores");
    await expect(page.getByRole("heading", { name: "BDO Auditores" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Afiliar persona/i })).toBeVisible();
  });

  test("agency detail 404s for unknown slug", async ({ page }) => {
    const response = await page.goto("/es/admin/agencies/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("affiliate invite form renders for known slug", async ({ page }) => {
    await page.goto("/es/admin/agencies/bdo-auditores/affiliates/new");
    await expect(page.getByText("BDO Auditores").first()).toBeVisible();
  });
});

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/es/auth/email");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL(/\/auth\/email\?/);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/"));
}
