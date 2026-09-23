import { expect, test } from '@playwright/test'
import { DefectsPage } from '../pages/DefectsPage'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

let createdSummary = ''

test.describe.serial('Defects – Kanban Board Drag & Drop', () => {
  test('C – creates a new defect (defaults to the New column)', async ({ page }) => {
    const defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)
    createdSummary = `E2E Board Defect ${Date.now()}`

    await defectsPage.gotoCreate()
    await expect(defectsPage.summaryInput).toBeVisible({ timeout: 20_000 })

    const [response] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/v1/defects') && r.request().method() === 'POST', { timeout: 20_000 }),
      defectsPage.createNewDefect(
        createdSummary,
        'Detailed description for board drag-and-drop test.',
        'Regression'
      ),
    ])
    if (!response.ok()) {
      throw new Error(`Defect creation failed: ${response.status()} ${await response.text().catch(() => '')}`)
    }

    // Note: the URL right after submit still contains "/defects" (the create route is
    // "/defects/create"), so match the list route specifically rather than a loose substring.
    await expect(page).toHaveURL(/\/defects(\?|$)/, { timeout: 20_000 })
    await defectsPage.waitForListHeader()
  })

  test('valid move – dragging card from New to Assigned persists after reload', async ({ page }) => {
    test.skip(!createdSummary, 'Skipped — create defect did not run')
    const defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)

    await defectsPage.gotoList()
    await defectsPage.waitForListHeader()
    await defectsPage.switchToBoardView()

    const cardInNew = defectsPage.getBoardCardInColumn('New', createdSummary)
    await expect(cardInNew).toBeVisible({ timeout: 20_000 })

    await defectsPage.dragCardToColumn(createdSummary, 'Assigned')

    const cardInAssigned = defectsPage.getBoardCardInColumn('Assigned', createdSummary)
    await expect(cardInAssigned).toBeVisible({ timeout: 10_000 })
    await expect(defectsPage.getBoardCardInColumn('New', createdSummary)).toHaveCount(0)

    // Reload to confirm the status change was persisted server-side, not just optimistic UI.
    await page.reload()
    await defectsPage.waitForListHeader()
    await expect(defectsPage.boardContainer).toBeVisible({ timeout: 20_000 })
    await expect(defectsPage.getBoardCardInColumn('Assigned', createdSummary)).toBeVisible({ timeout: 20_000 })
  })

  test('invalid move – dragging card to a non-adjacent workflow column is rejected', async ({ page }) => {
    test.skip(!createdSummary, 'Skipped — create defect did not run')
    const defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)

    await defectsPage.gotoList()
    await defectsPage.waitForListHeader()
    await defectsPage.switchToBoardView()

    // Card is currently in "Assigned"; the seeded workflow has no Assigned → Verified transition.
    const cardInAssigned = defectsPage.getBoardCardInColumn('Assigned', createdSummary)
    await expect(cardInAssigned).toBeVisible({ timeout: 20_000 })

    await defectsPage.dragCardToColumn(createdSummary, 'Verified')

    // The disallowed drop should be a no-op: card stays in its original column.
    await expect(defectsPage.getBoardCardInColumn('Assigned', createdSummary)).toBeVisible({ timeout: 10_000 })
    await expect(defectsPage.getBoardCardInColumn('Verified', createdSummary)).toHaveCount(0)
  })

  test('D – cleans up the created defect', async ({ page }) => {
    test.skip(!createdSummary, 'Skipped — create defect did not run')
    const defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)

    await defectsPage.gotoList()
    await defectsPage.waitForListHeader()
    await defectsPage.switchToListView()

    await defectsPage.searchDefect(createdSummary)
    await defectsPage.deleteFirstDefect()
    await expect(defectsPage.getDefectCell(createdSummary)).not.toBeVisible({ timeout: 10_000 })
  })
})
