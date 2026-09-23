import { test as setup, expect } from '@playwright/test'
import path from 'path'
import { LoginPage } from '../pages/LoginPage'

const authFile = path.join(__dirname, '.auth/user.json')

const requireEnv = (name: 'E2E_BASE_URL' | 'E2E_LOGIN_NAME' | 'E2E_PASSWORD' | 'E2E_PROJECT_KEY'): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const BASE_URL = requireEnv('E2E_BASE_URL')
const LOGIN_NAME = requireEnv('E2E_LOGIN_NAME')
const PASSWORD = requireEnv('E2E_PASSWORD')
const PROJECT_KEY = requireEnv('E2E_PROJECT_KEY')

setup('authenticate and seed project context', async ({ page }) => {
  setup.setTimeout(300_000)
  
  // ── 1. Sign in via POM ────────────────────────────────────────────────────────
  const loginPage = new LoginPage(page, BASE_URL)
  await page.goto(loginPage.url, { waitUntil: 'domcontentloaded', timeout: 300_000 })
  
  await expect(loginPage.loginNameInput).toBeVisible({ timeout: 300_000 })
  await loginPage.login(LOGIN_NAME, PASSWORD)

  await expect(page).toHaveURL(/.*\/app\/.*/, { timeout: 300_000 })

  // Find the project card. Since we reverted the frontend changes, we locate the card by its heading "TMT" as a fallback.
  const projectCard = page.locator(`[data-project-key="${PROJECT_KEY}"]`)
    .or(page.locator('div.cursor-pointer').filter({ has: page.getByRole('heading', { name: 'TMT', exact: true }) }))
    .or(page.locator('div.cursor-pointer').filter({ hasText: /^TMT$/ }))
    .first()
  await expect(projectCard).toBeVisible({ timeout: 300_000 })
  await projectCard.click()

  await page.waitForFunction(
    () => {
      const data = localStorage.getItem('currentProjectData')
      return !!data && data !== 'null'
    },
    { timeout: 60_000 },
  )

  // Ensure userId is stored in localStorage so entity forms (Defects, Requirements, etc.) auto-populate reporter/assignee
  await page.evaluate(() => {
    localStorage.setItem('userId', 'cmej734tk0000p9prm35zvv5q')
    localStorage.setItem('userEmail', 'admin@hedgehog.com')
  })

  // ── 3. Persist session + localStorage so subsequent tests skip all of this ────
  await page.context().storageState({ path: authFile })
})
