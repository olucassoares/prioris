import { expect, test } from "@playwright/test";

test("cadastra um ativo e mantém o registro após recarregar", async ({ page }) => {
  const assetName = `API E2E ${Date.now()}`;

  await page.goto("/");
  await page.getByRole("button", { name: "Ativos" }).click();
  await expect(page.getByRole("heading", { name: "Inventário de ativos" })).toBeVisible();

  await page.getByRole("button", { name: "Novo ativo" }).click();
  await expect(page.getByRole("heading", { name: "Cadastrar ativo" })).toBeVisible();
  await page.getByLabel("Nome do ativo", { exact: false }).fill(assetName);
  await page.getByLabel("Responsável", { exact: false }).fill("Equipe Plataforma");
  await page.getByRole("button", { name: "Cadastrar ativo" }).last().click();

  await expect(page.getByText(assetName)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Ativos" }).click();
  await expect(page.getByText(assetName)).toBeVisible();
});
