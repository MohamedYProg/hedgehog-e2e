import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { loginAs, projectUrl } from '../helpers/auth'

// Helper to navigate and select All Test Cases so the table and headers render
async function navigateToTestCasesAndSelectAll(page: Page, role: string) {
  await loginAs(page, role)
  await page.goto(projectUrl('test-cases'))
  const allTestCasesRow = page.getByText('All Test Cases').first()
  await expect(allTestCasesRow).toBeVisible({ timeout: 20_000 })
  await allTestCasesRow.click()
}

// ============================================================================
// Section 3: Test Cases Module (Scenarios 12-15)
// ============================================================================

test.describe('Test Cases Module - Permissions', () => {
  // Scenario 12: QA Tester can create test cases
  test('S12 - QA Tester sees create actions in test cases', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'qa_tester')

    // QA Tester has test-cases.create — the create dropdown trigger is visible.
    await expect(page.getByRole('button', { name: /^Create$/i })).toBeVisible({ timeout: 15_000 })
  })

  // Scenario 13: Viewer cannot create test cases
  test('S13 - Viewer cannot see create actions in test cases', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'viewer')

    // Assert the CREATE TRIGGER button is absent
    await expect(page.getByRole('button', { name: /^Create$/i })).toHaveCount(0)
  })

  // Scenario 14: Developer has read-only access to test cases
  test('S14 - Developer has read-only test case access', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'developer')

    // Developer has only test-cases.read — the create trigger must be absent.
    await expect(page.getByRole('button', { name: /^Create$/i })).toHaveCount(0)
  })

  // Scenario 15: QA Lead can delete test cases (has test-cases.delete)
  test('S15 - QA Lead sees create actions in test cases', async ({ page }) => {
    await navigateToTestCasesAndSelectAll(page, 'qa_lead')

    // QA Lead has test-cases.create, .update, .delete — the create trigger is visible.
    await expect(page.getByRole('button', { name: /^Create$/i })).toBeVisible({ timeout: 15_000 })
  })
})
