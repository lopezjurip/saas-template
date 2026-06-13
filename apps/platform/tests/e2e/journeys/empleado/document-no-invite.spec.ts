import { expect, test } from "@playwright/test";

test.describe("document login: no profile, no invite", () => {
  /**
   * The /auth entry page is now a smart input (no per-method links); go straight to the
   * consolidated document route, which renders its own entry form.
   */
  test("redirects to email auth when no profile/invite is found", async ({ page }) => {
    await page.goto("/auth/document");

    // Defaults: country=CL, kind=nin. Enter a valid RUT that does NOT exist in profiles or invites.
    await page.getByLabel("RUT").fill("11.111.111-1");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Dispatcher redirects to /auth/email (passwordless signup); document collected later during onboarding.
    await page.waitForURL(/\/auth\/email/);
    expect(page.url()).toContain("/auth/email");
  });

  test("rejects RUT with invalid check digit before submit", async ({ page }) => {
    await page.goto("/auth/document");
    await page.getByLabel("RUT").fill("12.345.678-9");
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText(/RUT inválido/i)).toBeVisible();
  });
});
