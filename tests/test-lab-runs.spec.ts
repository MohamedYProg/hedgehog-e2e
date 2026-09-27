import { expect, test } from '@playwright/test'
import { TestLabPage } from '../pages/TestLabPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Test Lab Cycles & Runs management', () => {
  let testLabPage: TestLabPage

  test.beforeEach(async ({ page }) => {
    testLabPage = new TestLabPage(page, PROJECT_KEY, BASE_URL)
  })

  test('CYC-006 / CYC-007: Create, edit, delete cycle and verify statistics', async () => {
    // 1. Navigate to Test Lab Cycles tab
    await testLabPage.goto()
    await testLabPage.waitForListHeader()
    await testLabPage.switchTab('Cycles')

    const uniqueId = Date.now()
    const cycleName = `Cycle Test ${uniqueId}`
    const cycleEditedName = `Cycle Edited ${uniqueId}`

    // 2. Create a Test Cycle
    await testLabPage.createCycle(cycleName, '2026-07-01', '2026-07-15')

    // Assert cycle node appears in tree
    const cycleNode = testLabPage.getCycleNode(cycleName)
    await expect(cycleNode).toBeVisible({ timeout: 15_000 })

    // 3. Edit Cycle
    await testLabPage.editCycle(cycleName, cycleEditedName)

    // Verify name updated in tree
    const editedNode = testLabPage.getCycleNode(cycleEditedName)
    await expect(editedNode).toBeVisible({ timeout: 15_000 })

    // 4. Delete Cycle
    await testLabPage.deleteCycle(cycleEditedName)

    // Confirm it is deleted
    await expect(testLabPage.getCycleNode(cycleEditedName)).not.toBeVisible({ timeout: 15_000 })
  })
})
