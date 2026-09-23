import { test, expect } from '@playwright/test'
import { loginAs, projectUrl, API_URL } from '../helpers/auth'

// ============================================================================
// Section 8: Projects, Requirements & Components (Scenarios 32-35)
// ============================================================================

test.describe('Projects, Requirements & Components - Permissions', () => {
  // Scenario 32: Viewer cannot see "New Requirement" button
  test('S32 - Viewer cannot see New Requirement button', async ({ page }) => {
    await loginAs(page, 'viewer')
    await page.goto(projectUrl('requirements'))

    await page.waitForLoadState('networkidle')

    // Wait for page content to load (some element that proves the page rendered)
    await page.waitForTimeout(5_000)

    // Viewer has requirements.read but NOT requirements.create
    const newReqBtn = page.getByRole('button', { name: /Create Requirement/i })
    await expect(newReqBtn).not.toBeVisible()
  })

  // Scenario 33: QA Lead can see "New Requirement" button
  test('S33 - QA Lead can see New Requirement button', async ({ page }) => {
    await loginAs(page, 'qa_lead')
    await page.goto(projectUrl('requirements'))

    await page.waitForLoadState('networkidle')

    const newReqBtn = page.getByRole('button', { name: /Create Requirement/i })
    await expect(newReqBtn).toBeVisible({ timeout: 15_000 })
  })

  // Scenario 34: Developer cannot create components (no components.create)
  test('S34 - API returns 403 for Developer creating component', async ({ page }) => {
    await loginAs(page, 'developer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
    const projectId = await page.evaluate(() => {
      const data = localStorage.getItem('currentProjectData')
      return data ? JSON.parse(data).id : null
    })

    // Developer has only components.read — no create permission
    const response = await page.request.post(`${API_URL}/api/v1/projects/${projectId}/components`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: { name: 'Forbidden Component', description: 'Should fail' },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 35: Project Manager can see "New Module" button
  test('S35 - Project Manager can see New Module button', async ({ page }) => {
    await loginAs(page, 'project_manager')
    await page.goto(projectUrl('modules'))

    await page.waitForLoadState('networkidle')

    const newModuleBtn = page.getByRole('button', { name: 'Create Module', exact: true })
    await expect(newModuleBtn).toBeVisible({ timeout: 15_000 })
  })
})
