import { expect, type Page, test } from "@playwright/test";

/**
 * Affiliate portal (/affiliate) renders the viewer's real agency memberships.
 * The seed gives iris@humane.test an ACCEPTED membership of "Demo Auditores"
 * (granted read access to the acme org) and alice@humane.test a PENDING invite.
 * iris is a dedicated affiliate user (not Alice/Bob) so the org-membership pgTAP
 * fixtures keep assuming Alice/Bob have no agency.
 */
test.describe("affiliate screens", () => {
  const password = "password123";

  test("accepted affiliate sees their agency and granted org", async ({ page }) => {
    await signIn(page, "iris@humane.test", password);
    await page.goto("/es/affiliate");

    await expect(page.getByText("Demo Auditores").first()).toBeVisible();
    // Verify agency read access to acme org
    await expect(page.getByText("Acme SpA").first()).toBeVisible();
  });

  test("pending invite shows accept / reject actions", async ({ page }) => {
    await signIn(page, "alice@humane.test", password);
    await page.goto("/es/affiliate");

    await expect(page.getByRole("heading", { name: /Tus agencias/ })).toBeVisible();
    await expect(page.getByText("Invitaciones pendientes")).toBeVisible();
    await expect(page.getByText("Demo Auditores").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Aceptar/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Rechazar/ })).toBeVisible();
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
