import { expect, test } from '@playwright/test'
import { ProjectsPage } from '../pages/ProjectsPage'
import { LoginPage } from '../pages/LoginPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
const LOGIN_NAME = process.env.E2E_LOGIN_NAME || 'admin'
const PASSWORD = process.env.E2E_PASSWORD || 'admin123'

test.describe('Projects & Workspace Management', () => {
  let projectsPage: ProjectsPage

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page, BASE_URL)
  })

  test('PRJ-006: On initial load, the select project dropdown defaults to Select Project (no project selected)', async ({ browser }) => {
    // Force a clean context with empty storage state to simulate first-time login
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()

    const loginPage = new LoginPage(page, BASE_URL)
    await loginPage.goto()
    await loginPage.login(LOGIN_NAME, PASSWORD)

    await page.waitForURL(/.*\/app\/projects/, { timeout: 30_000 })

    const localProjectsPage = new ProjectsPage(page, BASE_URL)
    await expect(localProjectsPage.projectSwitcherText).toBeVisible({ timeout: 15_000 })

    await context.close()
  })

  test('BVA-009: Project Abbreviation limits validation (2 to 5 characters)', async () => {
    await projectsPage.gotoList()
    await expect(projectsPage.searchInput).toBeVisible({ timeout: 40_000 })

    // 2. Click "Create Project" button
    await projectsPage.openCreateModal()

    // 3. Test Abbreviation too short (1 character)
    await projectsPage.fillProjectForm('Boundary Project', 'A')
    await projectsPage.submit()

    // Assert that the toast/alert blocks creation with validation warning
    await expect(projectsPage.invalidAbbreviationToast).toBeVisible({ timeout: 10_000 })

    // 4. Test Abbreviation too long (6 characters) - truncated to 5 by browser maxLength
    await projectsPage.projectAbbreviationInput.fill('ABCDEF')
    await expect(projectsPage.projectAbbreviationInput).toHaveValue('ABCDE')

    // Cancel modal
    await projectsPage.cancel()
  })

  test('PRJ-025: Adding duplicate project member is rejected with 409 Conflict', async ({ page }) => {
    // Go to project home/lab page to ensure localStorage gets populated with project and user details
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab`)
    await expect(page.getByRole('heading', { name: 'Test Lab' })).toBeVisible({ timeout: 25_000 })

    // Evaluate storage keys to get target IDs and access token
    const { projectId, userId, token } = await page.evaluate(() => {
      const projectData = JSON.parse(localStorage.getItem('currentProjectData') || '{}')
      return {
        projectId: projectData.id,
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('accessToken')
      }
    })

    expect(projectId).toBeTruthy()
    expect(userId).toBeTruthy()
    expect(token).toBeTruthy()

    // Send a duplicate POST member registration request
    const response = await page.request.post(`${BASE_URL}/api/v1/projects/${projectId}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        userId
      }
    })

    // Assert that the server rejects the duplicate request with a 409 Conflict
    expect(response.status()).toBe(409)
    const responseData = await response.json()
    expect(responseData.error?.code).toBe('USER_ALREADY_MEMBER')
    expect(responseData.error?.message).toContain('already a member')
  })
})
