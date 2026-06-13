import { expect, type Page, test } from "@playwright/test";

/**
 * The agency console (/a/:slug) is an apex auth-gated surface backed by real DB
 * data. Only an ACTIVE affiliate of the agency may open it — the seed makes
 * iris@humane.test an accepted affiliate of "Demo Auditores" (demo-auditores),
 * granted read access to the acme org. (A dedicated user, not Alice/Bob, so the
 * org-membership pgTAP fixtures keep assuming Alice/Bob have no agency.) The
 * create flow (/agencies/create) is reachable by any confirmed user.
 */
test.describe("agency screens", () => {
  const email = "iris@humane.test";
  const password = "password123";

  test.beforeEach(async ({ page }) => {
    await signIn(page, email, password);
  });

  test("console renders agency chrome and switches tabs", async ({ page }) => {
    await page.goto("/a/demo-auditores");

    // Check top bar carries the agency identity; the team tab is the default.
    await expect(page.getByText("Demo Auditores").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Equipo de la agencia" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Equipo/ })).toHaveAttribute("aria-selected", "true");

    // Check access tab lists the orgs that granted the agency read access (acme org = "Acme SpA").
    await page.getByRole("tab", { name: /Accesos/ }).click();
    await expect(page.getByRole("heading", { name: "Accesos recibidos" })).toBeVisible();
    await expect(page.getByText("Acme SpA").first()).toBeVisible();

    // Check profile tab exposes the read-only agency info.
    await page.getByRole("tab", { name: /Perfil/ }).click();
    await expect(page.getByRole("heading", { name: "Perfil de la agencia" })).toBeVisible();
  });

  test("console 404s for an unknown agency slug", async ({ page }) => {
    const response = await page.goto("/a/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("create flow derives the slug and creates the agency", async ({ page }) => {
    const runId = Math.random().toString(36).slice(2, 8);
    await page.goto("/agencies/create");

    await page.getByLabel("Nombre de la agencia").fill(`Estudio Andrade ${runId}`);
    // Slug auto-derives via SLUGIFY
    await expect(page.getByLabel(/Identificador/)).toHaveValue(`estudio-andrade-${runId}`);

    await page.getByRole("button", { name: /Crear agencia/i }).click();

    // Verify confirmation + console address built from slug
    await expect(page.getByText("Agencia creada")).toBeVisible();
    await expect(page.getByText(`app.example.com/a/estudio-andrade-${runId}`)).toBeVisible();
    await expect(page.getByRole("link", { name: /Abrir consola/i })).toBeVisible();
  });
});

/**
 * Sign in through the consolidated two-step /auth/email flow (mirrors owner-creates-tenant).
 */
async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.getByLabel("Cuenta").fill(email);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL(/\/auth\/email\?/);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar con contraseña" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/"));
}
