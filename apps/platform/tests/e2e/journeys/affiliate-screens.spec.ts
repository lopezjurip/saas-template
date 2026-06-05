import { expect, type Page, test } from "@playwright/test";
import { CREATE_CONFIRMED_USER, DELETE_USER_BY_EMAIL } from "../fixtures/supabase";

// Affiliate portal (/affiliate) is backed by the agencies-mock fixture —
// no tenant/membership needed, any confirmed auth user reaches it.

test.describe("affiliate screens", () => {
  const runId = Math.random().toString(36).slice(2, 8);
  const email = `affiliate-${runId}@humane.test`;
  const password = "password123";

  test.beforeAll(async () => {
    await CREATE_CONFIRMED_USER(email, password, "Affiliate User");
  });

  test.afterAll(async () => {
    await DELETE_USER_BY_EMAIL(email);
  });

  test("affiliate portal renders top bar with agency name", async ({ page }) => {
    await signIn(page, email, password);
    await page.goto("/es/affiliate");

    // The mock viewer is affiliated with the first agency (BDO Auditores, an audit firm).
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
