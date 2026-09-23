import { expect, test } from '@playwright/test'
import { TestRepositoryPage } from '../pages/TestRepositoryPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Test Case Folder Tree Hierarchy & Deletions', () => {
  let testRepositoryPage: TestRepositoryPage

  test.beforeEach(async ({ page }) => {
    testRepositoryPage = new TestRepositoryPage(page, PROJECT_KEY, BASE_URL)
  })

  test('TCF-004 / TCF-005: Create folder/suite, add child test case, verify expand/collapse and cascading deletion rules', async ({ page }) => {
    // 1. Navigate to Test Cases page
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases`)
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first()).toBeVisible({ timeout: 35_000 })

    // Click 'All Test Cases' view in the tree to display the test cases table and show the primary action buttons
    await page.getByText('All Test Cases').first().click()
    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeVisible({ timeout: 15_000 })

    const uniqueId = Date.now()
    const suiteName = `Temp Suite ${uniqueId}`
    const childCaseName = `Suite Child Case ${uniqueId}`

    // 2. Open actions dropdown and select "Create new Test Suite"
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Suite' }).click()
    await expect(page.getByRole('heading', { name: 'Create Test Suite' })).toBeVisible({ timeout: 10_000 })

    // Fill details
    await testRepositoryPage.suiteNameInput.fill(suiteName)
    await testRepositoryPage.createSuiteButton.click()

    // Verify folder/suite node is created in the sidebar tree (under virtual repo root)
    const repoHeader = page.locator('span.flex-1.font-semibold.truncate').first()
    await expect(repoHeader).toBeVisible()
    
    // Ensure the virtual repository root tree is expanded (click it only if collapsed / showing ChevronRight)
    const chevronRight = page.locator('div.flex.items-center.gap-2').filter({ hasText: 'Repo' }).locator('svg.lucide-chevron-right').first()
    if (await chevronRight.isVisible()) {
      await repoHeader.click()
    }

    // Now it must be visible in the tree
    const suiteNode = page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName }).first()
    await expect(suiteNode).toBeVisible({ timeout: 15_000 })

    // 3. Click the suite node to select it
    await suiteNode.click()

    // Wait for the right-side view to load the suite details and URL to update
    await expect(page.getByRole('heading', { name: 'No suite selected' })).not.toBeVisible({ timeout: 10_000 })
    await page.waitForURL(/.*suiteId=.*/, { timeout: 10_000 })

    // 4. Create a child test case under this selected suite
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Case' }).click()
    await expect(testRepositoryPage.headingCreateNewTestCase).toBeVisible({ timeout: 15_000 })

    // Assert that suiteId select input is pre-populated with our suite name
    const selectedSuiteText = await testRepositoryPage.suiteSelect.locator('option:checked').textContent()
    expect(selectedSuiteText).toContain(suiteName)

    // Fill test case name and create
    await testRepositoryPage.titleInput.fill(childCaseName)
    await testRepositoryPage.createTestCaseButton.click()

    // Verify redirected back and child case is listed
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first()).toBeVisible({ timeout: 25_000 })
    
    // Re-select the suite node to display its test cases (since navigation to /create and back reset selection)
    await suiteNode.click()
    await expect(page.locator('tbody').getByText(childCaseName)).toBeVisible({ timeout: 15_000 })

    // 5. Verify folder tree expand/collapse toggle
    const suiteRow = page.locator('div.flex.items-center.gap-2').filter({ hasText: suiteName }).first()
    const chevronBtn = suiteRow.locator('button').first()
    await expect(chevronBtn).toBeVisible()
    
    // Collapse folder
    await chevronBtn.click()
    await expect(page.locator('div.pl-4').getByText(childCaseName)).not.toBeVisible({ timeout: 10_000 })

    // Expand folder
    await chevronBtn.click()
    
    // Dialog scoped to the container with "Confirm Delete" rather than the bare
    // `.fixed.z-50` class combo — that also matches other, unrelated
    // fixed-position elements on the page (several even at baseline), which
    // can resolve to the wrong container and silently miss the actual button.
    const deleteDialog = page.locator('.fixed.z-50').filter({ hasText: 'Confirm Delete' })

    // 6. Attempt to delete the suite while it still contains the child case.
    // The backend intentionally blocks this ("Cannot delete suite that
    // contains child suites or test cases") rather than silently orphaning
    // the case — verify that safety guard surfaces as an error toast and
    // leaves both the suite and the case intact.
    await suiteNode.hover()
    await suiteRow.getByTitle('Delete suite').click()
    await expect(deleteDialog.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible({ timeout: 10_000 })
    await deleteDialog.getByRole('button', { name: 'Confirm', exact: true }).click()

    await expect(page.getByText('Failed to delete suite')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName })).toBeVisible()
    await expect(page.locator('tbody').getByText(childCaseName)).toBeVisible()

    // 7. Remove the case from the suite so it's empty, then delete now succeeds.
    const caseRow = page.locator('tbody tr').filter({ hasText: childCaseName }).first()
    await caseRow.getByTitle('Delete test case').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.locator('tbody').getByText(childCaseName)).not.toBeVisible({ timeout: 10_000 })

    await suiteNode.hover()
    await suiteRow.getByTitle('Delete suite').click()
    await expect(deleteDialog.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible({ timeout: 10_000 })
    await deleteDialog.getByRole('button', { name: 'Confirm', exact: true }).click()

    // Verify the now-empty suite is deleted from the tree list
    await expect(page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName })).not.toBeVisible({ timeout: 15_000 })
  })
})
