import { expect, test } from '@playwright/test'
import { TestLabPage } from '../pages/TestLabPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe.serial('Test Lab – Environments & Cycles Tree', () => {
  let testLabPage: TestLabPage

  test.beforeEach(async ({ page }) => {
    testLabPage = new TestLabPage(page, PROJECT_KEY, BASE_URL)
  })

  test('Test Environments - creates and deletes an environment', async ({ page }) => {
    const envSuffix = Date.now()
    const envName = `E2E_Env_${envSuffix}`
    const envDesc = 'Created by Playwright E2E automation.'

    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    // Switch to Environments tab
    await testLabPage.switchTab('Environments')
    await expect(page.getByRole('heading', { name: 'Test Environments' })).toBeVisible({ timeout: 10_000 })

    // Create environment
    await testLabPage.createEnvironment(envName, envDesc)

    // Verify it is created
    await expect(page.getByText(envName)).toBeVisible({ timeout: 15_000 })

    // Clean up: delete environment
    await testLabPage.deleteEnvironment(envName)

    // Verify it is removed
    await expect(page.getByText(envName)).not.toBeVisible({ timeout: 10_000 })
  })

  test('Test Cycles - creates, views and deletes a cycle in the tree', async ({ page }) => {
    const cycleSuffix = Date.now()
    const cycleName = `E2E_Cycle_${cycleSuffix}`
    const cycleDesc = 'Cycle description created by Playwright E2E.'
    
    // Dates formatted as YYYY-MM-DD
    const today = new Date()
    const startDateVal = today.toISOString().split('T')[0]
    const nextMonth = new Date()
    nextMonth.setMonth(today.getMonth() + 1)
    const endDateVal = nextMonth.toISOString().split('T')[0]

    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    // Switch to Cycles tab
    await testLabPage.switchTab('Cycles')
    await expect(page.getByText('Select a cycle or run')).toBeVisible({ timeout: 15_000 })

    // Create cycle
    await testLabPage.createCycle(cycleName, startDateVal, endDateVal, cycleDesc)

    // Verify cycle appears in the left tree
    const cycleNode = testLabPage.getCycleNode(cycleName)
    await expect(cycleNode).toBeVisible({ timeout: 15_000 })

    // Select the cycle in the tree
    await cycleNode.click()

    // Verify cycle detail panel loads in the right
    await expect(page.locator('h1').getByText(cycleName)).toBeVisible({ timeout: 15_000 })

    // Clean up: delete the cycle node
    await testLabPage.deleteCycle(cycleName)

    // Verify it is removed from the tree
    await expect(testLabPage.getCycleNode(cycleName)).not.toBeVisible({ timeout: 10_000 })
  })
})
