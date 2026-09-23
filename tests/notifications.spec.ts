import { expect, test } from '@playwright/test'
import { loginAs, projectUrl } from './helpers/auth'
import { NotificationsPage } from '../pages/NotificationsPage'
import { DefectsPage } from '../pages/DefectsPage'

const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

test.describe('In-App Notifications E2E', () => {
  test('QA Tester mentions Admin in comment, Admin receives notification', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page, PROJECT_KEY)
    const defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)

    // 1. Log in as QA Tester (Sarah Johnson)
    await loginAs(page, 'qa_tester')

    // 2. Navigate to defects list
    await defectsPage.gotoList()
    await defectsPage.waitForListHeader()
    
    // Check if there is at least one defect, if not, create one
    let firstDefectRow = defectsPage.firstRow
    let defectBtn = firstDefectRow.locator('td button').first()
    const noDefectsText = page.getByText('No defects found')
    
    // Wait for either the first defect row button OR the empty state to render
    await expect(defectBtn.or(noDefectsText)).toBeVisible({ timeout: 15_000 })
    const hasDefects = await defectBtn.isVisible()
    
    if (!hasDefects) {
      await defectsPage.gotoCreate()
      await expect(defectsPage.summaryInput).toBeVisible({ timeout: 15_000 })

      await defectsPage.createNewDefect(
        'Notification Trigger Defect',
        'Temp defect created for notifications trigger',
        'Bug'
      )
      
      await page.waitForURL(/\/defects(\?|$)/, { timeout: 20_000 })
      await defectsPage.waitForListHeader()
      firstDefectRow = defectsPage.firstRow
      defectBtn = firstDefectRow.locator('td button').first()
    }
    
    await expect(defectBtn).toBeVisible({ timeout: 15_000 })
    
    // The summary button is the main trigger to view details
    defectBtn = firstDefectRow.locator('td button').first()
    const defectSummary = await defectBtn.innerText()
    await defectBtn.click()

    // 3. Wait for Defect Detail page to load
    await expect(page.getByText('Defect Details')).toBeVisible({ timeout: 15_000 })

    // 4. Post a comment mentioning the admin (@admin)
    await expect(notificationsPage.commentInput).toBeVisible({ timeout: 10_000 })
    
    const commentText = `@admin please review defect: ${defectSummary}`
    
    // Wait for the comment creation API request to resolve. 15s has proven
    // too tight under current data volume/load in this shared project — seen
    // occasionally exceeding it even though the request eventually succeeds.
    const commentPromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/defects/') &&
        response.url().endsWith('/comments') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 45_000 }
    )
    await notificationsPage.addComment(commentText)
    await commentPromise

    // Verify comment is successfully posted and rendered in the comment cards
    const commentCard = notificationsPage.getCommentCard('Sarah Johnson', commentText)
    await expect(commentCard).toBeVisible({ timeout: 15_000 })

    // 5. Sign out of the QA Tester session
    await notificationsPage.signOut()
    await page.waitForURL(/.*\/auth\/signin/, { timeout: 15_000 })

    // 6. Log in as Admin
    await loginAs(page, 'admin')

    // 7. Verify the notification bell has the unread count badge
    await expect(notificationsPage.bellBtn).toBeVisible({ timeout: 15_000 })
    await expect(notificationsPage.badge).toBeVisible({ timeout: 10_000 })
    const text = await notificationsPage.badge.innerText()
    expect(parseInt(text || '0', 10)).toBeGreaterThanOrEqual(1)

    // 8. Click the bell to open the notifications popup list
    await notificationsPage.openNotifications()
    await expect(notificationsPage.popupHeading).toBeVisible({ timeout: 10_000 })

    // Verify the notification item matching Sarah's mention is displayed
    const notificationItem = notificationsPage.getNotificationItem(defectSummary)
    await expect(notificationItem).toBeVisible({ timeout: 10_000 })

    // 9. Click "Mark all read" and verify the badge is cleared
    if (await notificationsPage.markAllReadBtn.isVisible().catch(() => false)) {
      await notificationsPage.markAllAsRead()
      await expect(notificationsPage.badge).not.toBeVisible({ timeout: 10_000 })
    }
  })
})
