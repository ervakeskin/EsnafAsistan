// Playwright E2E Test — EsnafAsistan Ana Akışı
// Çalıştırmak için: npx playwright test

import { test, expect } from "@playwright/test"

test.describe("EsnafAsistan Ana Akış", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("giriş sayfası yükleniyor", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Dükkanınızı")
    await expect(page.getByText("Giriş Yap")).toBeVisible()
  })

  test("kayıt sayfasına yönlendirme", async ({ page }) => {
    await page.getByText("Kayıt Ol").click()
    await expect(page).toHaveURL(/kayit-ol/)
  })

  test("boş form ile giriş denemesi", async ({ page }) => {
    await page.getByRole("button", { name: "Panele Giriş Yap" }).click()
    await expect(page.getByText("E-posta ve şifre")).toBeVisible()
  })

  test("dashboard sayfası login gerektiriyor", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL("/")
  })
})

test.describe("Stok Yönetimi", () => {
  test("stok sayfası login gerektiriyor", async ({ page }) => {
    await page.goto("/dashboard/stok")
    await expect(page).toHaveURL("/")
  })
})

test.describe("Teslimat Yönetimi", () => {
  test("teslimat sayfası login gerektiriyor", async ({ page }) => {
    await page.goto("/dashboard/teslimatlar")
    await expect(page).toHaveURL("/")
  })
})

test.describe("Raporlar", () => {
  test("raporlar sayfası login gerektiriyor", async ({ page }) => {
    await page.goto("/dashboard/raporlar")
    await expect(page).toHaveURL("/")
  })
})
