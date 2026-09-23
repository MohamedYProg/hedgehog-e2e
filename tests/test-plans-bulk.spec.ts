import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const API_URL = process.env.E2E_API_URL || 'http://localhost:3001'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Test Plans exit criteria & bulk deletion', () => {
  test('TP-007: Exit criteria status computes real-time pass percentage', async ({ page }) => {
    // Navigate to project context to establish session
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-plans`)
    await expect(page.getByRole('heading', { name: 'Test Plans' })).toBeVisible({ timeout: 35_000 })

    const uniqueId = Date.now()
    const planName = `Plan Exit ${uniqueId}`
    const runName = `Run Exit ${uniqueId}`

    // Fetch auth token
    const loginResponse = await page.request.post(`${API_URL}/api/v1/auth/login`, {
      data: { loginName: 'admin', password: 'admin123' }
    })
    expect(loginResponse.ok()).toBe(true)
    const loginData = await loginResponse.json()
    const adminToken = loginData.data.tokens.accessToken
    const adminUserId = loginData.data.user.id
    const authHeaders = { Authorization: `Bearer ${adminToken}` }

    // Fetch project
    const projectResponse = await page.request.get(`${API_URL}/api/v1/projects`, {
      headers: authHeaders
    })
    expect(projectResponse.ok()).toBe(true)
    const projectData = await projectResponse.json()
    const targetProject = (projectData.data.projects || projectData.data).find((p: any) => p.abbreviation === PROJECT_KEY)
    expect(targetProject).toBeDefined()
    const projectId = targetProject.id

    // 1. Create a Test Plan directly via API with exit criteria configured (Pass Rate = 100%)
    const createPlanRes = await page.request.post(`${API_URL}/api/v1/test-plans`, {
      data: {
        projectId: projectId,
        ownerId: adminUserId,
        name: planName,
        status: 'ACTIVE',
        exitCriteriaConfig: {
          executionPassRate: {
            enabled: true,
            targetPercentage: 100,
            excludeSkipped: false,
            excludeBlocked: false
          }
        }
      },
      headers: authHeaders
    })
    expect(createPlanRes.ok()).toBe(true)
    const createPlanBody = await createPlanRes.json()
    const testPlan = createPlanBody.data
    const planId = testPlan.id

    // 2. Fetch project details to locate default environment and test cycle
    const envsResponse = await page.request.get(`${API_URL}/api/v1/test-environments?projectId=${projectId}`, {
      headers: authHeaders
    })
    expect(envsResponse.ok()).toBe(true)
    const envsBody = await envsResponse.json()
    const envId = envsBody.data.testEnvironments[0].id

    const cyclesResponse = await page.request.get(`${API_URL}/api/v1/projects/${projectId}/cycles`, {
      headers: authHeaders
    })
    expect(cyclesResponse.ok()).toBe(true)
    const cyclesBody = await cyclesResponse.json()
    const cycleId = cyclesBody.data.cycles[0].id

    // 3. Create a Test Run associated with this plan
    const createRunRes = await page.request.post(`${API_URL}/api/v1/test-runs`, {
      data: {
        projectId: projectId,
        name: runName,
        planId: planId,
        cycleId: cycleId,
        environmentId: envId,
        status: 'IN_PROGRESS'
      },
      headers: authHeaders
    })
    expect(createRunRes.ok()).toBe(true)
    const runBody = await createRunRes.json()
    const runId = runBody.data.id

    // 4. Add a test case and verify exit criteria is 0% passed initially
    const caseTitle = `Plan Case ${uniqueId}`
    const createCaseRes = await page.request.post(`${API_URL}/api/v1/test-cases`, {
      data: { projectId: projectId, title: caseTitle, status: 'APPROVED' },
      headers: authHeaders
    })
    expect(createCaseRes.ok()).toBe(true)
    const caseBody = await createCaseRes.json()
    const testCase = caseBody.data

    // Add to run (which creates a test execution)
    const addExecRes = await page.request.post(`${API_URL}/api/v1/test-runs/${runId}/executions`, {
      data: { testCaseIds: [testCase.id] },
      headers: authHeaders
    })
    expect(addExecRes.ok()).toBe(true)
    const execBody = await addExecRes.json()
    const execId = execBody.data[0].id

    // Set execution to FAILED first so pass rate computes to 0%
    const failExecRes = await page.request.patch(`${API_URL}/api/v1/test-executions/${execId}`, {
      data: { status: 'FAILED' },
      headers: authHeaders
    })
    expect(failExecRes.ok()).toBe(true)

    // Check exit criteria status: execution pass rate actual is 0 (as test case is FAILED)
    const criteriaRes1 = await page.request.get(`${API_URL}/api/v1/test-plans/${planId}/exit-criteria-status`, {
      headers: authHeaders
    })
    expect(criteriaRes1.ok()).toBe(true)
    const criteriaBody1 = await criteriaRes1.json()
    const status1 = criteriaBody1.data
    expect(status1.overallMet).toEqual(false)
    
    const rateCrit = status1.criteria.find((c: any) => c.key === 'executionPassRate')
    expect(rateCrit).toBeDefined()
    expect(rateCrit.actual).toEqual(0)

    // 5. Update execution to PASSED and verify exit criteria computes 100% and met=true
    const updateExecRes = await page.request.patch(`${API_URL}/api/v1/test-executions/${execId}`, {
      data: { status: 'PASSED' },
      headers: authHeaders
    })
    expect(updateExecRes.ok()).toBe(true)

    const criteriaRes2 = await page.request.get(`${API_URL}/api/v1/test-plans/${planId}/exit-criteria-status`, {
      headers: authHeaders
    })
    expect(criteriaRes2.ok()).toBe(true)
    const criteriaBody2 = await criteriaRes2.json()
    const status2 = criteriaBody2.data
    expect(status2.overallMet).toEqual(true)
    const rateCrit2 = status2.criteria.find((c: any) => c.key === 'executionPassRate')
    expect(rateCrit2.actual).toEqual(100)

    // Cleanup: Delete plan, runs, case
    await page.request.delete(`${API_URL}/api/v1/test-plans/${planId}`, { headers: authHeaders })
    await page.request.delete(`${API_URL}/api/v1/test-cases/${testCase.id}`, { headers: authHeaders })
  })

  test('TP-009: Bulk delete selected test plans updates list view', async ({ page }) => {
    const uniqueId = Date.now()
    const planName1 = `Bulk Plan A ${uniqueId}`
    const planName2 = `Bulk Plan B ${uniqueId}`

    // Fetch auth token
    const loginResponse = await page.request.post(`${API_URL}/api/v1/auth/login`, {
      data: { loginName: 'admin', password: 'admin123' }
    })
    expect(loginResponse.ok()).toBe(true)
    const loginData = await loginResponse.json()
    const adminToken = loginData.data.tokens.accessToken
    const adminUserId = loginData.data.user.id
    const authHeaders = { Authorization: `Bearer ${adminToken}` }

    // Fetch project
    const projectResponse = await page.request.get(`${API_URL}/api/v1/projects`, {
      headers: authHeaders
    })
    expect(projectResponse.ok()).toBe(true)
    const projectData = await projectResponse.json()
    const targetProject = (projectData.data.projects || projectData.data).find((p: any) => p.abbreviation === PROJECT_KEY)
    expect(targetProject).toBeDefined()
    const projectId = targetProject.id

    // 1. Create two test plans
    await page.request.post(`${API_URL}/api/v1/test-plans`, {
      data: { projectId: projectId, ownerId: adminUserId, name: planName1, status: 'DRAFT' },
      headers: authHeaders
    })

    await page.request.post(`${API_URL}/api/v1/test-plans`, {
      data: { projectId: projectId, ownerId: adminUserId, name: planName2, status: 'DRAFT' },
      headers: authHeaders
    })

    // 2. Navigate to test plans list view
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-plans`)
    await expect(page.getByRole('heading', { name: 'Test Plans' })).toBeVisible({ timeout: 35_000 })

    // Check the rows checkbox
    const row1 = page.locator('tbody tr').filter({ hasText: planName1 }).first()
    await expect(row1).toBeVisible({ timeout: 15_000 })
    await row1.locator('input[type="checkbox"]').first().click()

    const row2 = page.locator('tbody tr').filter({ hasText: planName2 }).first()
    await expect(row2).toBeVisible({ timeout: 15_000 })
    await row2.locator('input[type="checkbox"]').first().click()

    // Assert bulk toolbar displays the count
    await expect(page.getByText('2 test plans selected')).toBeVisible({ timeout: 10_000 })

    // Click Delete in bulk actions toolbar
    await page.getByRole('button', { name: 'Delete', exact: true }).click()
    
    // Confirm in dialog
    await page.locator('.fixed.z-50').getByRole('button', { name: 'Delete', exact: true }).click()

    // Verify both plans are deleted from UI list
    await expect(page.locator('tbody').getByText(planName1)).not.toBeVisible({ timeout: 15_000 })
    await expect(page.locator('tbody').getByText(planName2)).not.toBeVisible({ timeout: 15_000 })
  })
})
