import { expect, test } from '@playwright/test'
import { SettingsPage } from '../pages/SettingsPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

test.describe.serial('Admin Settings – Statuses & Custom Fields', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page, BASE_URL)
  })

  test('navigates to Settings page and verifies tabs', async () => {
    await settingsPage.gotoAdminSettings()

    // Verify Settings page loads and shows tabs
    await expect(settingsPage.statusConfigTab).toBeVisible({ timeout: 30_000 })
    await expect(settingsPage.workflowEditorTab).toBeVisible()
    await expect(settingsPage.customFieldsTab).toBeVisible()
  })

  test('Status Configuration - adds and deletes a custom status', async ({ page }) => {
    const statusSuffix = Date.now()
    const statusName = `E2E_STATUS_${statusSuffix}`
    const statusDisplayName = `E2E Status ${statusSuffix}`

    await settingsPage.gotoAdminSettings()
    await expect(settingsPage.statusConfigTab).toBeVisible({ timeout: 20_000 })

    // Create custom status
    await settingsPage.addCustomStatus(statusName, statusDisplayName, 'in_progress')

    // Confirm it's added
    await expect(page.getByText(statusDisplayName)).toBeVisible({ timeout: 10_000 })

    // Delete the status
    await settingsPage.deleteCustomStatus(statusDisplayName)

    // Verify it is removed
    await expect(page.getByText(statusDisplayName)).not.toBeVisible({ timeout: 10_000 })
  })

  test('Custom Fields - adds and verifies a custom field', async ({ page }) => {
    const fieldSuffix = Date.now()
    const fieldName = `E2E_Field_${fieldSuffix}`
    const fieldDesc = 'Created by Playwright E2E test'

    await settingsPage.gotoAdminSettings()
    
    // Create Custom Field
    await settingsPage.addCustomField(fieldName, 'URL', fieldDesc)

    // Verify the field exists in the list
    await expect(page.locator('tbody').getByText(fieldName)).toBeVisible({ timeout: 10_000 })

    // Clean up: delete custom field
    await settingsPage.deleteCustomField(fieldName)

    // Verify it is removed
    await expect(page.locator('tbody').getByText(fieldName)).not.toBeVisible({ timeout: 10_000 })
  })
})
