import { expect, test } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

const requireEnv = (name: 'E2E_BASE_URL' | 'E2E_LOGIN_NAME' | 'E2E_PASSWORD'): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const BASE_URL = requireEnv('E2E_BASE_URL')
const LOGIN_NAME = requireEnv('E2E_LOGIN_NAME')
const PASSWORD = requireEnv('E2E_PASSWORD')

test.describe('Auth Login', () => {
  test('user can sign in with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page, BASE_URL)
    await loginPage.goto()

    await loginPage.login(LOGIN_NAME, PASSWORD)

    await page.waitForURL(/.*\/app\/.*/, {
      timeout: 30000,
    })

    await expect(page).toHaveURL(/^(?!.*\/auth\/signin).*/)
  })
})
