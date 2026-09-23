import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Test Suites management & constraints', () => {
  test('TS-005: Suite case ordering sequence is preserved on save', async ({ page }) => {
    // 1. Navigate to Test Cases page
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases`)
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }))).toBeVisible({ timeout: 35_000 })
    await page.getByText('All Test Cases').first().click()

    const uniqueId = Date.now()
    const suiteName = `Suite Order ${uniqueId}`
    const caseTitle1 = `Case A ${uniqueId}`
    const caseTitle2 = `Case B ${uniqueId}`

    // Create a new suite
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Suite' }).click()
    await expect(page.getByRole('heading', { name: 'Create Test Suite' })).toBeVisible({ timeout: 10_000 })
    await page.locator('#suite-name').fill(suiteName)
    await page.getByRole('button', { name: 'Create Suite', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Create Test Suite' })).not.toBeVisible()

    // Expand repo tree if necessary to select suite
    const repoHeader = page.locator('span.flex-1.font-semibold.truncate').first()
    await expect(repoHeader).toBeVisible()
    const isVisible = await page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName }).isVisible()
    if (!isVisible) {
      await repoHeader.click()
    }
    const suiteNode = page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName }).first()
    await expect(suiteNode).toBeVisible({ timeout: 15_000 })
    await suiteNode.click()
    await expect(page.getByText('Total Tests')).toBeVisible()

    // Create Case A
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Case' }).click()
    await expect(page.getByRole('heading', { name: 'Create New Test Case' })).toBeVisible({ timeout: 15_000 })
    await page.locator('#title').fill(caseTitle1)
    await page.locator('#suiteId').selectOption({ label: suiteName })
    // Wait for the actual create request to resolve, not just for the redirect —
    // the "Test Repository" heading reappears as soon as navigation happens,
    // which doesn't guarantee the mutation has committed server-side yet (the
    // API check further below was racing this and intermittently saw only 1
    // of the 2 cases).
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/test-cases') && r.request().method() === 'POST' && r.ok(), { timeout: 20_000 }),
      page.getByRole('button', { name: 'Create Test Case' }).click(),
    ])
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }))).toBeVisible({ timeout: 25_000 })

    // Select the suite again to make the Create button visible
    await suiteNode.click()
    await expect(page.getByText('Total Tests')).toBeVisible()

    // Create Case B
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Case' }).click()
    await expect(page.getByRole('heading', { name: 'Create New Test Case' })).toBeVisible({ timeout: 15_000 })
    await page.locator('#title').fill(caseTitle2)
    await page.locator('#suiteId').selectOption({ label: suiteName })
    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/test-cases') && r.request().method() === 'POST' && r.ok(), { timeout: 20_000 }),
      page.getByRole('button', { name: 'Create Test Case' }).click(),
    ])
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }))).toBeVisible({ timeout: 25_000 })

    // Get database IDs for suite and cases using API integration calls
    const { token, projectId } = await page.evaluate(() => {
      const projectData = JSON.parse(localStorage.getItem('currentProjectData') || '{}')
      return {
        token: localStorage.getItem('accessToken'),
        projectId: projectData.id
      }
    })
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    }

    // Fetch suites to locate our created suite ID
    const suitesResponse = await page.request.get(`${BASE_URL}/api/v1/projects/${projectId}/test-suites`, {
      headers: authHeaders
    })
    const suitesData = await suitesResponse.json()
    const testSuitesList = suitesData.testSuites || suitesData.data?.testSuites || []
    const targetSuite = testSuitesList.find((s: any) => s.name === suiteName)
    expect(targetSuite).toBeDefined()
    const suiteId = targetSuite.id

    // Fetch cases for this suite
    const casesResponse = await page.request.get(`${BASE_URL}/api/v1/test-suites/${suiteId}/cases`, {
      headers: authHeaders
    })
    const casesData = await casesResponse.json()
    const casesList = casesData.data || casesData
    expect(casesList.length).toEqual(2)

    const caseA = casesList.find((c: any) => c.testCase.title === caseTitle1)
    const caseB = casesList.find((c: any) => c.testCase.title === caseTitle2)
    expect(caseA).toBeDefined()
    expect(caseB).toBeDefined()

    // Reorder cases: Set Case B (order: 0), Case A (order: 1)
    const reorderRes = await page.request.put(`${BASE_URL}/api/v1/test-suites/${suiteId}/cases`, {
      data: {
        testCaseOrders: [
          { testCaseId: caseB.testCase.id, order: 0 },
          { testCaseId: caseA.testCase.id, order: 1 }
        ]
      },
      headers: authHeaders
    })
    expect(reorderRes.status()).toEqual(200)

    // Fetch cases again and assert Case B comes first
    const casesResponse2 = await page.request.get(`${BASE_URL}/api/v1/test-suites/${suiteId}/cases`, {
      headers: authHeaders
    })
    const casesData2 = await casesResponse2.json()
    const casesList2 = casesData2.data || casesData2
    expect(casesList2[0].testCase.id).toEqual(caseB.testCase.id)
    expect(casesList2[1].testCase.id).toEqual(caseA.testCase.id)

    // Cleanup: Delete test cases
    const deleteA = await page.request.delete(`${BASE_URL}/api/v1/test-cases/${caseA.testCase.id}`, {
      headers: authHeaders
    })
    expect(deleteA.status()).toEqual(200)

    const deleteB = await page.request.delete(`${BASE_URL}/api/v1/test-cases/${caseB.testCase.id}`, {
      headers: authHeaders
    })
    expect(deleteB.status()).toEqual(200)

    // Cleanup: Delete suite
    const deleteSuite = await page.request.delete(`${BASE_URL}/api/v1/test-suites/${suiteId}`, {
      headers: authHeaders
    })
    expect(deleteSuite.status()).toEqual(200)
  })

  test('TS-007: Safe deletion of test suites blocks orphaned references', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases`)
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }))).toBeVisible({ timeout: 35_000 })
    await page.getByText('All Test Cases').first().click()

    const uniqueId = Date.now()
    const suiteName = `Suite Delete ${uniqueId}`
    const caseTitle = `Suite Case ${uniqueId}`

    // Create a new suite
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Suite' }).click()
    await expect(page.getByRole('heading', { name: 'Create Test Suite' })).toBeVisible({ timeout: 10_000 })
    await page.locator('#suite-name').fill(suiteName)
    await page.getByRole('button', { name: 'Create Suite', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Create Test Suite' })).not.toBeVisible()

    // Expand repo tree if necessary
    const repoHeader = page.locator('span.flex-1.font-semibold.truncate').first()
    await expect(repoHeader).toBeVisible()
    const isVisible = await page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName }).isVisible()
    if (!isVisible) {
      await repoHeader.click()
    }
    const suiteNode = page.locator('span.flex-1.text-sm.truncate').filter({ hasText: suiteName }).first()
    await expect(suiteNode).toBeVisible({ timeout: 15_000 })
    await suiteNode.click()
    await expect(page.getByText('Total Tests')).toBeVisible()

    // Create a child case inside suite
    await page.getByRole('button', { name: 'Create', exact: true }).click()
    await page.getByRole('menuitem', { name: 'Create new Test Case' }).click()
    await expect(page.getByRole('heading', { name: 'Create New Test Case' })).toBeVisible({ timeout: 15_000 })
    await page.locator('#title').fill(caseTitle)
    await page.locator('#suiteId').selectOption({ label: suiteName })
    await page.getByRole('button', { name: 'Create Test Case' }).click()
    await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }))).toBeVisible({ timeout: 25_000 })

    // Get database IDs for suite and cases using API integration calls
    const { token, projectId } = await page.evaluate(() => {
      const projectData = JSON.parse(localStorage.getItem('currentProjectData') || '{}')
      return {
        token: localStorage.getItem('accessToken'),
        projectId: projectData.id
      }
    })
    const authHeaders = {
      'Authorization': `Bearer ${token}`
    }

    // Locate the created suite ID
    const suitesResponse = await page.request.get(`${BASE_URL}/api/v1/projects/${projectId}/test-suites`, {
      headers: authHeaders
    })
    const suitesData = await suitesResponse.json()
    const testSuitesList = suitesData.testSuites || suitesData.data?.testSuites || []
    const targetSuite = testSuitesList.find((s: any) => s.name === suiteName)
    expect(targetSuite).toBeDefined()
    const suiteId = targetSuite.id

    // Attempting to delete the suite directly via API must fail due to child case protection constraint
    const deleteAttempt = await page.request.delete(`${BASE_URL}/api/v1/test-suites/${suiteId}`, {
      headers: authHeaders
    })
    expect(deleteAttempt.status()).toEqual(400)
    const errorBody = await deleteAttempt.json()
    expect(errorBody.error?.message || errorBody.message).toContain('Cannot delete suite that contains child suites or test cases')

    // Cleanup: Fetch case ID and delete it
    const casesResponse = await page.request.get(`${BASE_URL}/api/v1/test-suites/${suiteId}/cases`, {
      headers: authHeaders
    })
    const casesData = await casesResponse.json()
    const casesList = casesData.data || casesData
    const caseId = casesList[0].testCase.id

    const deleteCase = await page.request.delete(`${BASE_URL}/api/v1/test-cases/${caseId}`, {
      headers: authHeaders
    })
    expect(deleteCase.status()).toEqual(200)

    // Now delete suite should succeed
    const deleteSuite = await page.request.delete(`${BASE_URL}/api/v1/test-suites/${suiteId}`, {
      headers: authHeaders
    })
    expect(deleteSuite.status()).toEqual(200)
  })
})
