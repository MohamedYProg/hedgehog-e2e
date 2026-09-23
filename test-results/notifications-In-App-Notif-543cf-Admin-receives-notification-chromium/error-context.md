# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.ts >> In-App Notifications E2E >> QA Tester mentions Admin in comment, Admin receives notification
- Location: tests\notifications.spec.ts:10:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('div.border.rounded-lg').filter({ hasText: 'Sarah Johnson' }).filter({ hasText: '@admin please review defect: E2E Defect 1790151810415' }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('div.border.rounded-lg').filter({ hasText: 'Sarah Johnson' }).filter({ hasText: '@admin please review defect: E2E Defect 1790151810415' }).first()

```

```yaml
- main:
  - img "HedgeHog Logo"
  - text: HedgeHog
  - button "Collapse sidebar"
  - button "TMT"
  - navigation:
    - button "Test Plans"
    - button "Modules"
    - button "Requirements"
    - button "Test Repository"
    - button "Defects"
    - button "Test Lab"
    - button "Reports"
  - heading "Defects" [level=2]
  - button "Notifications (8 unread)"
  - button "Sarah Johnson sarah.johnson@qira.com":
    - paragraph: Sarah Johnson
    - paragraph: sarah.johnson@qira.com
  - main:
    - button "Back"
    - heading "E2E Defect 1790151810415" [level=1]
    - text: TMTT_DEF_00089
    - heading "Defect Details Edit" [level=3]:
      - text: Defect Details
      - button "Edit"
    - text: "Created: 9/23/2026 Updated: 9/23/2026 Created by: Updated User Description"
    - paragraph: Detailed description of Playwright test defect.
    - heading "Comments (1)" [level=3]
    - textbox "Add a comment... use @ to mention a teammate"
    - text: 0 / 2000 characters
    - button "Add Comment" [disabled]
    - text: 9/23/2026
    - paragraph: "@admin please review defect: E2E Defect 1790151810415"
    - heading "Attachments (0)" [level=3]
    - paragraph: Drag & drop files here
    - paragraph: or click to browse
    - text: Max 10 MB per file
    - paragraph: No attachments
    - heading "Linked Items (0) Link Item" [level=3]:
      - text: Linked Items (0)
      - button "Link Item"
    - paragraph: No linked items
    - button "Link Item"
- button "Open Tanstack query devtools":
  - img
- alert
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import { loginAs, projectUrl } from './helpers/auth'
  3   | import { NotificationsPage } from '../pages/NotificationsPage'
  4   | import { DefectsPage } from '../pages/DefectsPage'
  5   | 
  6   | const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
  7   | const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  8   | 
  9   | test.describe('In-App Notifications E2E', () => {
  10  |   test('QA Tester mentions Admin in comment, Admin receives notification', async ({ page }) => {
  11  |     const notificationsPage = new NotificationsPage(page, PROJECT_KEY)
  12  |     const defectsPage = new DefectsPage(page, PROJECT_KEY, BASE_URL)
  13  | 
  14  |     // 1. Log in as QA Tester (Sarah Johnson)
  15  |     await loginAs(page, 'qa_tester')
  16  | 
  17  |     // 2. Navigate to defects list
  18  |     await defectsPage.gotoList()
  19  |     await defectsPage.waitForListHeader()
  20  |     
  21  |     // Check if there is at least one defect, if not, create one
  22  |     let firstDefectRow = defectsPage.firstRow
  23  |     let defectBtn = firstDefectRow.locator('td button').first()
  24  |     const noDefectsText = page.getByText('No defects found')
  25  |     
  26  |     // Wait for either the first defect row button OR the empty state to render
  27  |     await expect(defectBtn.or(noDefectsText)).toBeVisible({ timeout: 15_000 })
  28  |     const hasDefects = await defectBtn.isVisible()
  29  |     
  30  |     if (!hasDefects) {
  31  |       await defectsPage.gotoCreate()
  32  |       await expect(defectsPage.summaryInput).toBeVisible({ timeout: 15_000 })
  33  | 
  34  |       await defectsPage.createNewDefect(
  35  |         'Notification Trigger Defect',
  36  |         'Temp defect created for notifications trigger',
  37  |         'Bug'
  38  |       )
  39  |       
  40  |       await page.waitForURL(/\/defects(\?|$)/, { timeout: 20_000 })
  41  |       await defectsPage.waitForListHeader()
  42  |       firstDefectRow = defectsPage.firstRow
  43  |       defectBtn = firstDefectRow.locator('td button').first()
  44  |     }
  45  |     
  46  |     await expect(defectBtn).toBeVisible({ timeout: 15_000 })
  47  |     
  48  |     // The summary button is the main trigger to view details
  49  |     defectBtn = firstDefectRow.locator('td button').first()
  50  |     const defectSummary = await defectBtn.innerText()
  51  |     await defectBtn.click()
  52  | 
  53  |     // 3. Wait for Defect Detail page to load
  54  |     await expect(page.getByText('Defect Details')).toBeVisible({ timeout: 15_000 })
  55  | 
  56  |     // 4. Post a comment mentioning the admin (@admin)
  57  |     await expect(notificationsPage.commentInput).toBeVisible({ timeout: 10_000 })
  58  |     
  59  |     const commentText = `@admin please review defect: ${defectSummary}`
  60  |     
  61  |     // Wait for the comment creation API request to resolve. 15s has proven
  62  |     // too tight under current data volume/load in this shared project — seen
  63  |     // occasionally exceeding it even though the request eventually succeeds.
  64  |     const commentPromise = page.waitForResponse(
  65  |       (response) =>
  66  |         response.url().includes('/api/v1/defects/') &&
  67  |         response.url().endsWith('/comments') &&
  68  |         response.request().method() === 'POST' &&
  69  |         response.status() === 201,
  70  |       { timeout: 45_000 }
  71  |     )
  72  |     await notificationsPage.addComment(commentText)
  73  |     await commentPromise
  74  | 
  75  |     // Verify comment is successfully posted and rendered in the comment cards
  76  |     const commentCard = notificationsPage.getCommentCard('Sarah Johnson', commentText)
> 77  |     await expect(commentCard).toBeVisible({ timeout: 15_000 })
      |                               ^ Error: expect(locator).toBeVisible() failed
  78  | 
  79  |     // 5. Sign out of the QA Tester session
  80  |     await notificationsPage.signOut()
  81  |     await page.waitForURL(/.*\/auth\/signin/, { timeout: 15_000 })
  82  | 
  83  |     // 6. Log in as Admin
  84  |     await loginAs(page, 'admin')
  85  | 
  86  |     // 7. Verify the notification bell has the unread count badge
  87  |     await expect(notificationsPage.bellBtn).toBeVisible({ timeout: 15_000 })
  88  |     await expect(notificationsPage.badge).toBeVisible({ timeout: 10_000 })
  89  |     const text = await notificationsPage.badge.innerText()
  90  |     expect(parseInt(text || '0', 10)).toBeGreaterThanOrEqual(1)
  91  | 
  92  |     // 8. Click the bell to open the notifications popup list
  93  |     await notificationsPage.openNotifications()
  94  |     await expect(notificationsPage.popupHeading).toBeVisible({ timeout: 10_000 })
  95  | 
  96  |     // Verify the notification item matching Sarah's mention is displayed
  97  |     const notificationItem = notificationsPage.getNotificationItem(defectSummary)
  98  |     await expect(notificationItem).toBeVisible({ timeout: 10_000 })
  99  | 
  100 |     // 9. Click "Mark all read" and verify the badge is cleared
  101 |     if (await notificationsPage.markAllReadBtn.isVisible().catch(() => false)) {
  102 |       await notificationsPage.markAllAsRead()
  103 |       await expect(notificationsPage.badge).not.toBeVisible({ timeout: 10_000 })
  104 |     }
  105 |   })
  106 | })
  107 | 
```