import { expect, test } from "@playwright/test";

test.describe("document login: no profile, no invite", () => {
  test("redirects to email signup with document prefilled when no profile/invite", async ({ page }) => {
    await page.goto("/es/auth");
    await page.getByRole("link", { name: "Continuar con documento" }).click();
    await page.waitForURL(/\/auth\/document/);

    // Defaults: country=CL, kind=nin. Enter a valid RUT that does NOT exist in profiles or invites.
    await page.getByLabel("Documento").fill("11.111.111-1");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Dispatcher redirects to /auth/email/signup with the document prefilled via query string.
    await page.waitForURL(/\/auth\/email\/signup\?country=CL&kind=nin&value=/);
    expect(page.url()).toContain("/auth/email/signup");
    expect(page.url()).toContain("country=CL");
    expect(page.url()).toContain("kind=nin");
  });

  test("rejects RUT with invalid check digit before submit", async ({ page }) => {
    await page.goto("/es/auth/document");
    await page.getByLabel("Documento").fill("12.345.678-9");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText(/RUT inválido/i)).toBeVisible();
  });
});
