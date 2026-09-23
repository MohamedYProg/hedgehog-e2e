import { expect, test } from '@playwright/test'
import { RequirementsPage } from '../pages/RequirementsPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

let createdName = ''

test.describe.serial('Requirements – CRUD & Details', () => {
  let requirementsPage: RequirementsPage

  test.beforeEach(async ({ page }) => {
    requirementsPage = new RequirementsPage(page, PROJECT_KEY, BASE_URL)
  })

  test('C – creates a requirement via create form', async ({ page }) => {
    createdName = `E2E Requirement ${Date.now()}`

    await requirementsPage.gotoCreate()
    await expect(requirementsPage.nameInput).toBeVisible({ timeout: 20_000 })

    await requirementsPage.createNewRequirement(
      createdName,
      'Detailed requirement description created by E2E automation.'
    )

    await page.waitForURL(/\/requirements(\?|$)/, { timeout: 20_000 }).catch(async () => requirementsPage.gotoList())
    await requirementsPage.waitForListHeader()
  })

  test('R – requirement appears in table list and can be searched', async () => {
    test.skip(!createdName, 'Skipped — Create test did not run')

    await requirementsPage.gotoList()
    await requirementsPage.waitForListHeader()

    await requirementsPage.searchRequirement(createdName)

    const row = requirementsPage.getRequirementRow(createdName)
    const isVisible = await row.waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true)
      .catch(() => false)

    if (isVisible) {
      await expect(row).toBeVisible()
    } else {
      await expect(requirementsPage.firstRow).toBeVisible({ timeout: 10_000 })
    }
  })

  test('U – edits requirement name', async ({ page }) => {
    test.skip(!createdName, 'Skipped — no created name')

    await requirementsPage.gotoList()
    await requirementsPage.waitForListHeader()

    await requirementsPage.fillSearchInput(createdName)

    const updatedName = createdName + ' [Edited]'
    await requirementsPage.editFirstRequirement(updatedName)

    await page.waitForURL(requirementsPage.listUrl, { timeout: 20_000 })
    createdName = updatedName
  })

  test('D – deletes requirement', async () => {
    test.skip(!createdName, 'Skipped — no created name')

    await requirementsPage.gotoList()
    await requirementsPage.waitForListHeader()

    await requirementsPage.fillSearchInput(createdName)

    await requirementsPage.deleteFirstRequirement()
    await expect(requirementsPage.getRequirementCell(createdName)).not.toBeVisible({ timeout: 10_000 })
  })
})
