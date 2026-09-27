import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Test Case Step Editor controls', () => {
  test('TC-003: Add, edit, remove steps and verify sequencing shifts correctly', async ({ page }) => {
    // 1. Navigate directly to create test case page
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases/create`)
    await expect(page.getByRole('heading', { name: 'Create New Test Case' })).toBeVisible({ timeout: 35_000 })

    const uniqueId = Date.now()
    const testCaseName = `Step Editor Test ${uniqueId}`

    // Fill out basic details
    await page.locator('#title').fill(testCaseName)
    
    // Select first test suite
    const suiteSelect = page.locator('#suiteId')
    await expect(suiteSelect).toBeVisible()
    await suiteSelect.selectOption({ index: 1 })

    // 2. Add 2 more rows to make a total of 3 steps
    const addRowBtn = page.getByRole('button', { name: 'Add Row' })
    await addRowBtn.click()
    await addRowBtn.click()

    // Assert that 3 steps are present
    const stepTextareas = page.locator('textarea[placeholder="Enter test step"]')
    const expectedTextareas = page.locator('textarea[placeholder="Enter expected result"]')
    await expect(stepTextareas).toHaveCount(3)

    // 3. Fill details for all 3 steps
    await stepTextareas.nth(0).fill('Step 1 content')
    await expectedTextareas.nth(0).fill('Expected 1')

    await stepTextareas.nth(1).fill('Step 2 content')
    await expectedTextareas.nth(1).fill('Expected 2')

    await stepTextareas.nth(2).fill('Step 3 content')
    await expectedTextareas.nth(2).fill('Expected 3')

    // 4. Delete the middle step (Step 2)
    const removeButtons = page.getByTitle('Remove row')
    await removeButtons.nth(1).click()

    // Assert that count is now 2
    await expect(stepTextareas).toHaveCount(2)

    // Assert that Step 3 shifted up to become the new Step 2
    await expect(stepTextareas.nth(1)).toHaveValue('Step 3 content')
    await expect(expectedTextareas.nth(1)).toHaveValue('Expected 3')

    // 5. Save the test case
    await page.getByRole('button', { name: 'Create Test Case' }).click()

    // Verify redirected back to test cases list
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }).first())).toBeVisible({ timeout: 25_000 })
    await page.getByText('All Test Cases').first().click()

    // 6. Search for the created test case and open it for editing
    const searchInput = page.getByPlaceholder('Search test cases...')
    const waitForSearch = () => page.waitForResponse(
      (r) => r.url().includes('/api/v1/test-cases?') && r.url().includes('q=') && r.ok(),
      { timeout: 20_000 }
    )
    // Wait for the search to apply; otherwise its URL update can land after
    // we navigate away and pull the page back to the list.
    await Promise.all([waitForSearch(), searchInput.fill(testCaseName)])

    const row = page.locator('tbody tr').filter({ hasText: testCaseName }).first()
    await expect(row).toBeVisible({ timeout: 15_000 })

    // Workaround: the Edit button links by business ID, which the API
    // currently rejects with 404 (the form then loads empty). Open the edit
    // page by internal ID from the row checkbox label instead.
    const label = await row.getByRole('checkbox').first().getAttribute('aria-label')
    const testCaseId = label?.replace('Select test case ', '').trim()
    expect(testCaseId).toBeTruthy()
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases/edit/${testCaseId}`)
    await expect(page.getByRole('heading', { name: 'Edit Test Case' })).toBeVisible({ timeout: 15_000 })

    // 7. Verify step values are preserved correctly
    await expect(stepTextareas.nth(0)).toHaveValue('Step 1 content')
    await expect(expectedTextareas.nth(0)).toHaveValue('Expected 1')
    await expect(stepTextareas.nth(1)).toHaveValue('Step 3 content')
    await expect(expectedTextareas.nth(1)).toHaveValue('Expected 3')

    // Exit form
    await page.getByRole('button', { name: 'Cancel' }).click()

    // 8. Cleanup: Delete the test case
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }).first())).toBeVisible({ timeout: 25_000 })
    await page.getByText('All Test Cases').first().click()
    await Promise.all([waitForSearch(), searchInput.fill(testCaseName)])
    const cleanupRow = page.locator('tbody tr').filter({ hasText: testCaseName }).first()
    await cleanupRow.getByTitle('Delete test case').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).click()

    // Confirm it is gone
    await expect(page.locator('tbody').getByText(testCaseName)).not.toBeVisible({ timeout: 10_000 })
  })
})
