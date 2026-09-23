import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs, adminUrl, BASE_URL } from '../helpers/auth'

async function navigateToRolesAndSetPageSize(page: Page, role: 'admin' | 'viewer' = 'admin') {
  await loginAs(page, role)

  const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
  const res = await page.request.get(`${BASE_URL}/api/v1/roles?limit=100`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (res.status() === 200) {
    const data = await res.json()
    const rolesList = Array.isArray(data) ? data : data.data?.roles || []
    for (const r of rolesList) {
      if (r.name.startsWith('E2E Test Role')) {
        await page.request.delete(`${BASE_URL}/api/v1/roles/${r.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      }
    }
  }

  await page.goto(adminUrl('user-management'))

  const rolesTab = page.getByRole('button', { name: 'Roles', exact: true })
  // Wait for the Roles tab button to be visible (waits for loading spinner to clear)
  await expect(rolesTab).toBeVisible({ timeout: 30_000 })
  await rolesTab.click()

  const pageSizeSelect = page.locator('select').first()
  await expect(pageSizeSelect).toBeVisible({ timeout: 20_000 })
  await pageSizeSelect.selectOption('50')
  await page.waitForTimeout(500)
}

test.describe('Admin Panel - Roles & Permissions', () => {
  // Scenario 1: Admin can view all 6 default roles
  test('S1 - Admin sees all 6 default roles in Roles tab', async ({ page }) => {
    await navigateToRolesAndSetPageSize(page)

    await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 15_000 })

    const expectedRoles = [
      'System Administrator',
      'Project Manager',
      'QA Lead',
      'Developer',
      'QA Tester',
      'Viewer',
    ]
    for (const roleName of expectedRoles) {
      await expect(page.getByText(roleName, { exact: false }).first()).toBeVisible()
    }
  })

  // Scenario 2: Admin can open role detail and see permission categories
  test('S2 - Admin can open role detail and see permissions', async ({ page }) => {
    await navigateToRolesAndSetPageSize(page)
    await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 15_000 })

    // Click the first View button
    await page.getByRole('button', { name: 'View' }).first().click()

    // Wait for modal to load — the modal shows "Permissions" heading and stats
    await expect(page.locator('h3').filter({ hasText: 'Permissions' })).toBeVisible({ timeout: 10_000 })

    // Permission categories should be visible (collapsed headers)
    await expect(page.getByText(/Defect Management|User Management|Project Management/i).first()).toBeVisible({
      timeout: 5_000,
    })
  })

  // Scenario 3: Admin can toggle permissions on a role
  test('S3 - Admin can toggle a permission on/off for a role', async ({ page }) => {
    await navigateToRolesAndSetPageSize(page)
    await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 15_000 })

    // Find the Developer role card and click its View button
    const allViewBtns = page.getByRole('button', { name: 'View' })
    const allH3s = page.locator('h3.font-semibold')
    const count = await allH3s.count()

    let developerIndex = -1
    for (let i = 0; i < count; i++) {
      const text = await allH3s.nth(i).textContent()
      if (text?.trim() === 'Developer') {
        developerIndex = i
        break
      }
    }
    expect(developerIndex).toBeGreaterThanOrEqual(0)
    await allViewBtns.nth(developerIndex).click()

    // Wait for modal to load — categories expand automatically
    await expect(page.locator('h3').filter({ hasText: 'Permissions' })).toBeVisible({ timeout: 10_000 })

    // Permission buttons are already visible (categories expand by default)
    const permButtons = page.locator('button.w-full.flex.items-center.gap-3')
    await expect(permButtons.first()).toBeVisible({ timeout: 10_000 })

    // Get the first permission toggle button (not a category header)
    const permToggle = page.locator('button.text-left').first()
    await expect(permToggle).toBeVisible({ timeout: 5_000 })

    // Check initial state — bg-green-50 means selected
    const initialClasses = await permToggle.getAttribute('class') || ''
    const wasSelected = initialClasses.includes('bg-green-50')

    // Toggle the permission
    await permToggle.click()
    await page.waitForTimeout(500)

    // Verify state changed
    const afterClasses = await permToggle.getAttribute('class') || ''
    const isNowSelected = afterClasses.includes('bg-green-50')
    expect(isNowSelected).not.toBe(wasSelected)

    // Toggle back to restore original state
    await permToggle.click()
  })

  // Scenario 4: Admin can create a new role
  test('S4 - Admin can create a new custom role', async ({ page }) => {
    await navigateToRolesAndSetPageSize(page)
    await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Create Role' }).click()

    const roleName = `E2E Test Role ${Date.now()}`
    await page.getByLabel('Role Name').fill(roleName)
    await page.getByLabel('Description').fill('Created by Playwright E2E permission test')

    await page.getByRole('button', { name: 'Create Role' }).last().click()

    await expect(page.getByText(roleName)).toBeVisible({ timeout: 10_000 })
  })

  // Scenario 5: Viewer cannot see Create Role button
  test('S5 - Viewer cannot see Create Role button', async ({ page }) => {
    await loginAs(page, 'viewer')
    await page.goto(adminUrl('user-management'))

    // Wait for the URL to settle (non-admin viewer gets redirected away from admin pages)
    await page.waitForURL(url => !url.href.includes('/admin/user-management'), { timeout: 15_000 }).catch(() => {})

    const rolesTab = page.getByRole('button', { name: 'Roles', exact: true })
    const hasRolesTab = await rolesTab.isVisible().catch(() => false)

    if (hasRolesTab) {
      await rolesTab.click()
      await expect(page.getByRole('button', { name: 'Create Role' })).not.toBeVisible({ timeout: 5_000 })
    }
  })

  // Scenario 6: System Administrator role has all permissions
  test('S6 - System Administrator has all permissions', async ({ page }) => {
    await navigateToRolesAndSetPageSize(page)
    await expect(page.getByText('System Administrator')).toBeVisible({ timeout: 15_000 })

    // Find System Administrator card and click View
    const allViewBtns = page.getByRole('button', { name: 'View' })
    const allH3s = page.locator('h3.font-semibold')
    const count = await allH3s.count()

    let sysAdminIndex = -1
    for (let i = 0; i < count; i++) {
      const text = await allH3s.nth(i).textContent()
      if (text?.includes('System Administrator')) {
        sysAdminIndex = i
        break
      }
    }
    expect(sysAdminIndex).toBeGreaterThanOrEqual(0)
    await allViewBtns.nth(sysAdminIndex).click()

    // Wait for modal to load and show permission stats
    await expect(page.locator('h3').filter({ hasText: 'Permissions' })).toBeVisible({ timeout: 10_000 })

    // The stats section shows total permission count as a large number
    const permStatCard = page.locator('div.bg-gray-50').filter({ hasText: 'Permissions' })
    const permCount = permStatCard.locator('p.text-2xl').first()
    await expect(permCount).toBeVisible({ timeout: 5_000 })

    const countText = await permCount.textContent()
    const permTotal = parseInt(countText || '0', 10)

    // System Administrator should have all permissions (79+)
    expect(permTotal).toBeGreaterThanOrEqual(79)
  })
})
