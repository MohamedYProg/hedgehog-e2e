import { expect, test } from '@playwright/test'
import { ModulesPage } from '../pages/ModulesPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Project Hierarchy Constraints', () => {
  let modulesPage: ModulesPage

  test.beforeEach(async ({ page }) => {
    modulesPage = new ModulesPage(page, PROJECT_KEY, BASE_URL)
  })

  test('CMP-004: Attempting to assign parent to own child or itself is blocked', async ({ page }) => {
    await modulesPage.goto()
    await expect(modulesPage.headingModules).toBeVisible({ timeout: 35_000 })

    const uniqueId = Date.now()
    const parentModuleName = `Parent Module ${uniqueId}`
    const childModuleName = `Child Module ${uniqueId}`

    // 2. Create Parent Module
    await modulesPage.createNewModule(parentModuleName)

    // Assert success toast
    await expect(modulesPage.successToast).toBeVisible({ timeout: 10_000 })
    await expect(modulesPage.successToast).not.toBeVisible({ timeout: 10_000 }) // Let toast clear

    // 3. Create Child Module and select Parent Module as its parent
    await modulesPage.createNewModule(childModuleName, '', parentModuleName)

    // Assert success toast
    await expect(modulesPage.successToast).toBeVisible({ timeout: 10_000 })
    await expect(modulesPage.successToast).not.toBeVisible({ timeout: 10_000 }) // Let toast clear

    // 4. Edit Parent Module and assert child / itself are excluded from the parent selection list
    await page.getByRole('button', { name: 'Module Name' }).first().click()
    await modulesPage.searchModule(parentModuleName)

    const row = modulesPage.getModuleRow(parentModuleName)
    await expect(row).toBeVisible({ timeout: 15_000 })
    await modulesPage.editIcon.click()
    await expect(page.getByRole('heading', { name: 'Edit Module' })).toBeVisible({ timeout: 10_000 })

    // Fetch option contents inside #editParentId select element
    await expect(modulesPage.editParentSelect).toBeVisible()

    // Wait for the async options filtering to complete
    const parentOption = modulesPage.editParentSelect.locator('option').filter({ hasText: parentModuleName })
    await expect(parentOption).toHaveCount(0, { timeout: 15_000 })

    const options = modulesPage.editParentSelect.locator('option')
    const optionTexts = await options.allTextContents()

    // Assert cycle prevention rules:
    // - The parent module itself cannot be selected as parent
    // - The parent module's child module cannot be selected as parent
    for (const text of optionTexts) {
      const trimmed = text.trim()
      expect(trimmed).not.toEqual(parentModuleName)
      expect(trimmed).not.toEqual(childModuleName)
    }

    // Cancel edit modal
    await modulesPage.cancelBtn.click()

    // 5. Cleanup: Delete both modules (Delete child first to avoid cascading prompts)
    // Delete Child
    await modulesPage.deleteModule(childModuleName)

    // Wait for delete success toast
    await expect(modulesPage.successToast).toBeVisible({ timeout: 10_000 })
    await expect(modulesPage.successToast).not.toBeVisible({ timeout: 10_000 })

    // Delete Parent
    await modulesPage.deleteModule(parentModuleName)

    // Wait for delete success toast
    await expect(modulesPage.successToast).toBeVisible({ timeout: 10_000 })
  })
})
