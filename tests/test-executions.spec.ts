import { expect, test } from '@playwright/test'
import { TestLabPage } from '../pages/TestLabPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe.serial('Test Lab & Executions – E2E Workflow', () => {
  let testLabPage: TestLabPage

  test.beforeEach(async ({ page }) => {
    testLabPage = new TestLabPage(page, PROJECT_KEY, BASE_URL)
  })

  test('opens Test Lab page and displays test runs table or tree', async ({ page }) => {
    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    await expect(page).toHaveURL(new RegExp(`/app/${PROJECT_KEY}/test-lab`))
  })

  test('can search test runs', async () => {
    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    if (await testLabPage.searchRunsInput.isVisible().catch(() => false)) {
      await testLabPage.searchRuns('E2E')
    }
  })

  test('opens detail view of first test run if available', async ({ page }) => {
    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    const firstRunBtn = page.locator('tbody tr td button').first()
    if (await firstRunBtn.isVisible().catch(() => false)) {
      await firstRunBtn.click()
      await page.waitForTimeout(1000)
    }
  })
})
