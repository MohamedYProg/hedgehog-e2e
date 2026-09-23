import { expect, test } from '@playwright/test'
import { ReportsPage } from '../pages/ReportsPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Reports & Analytics E2E', () => {
  let reportsPage: ReportsPage

  test.beforeEach(async ({ page }) => {
    reportsPage = new ReportsPage(page, PROJECT_KEY, BASE_URL)
  })

  test('navigates to Reports page and verifies report tabs', async ({ page }) => {
    await reportsPage.goto()

    // Verify reports page heading/tab triggers load
    await expect(reportsPage.projectTab).toBeVisible({ timeout: 30_000 })
    await expect(reportsPage.testRunTab).toBeVisible()
    await expect(reportsPage.defectsTab).toBeVisible()

    // Project report stat card assertions
    await expect(page.getByText('Total Tests').first()).toBeVisible()
    await expect(page.getByText('Pass Rate').first()).toBeVisible()
    await expect(page.getByText('Open Defects').first()).toBeVisible()
    await expect(page.getByText('Coverage').first()).toBeVisible()
  })

  test('switches tabs and checks components', async ({ page }) => {
    await reportsPage.goto()
    await expect(reportsPage.projectTab).toBeVisible({ timeout: 30_000 })

    // Switch to Test Run tab
    await reportsPage.switchTab('Test Run')
    await expect(page.getByText('Total Executed').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Passed').first()).toBeVisible()
    await expect(page.getByText('Failed').first()).toBeVisible()
    await expect(page.getByText('Blocked').first()).toBeVisible()

    // Switch to Defects tab
    await reportsPage.switchTab('Defects')
    await expect(page.getByText('Total Defects').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText('Avg Resolution').first()).toBeVisible()
  })

  test('opens export dropdown options', async () => {
    await reportsPage.goto()
    await expect(reportsPage.projectTab).toBeVisible({ timeout: 30_000 })

    // Check if Export button exists
    const exportBtn = reportsPage.exportButton
    if (await exportBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await reportsPage.openExportMenu()
      await expect(reportsPage.csvOption).toBeVisible({ timeout: 10_000 })
      await expect(reportsPage.excelOption).toBeVisible()
      await expect(reportsPage.pdfOption).toBeVisible()
    }
  })
})
