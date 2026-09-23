import { expect, test } from '@playwright/test'
import { TestLabPage } from '../pages/TestLabPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const API_URL = process.env.E2E_API_URL || 'http://localhost:3001'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Test Lab Cycles & Runs management', () => {
  let testLabPage: TestLabPage

  test.beforeEach(async ({ page }) => {
    testLabPage = new TestLabPage(page, PROJECT_KEY, BASE_URL)
  })

  test('CYC-006 / CYC-007: Create, edit, delete cycle and verify statistics', async () => {
    // 1. Navigate to Test Lab Cycles tab
    await testLabPage.goto()
    await testLabPage.waitForListHeader()
    await testLabPage.switchTab('Cycles')

    const uniqueId = Date.now()
    const cycleName = `Cycle Test ${uniqueId}`
    const cycleEditedName = `Cycle Edited ${uniqueId}`

    // 2. Create a Test Cycle
    await testLabPage.createCycle(cycleName, '2026-07-01', '2026-07-15')

    // Assert cycle node appears in tree
    const cycleNode = testLabPage.getCycleNode(cycleName)
    await expect(cycleNode).toBeVisible({ timeout: 15_000 })

    // 3. Edit Cycle
    await testLabPage.editCycle(cycleName, cycleEditedName)

    // Verify name updated in tree
    const editedNode = testLabPage.getCycleNode(cycleEditedName)
    await expect(editedNode).toBeVisible({ timeout: 15_000 })

    // 4. Delete Cycle
    await testLabPage.deleteCycle(cycleEditedName)

    // Confirm it is deleted
    await expect(testLabPage.getCycleNode(cycleEditedName)).not.toBeVisible({ timeout: 15_000 })
  })

  test('RUN-005 to RUN-009: Test Run creation lifecycle, metadata edit, case association, stats and bulk deletion', async ({ page }) => {
    const uniqueId = Date.now()
    const planName = `Run Plan ${uniqueId}`
    const runName = `Run Target ${uniqueId}`
    const runEditedName = `Run Target Edited ${uniqueId}`
    const caseTitle = `Run Case ${uniqueId}`

    // Fetch auth token
    const loginResponse = await page.request.post(`${API_URL}/api/v1/auth/login`, {
      data: { loginName: 'admin', password: 'admin123' }
    })
    expect(loginResponse.ok()).toBe(true)
    const loginData = await loginResponse.json()
    const adminToken = loginData.data.tokens.accessToken
    const adminUserId = loginData.data.user.id
    const authHeaders = { Authorization: `Bearer ${adminToken}` }

    // Fetch project ID
    const projectResponse = await page.request.get(`${API_URL}/api/v1/projects`, {
      headers: authHeaders
    })
    expect(projectResponse.ok()).toBe(true)
    const projectData = await projectResponse.json()
    const targetProject = (projectData.data.projects || projectData.data).find((p: any) => p.abbreviation === PROJECT_KEY)
    expect(targetProject).toBeDefined()
    const projectId = targetProject.id

    // Create prerequisite: Test Plan
    const planRes = await page.request.post(`${API_URL}/api/v1/test-plans`, {
      data: { projectId: projectId, ownerId: adminUserId, name: planName, status: 'ACTIVE' },
      headers: authHeaders
    })
    expect(planRes.ok()).toBe(true)
    const planBody = await planRes.json()
    const testPlan = planBody.data

    // Create prerequisite: Test Case
    const caseRes = await page.request.post(`${API_URL}/api/v1/test-cases`, {
      data: { projectId: projectId, title: caseTitle, status: 'APPROVED' },
      headers: authHeaders
    })
    expect(caseRes.ok()).toBe(true)
    const caseBody = await caseRes.json()
    const testCase = caseBody.data

    // 2. Navigate to Runs creation form
    await testLabPage.gotoCreateRun()
    await expect(page.getByRole('heading', { name: 'Create Test Run' })).toBeVisible({ timeout: 20_000 })

    await testLabPage.createRun(runName, planName)

    // 3. Confirm redirected to run detail page (RUN-006: Add test case to run)
    await expect(page.getByRole('heading', { name: runName })).toBeVisible({ timeout: 25_000 })
    
    // Click "Add Test Cases" & associate
    await testLabPage.associateTestCase(caseTitle)

    // Assert case is added to detail table
    const detailTable = page.locator('div.divide-y.divide-slate-100')
    await expect(detailTable.getByText(caseTitle)).toBeVisible({ timeout: 15_000 })

    // 4. Retrieve Run ID from current URL to navigate directly for statistics testing (RUN-008)
    const currentUrl = page.url()
    const runIdMatch = currentUrl.match(/\/runs\/browse\/([^/]+)/)
    expect(runIdMatch).not.toBeNull()
    const runId = runIdMatch![1]

    // Navigate to statistics page for run (RUN-008)
    await testLabPage.gotoRunStats(runId)
    await expect(page.getByText('Run Statistics').first()).toBeVisible({ timeout: 25_000 })
    await expect(page.getByText('Total Executions').first()).toBeVisible({ timeout: 15_000 })

    // 5. RUN-007: Remove case from run
    await testLabPage.gotoRunDetails(runId)
    await expect(page.getByRole('heading', { name: runName })).toBeVisible({ timeout: 20_000 })

    // Remove the case
    await testLabPage.removeTestCase(caseTitle)
    await expect(detailTable.getByText(caseTitle)).not.toBeVisible({ timeout: 10_000 })

    // 6. RUN-005: Edit test run metadata
    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    // Edit run details
    await testLabPage.deleteRun(runName) // clicks Edit in list
    await testLabPage.runNameInput.fill(runEditedName)
    // Wait for the update to actually commit before checking the list —
    // the button is labeled "Save Changes", not "Update Test Run".
    await Promise.all([
      page.waitForResponse((r) => /\/api\/v1\/test-runs\/[^/]+$/.test(r.url()) && r.request().method() === 'PATCH' && r.ok(), { timeout: 20_000 }),
      page.getByRole('button', { name: 'Save Changes' }).click(),
    ])

    // Saving redirects to the run's detail page, not the list — navigate back
    // to the list explicitly before asserting the updated name appears there.
    await testLabPage.goto()
    await testLabPage.waitForListHeader()

    // Assert name is updated in the list view
    const listRowEdited = page.locator('tbody tr').filter({ hasText: runEditedName }).first()
    await expect(listRowEdited).toBeVisible({ timeout: 25_000 })

    // 7. RUN-009: Bulk delete selected test runs
    await testLabPage.bulkDeleteRun(runEditedName)

    // Verify deleted
    await expect(page.locator('tbody').getByText(runEditedName)).not.toBeVisible({ timeout: 15_000 })

    // Clean up plan and case
    await page.request.delete(`${API_URL}/api/v1/test-plans/${testPlan.id}`, { headers: authHeaders })
    await page.request.delete(`${API_URL}/api/v1/test-cases/${testCase.id}`, { headers: authHeaders })
  })
})
