import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('UX & Non-Functional Requirements (NFR)', () => {
  test('NFR-004: Navigating to an invalid route renders a Page Not Found page', async ({ page }) => {
    // Navigate to a non-existent URL route outside the app catch-all prefix
    await page.goto(`${BASE_URL}/non-existent-page-url-12345`)
    
    // Assert that the catch-all router gracefully shows the custom 404 page
    await expect(page.getByText('Page Not Found').first()).toBeVisible({ timeout: 15_000 })
  })

  test('NFR-003: Submitting an action triggers toast notification feedback', async ({ page }) => {
    // Navigate to components/modules list view (resolved as /modules)
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/modules`)
    await expect(page.getByRole('heading', { name: 'Modules' })).toBeVisible({ timeout: 20_000 })

    // Open create module dialog
    await page.getByRole('button', { name: 'Create Module' }).click()
    await expect(page.getByRole('heading', { name: 'Create New Module' })).toBeVisible({ timeout: 10_000 })

    const tempName = `Toast Test Module ${Date.now()}`
    await page.locator('input[placeholder="Module name"]').fill(tempName)

    // Submit using the last matching Create Module button (resolves strict mode conflict)
    await page.getByRole('button', { name: 'Create Module', exact: true }).last().click()

    // Assert that a success toast popup is visible in the viewport
    const toast = page.locator('[role="status"]').or(page.locator('div:has-text("successfully")')).first()
    await expect(toast).toBeVisible({ timeout: 10_000 })

    // Clean up
    await page.getByPlaceholder('Search modules...').fill(tempName)
    await page.waitForTimeout(600)
    await page.locator('tbody tr').first().getByTitle('Delete module').click()
    await page.getByRole('button', { name: 'Delete Module', exact: true }).last().click()
  })

  test('ENV-002: Deactivated environment is hidden from test run creation dropdown', async ({ page }) => {
    // Navigate to test lab environments tab
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab?tab=environments`)
    await expect(page.getByRole('heading', { name: 'Test Environments' })).toBeVisible({ timeout: 35_000 })

    // 1. Create a deactivated environment
    const uniqueId = Date.now()
    const envName = `Deactivated Env ${uniqueId}`
    await page.getByRole('button', { name: 'New Environment' }).click()
    await expect(page.getByRole('heading', { name: 'Create Environment' })).toBeVisible({ timeout: 10_000 })

    await page.locator('#name').fill(envName)
    await page.locator('#isActive').uncheck() // Set Active to false
    await page.getByRole('button', { name: 'Create', exact: true }).click()

    // Wait for environment to appear in the list
    await expect(page.getByText(envName)).toBeVisible({ timeout: 15_000 })

    // 2. Navigate to test run creation page
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab/runs-create`)
    await expect(page.getByRole('heading', { name: 'Create Test Run' })).toBeVisible({ timeout: 20_000 })

    // Click on environment select trigger
    await page.locator('#environment').click()

    // Assert that the deactivated environment is NOT listed in the options list
    await expect(page.getByRole('option', { name: envName })).not.toBeVisible({ timeout: 5000 })

    // Escape/close options list by pressing Escape key
    await page.keyboard.press('Escape')

    // 3. Activate the environment and verify it is visible
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab?tab=environments`)
    await expect(page.getByRole('heading', { name: 'Test Environments' })).toBeVisible({ timeout: 20_000 })

    // Locate the toggle row and click Activate
    const envRow = page.locator('.card-hover').filter({ hasText: envName }).first()
    await envRow.getByTitle('Activate').click()

    // Confirm it is active by checking for the Deactivate button
    await expect(envRow.getByTitle('Deactivate')).toBeVisible({ timeout: 10_000 })

    // Navigate back to run creation page
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab/runs-create`)
    await expect(page.getByRole('heading', { name: 'Create Test Run' })).toBeVisible({ timeout: 20_000 })

    // Click on environment select trigger
    await page.locator('#environment').click()

    // Assert that the activated environment is now visible
    await expect(page.getByRole('option', { name: envName })).toBeVisible({ timeout: 10_000 })

    // Escape/close options list by pressing Escape key
    await page.keyboard.press('Escape')

    // 4. Cleanup: Delete the environment
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab?tab=environments`)
    await expect(page.getByRole('heading', { name: 'Test Environments' })).toBeVisible({ timeout: 20_000 })
    const cleanupRow = page.locator('.card-hover').filter({ hasText: envName }).first()
    await cleanupRow.locator('.text-red-600').click() // trash icon
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    await expect(page.getByText(envName)).not.toBeVisible({ timeout: 10_000 })
  })

  test('TC-020: Deep-linking creating test case pre-fills with suite parameter', async ({ page }) => {
    // Start listening for the test suite fetch response before navigating to read a real suite ID
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/test-suites') && response.status() === 200
    )

    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases`)
    const response = await responsePromise
    const json = await response.json()
    
    // Extract first suite object
    const suites = json.testSuites || json.data?.testSuites || []
    expect(suites.length).toBeGreaterThan(0)
    const targetSuite = suites[0]
    
    // Deep-link navigate to create test case page with suite ID parameter
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases/create?suite=${targetSuite.id}`)
    await expect(page.getByRole('heading', { name: 'Create New Test Case' })).toBeVisible({ timeout: 20_000 })

    // Verify that the suite select input has been pre-filled with target suite ID
    const suiteSelect = page.locator('#suiteId')
    await expect(suiteSelect).toHaveValue(targetSuite.id)
  })
})
