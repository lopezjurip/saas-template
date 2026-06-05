import { expect, type Page, test } from "@playwright/test";
import { CREATE_CONFIRMED_USER, DELETE_USER_BY_EMAIL } from "../fixtures/supabase";

// The agency console (/a/:slug) and create (/agencies/create) are apex auth-gated
// surfaces backed by the agencies-mock fixture — no tenant/membership needed, so any
// confirmed user reaches them. We only assert UI behavior here (the data is mock).

test.describe("agency screens", () => {
  const runId = Math.random().toString(36).slice(2, 8);
  const email = `agency-${runId}@humane.test`;
  const password = "password123";

  test.beforeAll(async () => {
    await CREATE_CONFIRMED_USER(email, password, "Agency Viewer");
  });

  test.afterAll(async () => {
    await DELETE_USER_BY_EMAIL(email);
  });

  test.beforeEach(async ({ page }) => {
    await signIn(page, email, password);
  });

  test("console renders agency chrome and switches tabs", async ({ page }) => {
    await page.goto("/es/a/bdo-auditores");

    // Top bar carries the agency identity; the team tab is the default.
    await expect(page.getByText("BDO Auditores").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Equipo de la agencia" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Equipo/ })).toHaveAttribute("aria-selected", "true");

    // Access tab lists the orgs that granted BDO read access.
    await page.getByRole("tab", { name: /Accesos/ }).click();
    await expect(page.getByRole("heading", { name: "Accesos recibidos" })).toBeVisible();
    await expect(page.getByText("Acme Studio")).toBeVisible();

    // Profile tab exposes the editable form + danger zone.
    await page.getByRole("tab", { name: /Perfil/ }).click();
    await expect(page.getByRole("heading", { name: "Perfil de la agencia" })).toBeVisible();
    await expect(page.getByText("Zona de peligro")).toBeVisible();
  });

  test("console 404s for an unknown agency slug", async ({ page }) => {
    const response = await page.goto("/es/a/does-not-exist");
    expect(response?.status()).toBe(404);
  });

  test("create flow derives the slug and reaches the created stage", async ({ page }) => {
    await page.goto("/es/agencies/create");

    await page.getByLabel("Nombre de la agencia").fill("Estudio Andrade Test");
    // Slug auto-derives from the name via @packages/utils SLUGIFY.
    await expect(page.getByLabel(/Identificador/)).toHaveValue("estudio-andrade-test");

    await page.getByRole("button", { name: /Crear agencia/i }).click();

    // Created stage: confirmation + the console address built from the slug.
    await expect(page.getByText("Agencia creada")).toBeVisible();
    await expect(page.getByText("app.example.com/a/estudio-andrade-test")).toBeVisible();
    await expect(page.getByRole("link", { name: /Abrir consola/i })).toBeVisible();
  });
});

// Sign in through the consolidated two-step /auth/email flow (mirrors owner-creates-tenant).
async function signIn(page: Page, email: string, password: string) {
  await page.goto("/es/auth/email");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.waitForURL(/\/auth\/email\?/);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/"));
}
