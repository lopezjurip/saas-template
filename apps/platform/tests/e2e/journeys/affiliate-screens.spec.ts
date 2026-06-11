import { expect, type Page, test } from "@playwright/test";

// Affiliate portal (/affiliate) renders the viewer's real agency memberships.
// The seed gives bob@humane.test an ACCEPTED membership of "Demo Auditores"
// (granted read access to the acme org) and alice@humane.test a PENDING invite.

test.describe("affiliate screens", () => {
  const password = "password123";

  test("accepted affiliate sees their agency and granted org", async ({ page }) => {
    await signIn(page, "bob@humane.test", password);
    await page.goto("/es/affiliate");

    await expect(page.getByText("Demo Auditores").first()).toBeVisible();
    // The agency is granted read access to the acme org ("Acme SpA").
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
  await page.goto("/es/auth/email");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL(/\/auth\/email\?/);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/"));
}
