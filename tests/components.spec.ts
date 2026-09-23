import { expect, test } from '@playwright/test'
import { ModulesPage } from '../pages/ModulesPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

let createdName = ''

test.describe.serial('Components (Modules) – CRUD', () => {
  let modulesPage: ModulesPage

  test.beforeEach(async ({ page }) => {
    modulesPage = new ModulesPage(page, PROJECT_KEY, BASE_URL)
  })

  test('C – creates a module via the New Module modal', async () => {
    createdName = `E2E Module ${Date.now()}`

    await modulesPage.goto()
    await modulesPage.waitForList()

    await modulesPage.createNewModule(createdName, 'Created by Playwright E2E test')

    // Wait for modal to close, then search to confirm the item exists in the list
    await expect(modulesPage.nameInput).not.toBeVisible({ timeout: 10_000 })
    await modulesPage.searchModule(createdName)
    await expect(modulesPage.getModuleCell(createdName)).toBeVisible({ timeout: 10_000 })
  })

  test('R – module appears in the list', async () => {
    test.skip(!createdName, 'Skipped — Create test did not produce a name')

    await modulesPage.goto()
    await modulesPage.waitForList()

    await modulesPage.searchModule(createdName)
    await expect(modulesPage.getModuleCell(createdName)).toBeVisible({ timeout: 10_000 })
  })

  test('U – edits the module name via the Edit modal', async () => {
    test.skip(!createdName, 'Skipped — no created name')

    await modulesPage.goto()
    await modulesPage.waitForList()

    await modulesPage.searchModule(createdName)

    // Edit the module
    const updatedName = createdName + ' [edited]'
    await modulesPage.editFirstModuleName(updatedName)

    // Modal closes; verify updated name appears in the table
    await expect(modulesPage.getModuleCell(updatedName)).toBeVisible({ timeout: 10_000 })

    createdName = updatedName
  })

  test('D – deletes the module via the Delete modal', async () => {
    test.skip(!createdName, 'Skipped — no created name')

    await modulesPage.goto()
    await modulesPage.waitForList()

    await modulesPage.searchModule(createdName)

    await modulesPage.deleteFirstModule()

    await expect(modulesPage.getModuleCell(createdName)).not.toBeVisible({ timeout: 10_000 })
  })
})
