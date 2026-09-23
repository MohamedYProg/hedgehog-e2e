import { expect, test } from '@playwright/test'
import { DefectsPage } from '../pages/DefectsPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Defects bulk updates and deletion', () => {
  let defectsPage: DefectsPage

  test.beforeEach(async ({ page }) => {
    defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)
  })

  test('DEF-015 / DEF-016: Bulk update and bulk delete selected defects', async ({ page }) => {
    const uniqueId = Date.now()
    const defectTitle1 = `Bulk Defect A ${uniqueId}`
    const defectTitle2 = `Bulk Defect B ${uniqueId}`

    // Navigate to BASE_URL first to load the localStorage origin context
    await page.goto(BASE_URL)
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
    const projectId = await page.evaluate(() => {
      const data = localStorage.getItem('currentProjectData')
      return data ? JSON.parse(data).id : null
    })

    // 1. Create 2 defects via API
    const defect1Res = await page.request.post(`${BASE_URL}/api/v1/projects/${projectId}/defects`, {
      data: { title: defectTitle1, description: 'Bulk defect description A', severity: 'MEDIUM', priority: 'MEDIUM', status: 'NEW' },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    expect(defect1Res.status()).toEqual(201)

    const defect2Res = await page.request.post(`${BASE_URL}/api/v1/projects/${projectId}/defects`, {
      data: { title: defectTitle2, description: 'Bulk defect description B', severity: 'MEDIUM', priority: 'MEDIUM', status: 'NEW' },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    expect(defect2Res.status()).toEqual(201)

    // 2. Navigate to defects list view
    await defectsPage.gotoList()
    await defectsPage.waitForListHeader()

    // Filter list to only show the newly created defects
    await defectsPage.searchDefect(uniqueId.toString())

    // Check checkboxes of both created defects
    const row1 = defectsPage.getDefectRow(defectTitle1)
    await expect(row1).toBeVisible({ timeout: 15_000 })
    await defectsPage.checkboxInRow(row1).click()

    const row2 = defectsPage.getDefectRow(defectTitle2)
    await expect(row2).toBeVisible({ timeout: 15_000 })
    await defectsPage.checkboxInRow(row2).click()

    // Assert bulk selection toolbar count
    await expect(defectsPage.getBulkSelectedText(2)).toBeVisible({ timeout: 10_000 })

    // 3. Perform bulk update (change priority to High)
    await defectsPage.bulkUpdatePriority('High')

    // Assert success toast
    await expect(defectsPage.successToast).toBeVisible({ timeout: 10_000 })
    await expect(defectsPage.successToast).not.toBeVisible({ timeout: 15_000 })

    // Verify both rows show HIGH priority in the table list
    await expect(row1.getByText('HIGH')).toBeVisible({ timeout: 10_000 })
    await expect(row2.getByText('HIGH')).toBeVisible({ timeout: 10_000 })

    // 4. Perform bulk delete
    // Re-select checkboxes if cleared, otherwise they should still be selected
    const isChecked1 = await defectsPage.checkboxInRow(row1).isChecked()
    if (!isChecked1) {
      await defectsPage.checkboxInRow(row1).click()
    }
    const isChecked2 = await defectsPage.checkboxInRow(row2).isChecked()
    if (!isChecked2) {
      await defectsPage.checkboxInRow(row2).click()
    }

    // Click Delete in bulk toolbar & Confirm
    await defectsPage.bulkDeleteSelected()

    // Assert success toast
    await expect(defectsPage.successToast).toBeVisible({ timeout: 10_000 })

    // Verify they are removed from table list
    await expect(defectsPage.getDefectCell(defectTitle1)).not.toBeVisible({ timeout: 15_000 })
    await expect(defectsPage.getDefectCell(defectTitle2)).not.toBeVisible({ timeout: 15_000 })
  })
})
