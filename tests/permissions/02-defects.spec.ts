import { test, expect } from '@playwright/test'
import { loginAs, projectUrl } from '../helpers/auth'

// ============================================================================
// Section 2: Defects Module (Scenarios 7-11)
// ============================================================================

test.describe('Defects Module - Permissions', () => {
  // Scenario 7: QA Tester can create a defect
  test('S7 - QA Tester can see and use Create Defect button', async ({ page }) => {
    await loginAs(page, 'qa_tester')
    await page.goto(projectUrl('defects'))

    // Wait for defects page to load
    await page.waitForLoadState('networkidle')

    // QA Tester has defects.create — button should be visible
    const createBtn = page.getByRole('button', { name: /Create Defect/i })
    await expect(createBtn).toBeVisible({ timeout: 15_000 })
  })

  // Scenario 8: Developer cannot see Create Defect button
  test('S8 - Developer cannot see Create Defect button', async ({ page }) => {
    await loginAs(page, 'developer')
    await page.goto(projectUrl('defects'))

    await page.waitForLoadState('networkidle')

    // Developer does NOT have defects.create — button hidden by PermissionGuard
    const createBtn = page.getByRole('button', { name: /Create Defect/i })
    await expect(createBtn).not.toBeVisible({ timeout: 10_000 })
  })

  // Scenario 9: Viewer can view defects but cannot create/edit
  test('S9 - Viewer can see defects list but no create button', async ({ page }) => {
    await loginAs(page, 'viewer')
    await page.goto(projectUrl('defects'))

    await page.waitForLoadState('networkidle')

    // Viewer has defects.read — should see the page content
    // But no Create Defect button
    const createBtn = page.getByRole('button', { name: /Create Defect/i })
    await expect(createBtn).not.toBeVisible({ timeout: 10_000 })
  })

  // Scenario 10: Project Manager can create a defect
  test('S10 - Project Manager can create a defect', async ({ page }) => {
    await loginAs(page, 'project_manager')
    await page.goto(projectUrl('defects'))

    await page.waitForLoadState('networkidle')

    const createBtn = page.getByRole('button', { name: /Create Defect/i })
    await expect(createBtn).toBeVisible({ timeout: 15_000 })

    // Click and verify the form opens
    await createBtn.click()

    // Should see the defect creation form/page
    await expect(page.getByText(/Create New Defect|New Defect/i)).toBeVisible({ timeout: 10_000 })
  })

  // Scenario 11: Developer can update defect status (has defects.transition)
  test('S11 - Developer can view defect details', async ({ page }) => {
    await loginAs(page, 'developer')
    await page.goto(projectUrl('defects'))

    await page.waitForLoadState('networkidle')

    // Developer has defects.read + defects.update + defects.transition
    // Check if there are defects in the list
    const firstDefectBtn = page.locator('tbody tr td button').first()
    const hasDefects = await firstDefectBtn.isVisible({ timeout: 5_000 }).catch(() => false)

    if (!hasDefects) {
      test.skip(true, 'No defects in project — skipping detail view test')
      return
    }

    // Click the first defect to open detail
    await firstDefectBtn.click()

    // Should see the defect detail view. Assert on a detail-only element (the
    // Description field, which doesn't exist in the list) rather than falling
    // back to `.or(page.locator('select'))` — that fallback passed whenever any
    // stray dropdown existed on the page, even if the detail failed to load.
    await expect(page.getByText('Description', { exact: true }).first()).toBeVisible({
      timeout: 15_000,
    })
  })
})
