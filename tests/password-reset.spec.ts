import { expect, test } from '@playwright/test'
import { BASE_URL, API_URL, loginAs, adminUrl } from './helpers/auth'
import { LoginPage } from '../pages/LoginPage'
import { PasswordResetPage } from '../pages/PasswordResetPage'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

// Force a clean guest browser context (no pre-saved admin storage state) for all tests in this file
test.use({ storageState: { cookies: [], origins: [] } })

function base64url(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

// Dynamically extracts NEXTAUTH_SECRET from backend environment variables
function getJwtSecret(): string {
  try {
    const envPath = path.resolve(__dirname, '../../hedgehog-backend/.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      const match = envContent.match(/^NEXTAUTH_SECRET=(.*)$/m)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
  } catch (e) {
    console.error('Error reading JWT secret:', e)
  }
  return 'fallback-secret-key'
}

function generateResetToken(userId: string): string {
  const secret = getJwtSecret()
  const header = { alg: 'HS256', typ: 'JWT' }
  
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 3 * 60 * 60 // 3 hours expiry
  const payload = {
    userId,
    type: 'password-reset',
    iat,
    exp
  }

  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

test.describe('Password Reset Lifecycle', () => {
  let loginPage: LoginPage
  let passwordResetPage: PasswordResetPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page, BASE_URL)
    passwordResetPage = new PasswordResetPage(page, BASE_URL)
  })

  test('S1 - Client-Side Validation: Weak Password Check', async ({ page }) => {
    await passwordResetPage.goto('dummy_token_value')
    await expect(page.getByText('Choose a new password for your account.')).toBeVisible()

    // Fill in a weak password
    await passwordResetPage.resetPassword('123', '123')
    
    // Alert should show the list of failed rules
    await expect(page.locator('.text-red-600').first()).toBeVisible()
    await expect(page.getByRole('alert').filter({ hasText: 'Password must include' })).toBeVisible()
  })

  test('S2 - Client-Side Validation: Mismatched Confirmation', async ({ page }) => {
    await passwordResetPage.goto('dummy_token_value')
    await expect(page.getByText('Choose a new password for your account.')).toBeVisible()
    
    // Input strong password, but mismatched confirmation password
    await passwordResetPage.resetPassword('SecurePassword123!', 'SecurePassword123!!!')

    // Assert error message
    await expect(page.getByText('Passwords do not match.')).toBeVisible()
  })

  test('S3 - Admin initiated E2E Reset Flow & S4 - Password Reuse Restriction', async ({ page }) => {
    // 1. Create a temporary user via Admin User Management
    await loginAs(page, 'admin', { skipProject: true })
    await page.goto(adminUrl('user-management'))
    await expect(page.getByRole('heading', { name: 'User Management' }).first()).toBeVisible({ timeout: 15_000 })

    const createBtn = page.getByRole('button', { name: 'Create User', exact: true })
    await createBtn.click()

    const uniqueId = Date.now()
    const username = `e2e_reset_${uniqueId}`
    const email = `e2e_reset_${uniqueId}@example.com`

    await loginPage.loginNameInput.fill(username)
    await page.locator('#firstName').fill('E2EPWReset')
    await page.locator('#lastName').fill('User')
    await page.locator('#email').fill(email)
    await loginPage.passwordInput.fill('SecurePassword123!')
    await loginPage.submit()

    // Search and verify the user is listed
    const searchInput = page.getByPlaceholder('Search users by name, email, or login...')
    await searchInput.fill(username)
    
    const userCard = page.locator('.rounded-lg').filter({ hasText: email }).first()
    await expect(userCard).toBeVisible({ timeout: 15_000 })

    // 2. Fetch the user's ID using Admin's access token via backend API
    const token = await page.evaluate(() => localStorage.getItem('accessToken'))
    expect(token).toBeTruthy()

    const usersResponse = await page.request.get(`${API_URL}/api/v1/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    expect(usersResponse.ok()).toBeTruthy()
    const usersData = await usersResponse.json()
    const targetUser = usersData.data.users.find((u: any) => u.loginName === username)
    expect(targetUser).toBeTruthy()
    const userId = targetUser.id

    // Sign out from admin session
    await page.evaluate(() => localStorage.clear())
    await page.evaluate(() => sessionStorage.clear())

    // 3. E2E Reset password using signed reset token
    const resetToken = generateResetToken(userId)
    await passwordResetPage.goto(resetToken)
    await expect(page.getByText('Choose a new password for your account.')).toBeVisible()

    await passwordResetPage.resetPassword('NewSecurePassword123!', 'NewSecurePassword123!')

    // Assert success alert is visible and redirects to signin
    await expect(page.getByText('Password has been reset successfully')).toBeVisible({ timeout: 10_000 })
    await page.waitForURL(/.*\/auth\/signin/, { timeout: 10_000 })

    // 4. Verify login with the NEW password
    await loginPage.login(username, 'NewSecurePassword123!')

    // Success login redirects to app dashboard
    await page.waitForURL(/.*\/app\/.*/, { timeout: 20_000 })
    await page.evaluate(() => localStorage.clear())
    await page.evaluate(() => sessionStorage.clear())

    // 5. Test Password Reuse Restriction
    const reuseResetToken = generateResetToken(userId)
    await passwordResetPage.goto(reuseResetToken)
    await expect(page.getByText('Choose a new password for your account.')).toBeVisible()

    // Enter the same password ('NewSecurePassword123!')
    await passwordResetPage.resetPassword('NewSecurePassword123!', 'NewSecurePassword123!')

    // Assert that password reuse validation checks fail with API error message
    await expect(page.getByText('New password must be different from your current password')).toBeVisible({ timeout: 10_000 })

    // 6. Cleanup: Log back as admin and delete the temp user
    await loginAs(page, 'admin', { skipProject: true })
    await page.goto(adminUrl('user-management'))
    await expect(page.getByRole('heading', { name: 'User Management' }).first()).toBeVisible({ timeout: 15_000 })

    await searchInput.fill(username)
    await expect(userCard).toBeVisible()
    await userCard.getByRole('button', { name: 'View' }).click()
    
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await page.getByRole('button', { name: 'Delete User', exact: true }).click()
    await expect(userCard).not.toBeVisible()
  })
})
