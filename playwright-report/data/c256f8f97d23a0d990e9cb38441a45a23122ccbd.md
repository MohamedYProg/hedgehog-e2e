# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: boundary-limits.spec.ts >> Boundary Value Analysis (BVA) limits >> BVA-010: Requirement title blank rejected, 1-character description succeeds
- Location: tests\boundary-limits.spec.ts:35:7

# Error details

```
Test timeout of 300000ms exceeded.
```

```
Error: locator.click: Test timeout of 300000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Create Requirement', exact: true })
    - locator resolved to <button type="submit" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 bg-black/50"></div> from <div class="fixed inset-0 z-50 flex items-center justify-center">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 bg-black/50"></div> from <div class="fixed inset-0 z-50 flex items-center justify-center">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    531 × waiting for element to be visible, enabled and stable
        - element is visible, enabled and stable
        - scrolling into view if needed
        - done scrolling
        - <div class="fixed inset-0 bg-black/50"></div> from <div class="fixed inset-0 z-50 flex items-center justify-center">…</div> subtree intercepts pointer events
      - retrying click action
        - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - generic [ref=e6]:
            - img "HedgeHog Logo" [ref=e7]
            - generic [ref=e8]: HedgeHog
          - button "Collapse sidebar" [ref=e9] [cursor=pointer]:
            - img [ref=e10]
        - button "TMT" [ref=e14] [cursor=pointer]:
          - generic [ref=e15]:
            - img [ref=e16]
            - generic "TMT" [ref=e18]
          - img [ref=e19]
        - navigation [ref=e21]:
          - button "Test Plans" [ref=e22] [cursor=pointer]:
            - img [ref=e23]
            - generic [ref=e26]: Test Plans
          - button "Modules" [ref=e27] [cursor=pointer]:
            - img [ref=e28]
            - generic [ref=e32]: Modules
          - button "Requirements" [ref=e33] [cursor=pointer]:
            - img [ref=e34]
            - generic [ref=e36]: Requirements
          - button "Test Repository" [ref=e37] [cursor=pointer]:
            - img [ref=e38]
            - generic [ref=e41]: Test Repository
          - button "Defects" [ref=e42] [cursor=pointer]:
            - img [ref=e43]
            - generic [ref=e52]: Defects
          - button "Test Lab" [ref=e53] [cursor=pointer]:
            - img [ref=e54]
            - generic [ref=e56]: Test Lab
          - button "Reports" [ref=e57] [cursor=pointer]:
            - img [ref=e58]
            - generic [ref=e59]: Reports
      - generic [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e63]:
            - img [ref=e64]
            - heading "Requirements" [level=2] [ref=e66]
          - generic [ref=e67]:
            - button "Open search" [ref=e68] [cursor=pointer]:
              - img [ref=e69]
            - button "Notifications" [ref=e72] [cursor=pointer]:
              - img [ref=e73]
            - button "Updated User admin@hedgehog.com" [ref=e76] [cursor=pointer]:
              - img [ref=e78]
              - generic [ref=e82]:
                - paragraph [ref=e83]: Updated User
                - paragraph [ref=e84]: admin@hedgehog.com
              - img [ref=e85]
        - main [ref=e87]:
          - generic [ref=e90]:
            - generic [ref=e92]:
              - button "Back" [ref=e93] [cursor=pointer]:
                - img [ref=e94]
                - text: Back
              - heading "Create New Requirement" [level=1] [ref=e96]
            - generic [ref=e97]:
              - generic [ref=e98]:
                - heading "Basic Information" [level=3] [ref=e100]
                - generic [ref=e101]:
                  - generic [ref=e102]:
                    - text: Name *
                    - textbox "Name *" [ref=e103]:
                      - /placeholder: Enter requirement name
                      - text: BVA-010 Req 1790151406429
                    - button "Improve with AI" [ref=e105] [cursor=pointer]:
                      - img [ref=e106]
                      - text: Improve with AI
                  - generic [ref=e109]:
                    - text: Summary
                    - textbox "Summary" [ref=e110]:
                      - /placeholder: Brief summary of the requirement
                    - button "Improve with AI" [ref=e112] [cursor=pointer]:
                      - img [ref=e113]
                      - text: Improve with AI
                  - generic [ref=e116]:
                    - text: Description *
                    - textbox "Description *" [active] [ref=e117]:
                      - /placeholder: Detailed description of the requirement
                      - text: D
                    - button "Improve with AI" [ref=e119] [cursor=pointer]:
                      - img [ref=e120]
                      - text: Improve with AI
              - generic [ref=e123]:
                - heading "Classification" [level=3] [ref=e125]
                - generic [ref=e126]:
                  - generic [ref=e127]:
                    - generic [ref=e128]:
                      - text: Type
                      - combobox "Type" [ref=e129]:
                        - option "Use Case"
                        - option "User Story" [selected]
                        - option "Other"
                    - generic [ref=e130]:
                      - text: Priority
                      - combobox "Priority" [ref=e131]:
                        - option "Select Priority" [selected]
                        - option "High"
                        - option "Medium"
                        - option "Low"
                    - generic [ref=e132]:
                      - text: Status
                      - combobox "Status" [ref=e133]:
                        - option "Draft" [selected]
                        - option "Review"
                        - option "Approved"
                        - option "Implemented"
                        - option "Verified"
                        - option "Rejected"
                    - generic [ref=e134]:
                      - text: Assignee
                      - button "Change assignee" [ref=e136] [cursor=pointer]:
                        - generic [ref=e137]: Unassigned
                        - img [ref=e138]
                  - generic [ref=e141]:
                    - text: Module
                    - combobox [ref=e142] [cursor=pointer]:
                      - generic: No module
                      - img [ref=e143]
                    - combobox [ref=e145]
                  - generic [ref=e146]:
                    - text: Labels
                    - textbox "Labels" [ref=e147]:
                      - /placeholder: Comma-separated labels (e.g., frontend, backend, urgent)
              - generic [ref=e148]:
                - heading "Attachments (0)" [level=3] [ref=e150]:
                  - img [ref=e151]
                  - text: Attachments (0)
                - generic [ref=e154]:
                  - generic [ref=e155] [cursor=pointer]:
                    - img [ref=e157]
                    - generic [ref=e160]:
                      - paragraph [ref=e161]: Drag & drop files here
                      - paragraph [ref=e162]: or click to browse
                    - generic [ref=e163]: Max 10 MB per file
                  - generic [ref=e164]:
                    - img [ref=e165]
                    - paragraph [ref=e167]: No attachments
              - generic [ref=e168]:
                - heading "Linked Items (0) Link Item" [level=3] [ref=e170]:
                  - generic [ref=e171]:
                    - img [ref=e172]
                    - text: Linked Items (0)
                  - button "Link Item" [ref=e175] [cursor=pointer]:
                    - img [ref=e176]
                    - text: Link Item
                - generic [ref=e180]:
                  - img [ref=e181]
                  - paragraph [ref=e184]: No linked items
                  - button "Link Item" [ref=e185] [cursor=pointer]:
                    - img [ref=e186]
                    - text: Link Item
              - generic [ref=e189]:
                - button "Cancel" [ref=e190] [cursor=pointer]
                - button "Create Requirement" [ref=e191] [cursor=pointer]:
                  - img [ref=e192]
                  - text: Create Requirement
  - generic [ref=e196]:
    - img [ref=e198]
    - button "Open Tanstack query devtools" [ref=e246] [cursor=pointer]:
      - img [ref=e247]
  - button "Open Next.js Dev Tools" [ref=e300] [cursor=pointer]:
    - img [ref=e301]
  - alert [ref=e304]: HedgeHog - Quality Issue Resolution & Analysis
  - generic [ref=e308]:
    - generic [ref=e311]:
      - heading "Unsaved Changes" [level=2] [ref=e312]
      - paragraph [ref=e313]: You have unsaved changes. Are you sure you want to exit without saving?
    - generic [ref=e314]:
      - button "Stay" [ref=e315] [cursor=pointer]
      - button "Exit Without Saving" [ref=e316] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | 
  3   | const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  4   | const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
  5   | 
  6   | test.describe('Boundary Value Analysis (BVA) limits', () => {
  7   | 
  8   |   test('BVA-015: Test Cycle startDate after endDate is rejected', async ({ page }) => {
  9   |     await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab`)
  10  |     await expect(page.getByRole('heading', { name: 'Test Lab' })).toBeVisible({ timeout: 30_000 })
  11  | 
  12  |     // Switch to Cycles tab
  13  |     await page.getByRole('button', { name: 'Cycles', exact: true }).click()
  14  |     await expect(page.getByText('Select a cycle or run')).toBeVisible({ timeout: 15_000 })
  15  | 
  16  |     // Click tree header New Cycle button
  17  |     await page.locator('button[title="New Cycle"]').first().click()
  18  |     await expect(page.getByRole('heading', { name: 'New Cycle' })).toBeVisible({ timeout: 10_000 })
  19  | 
  20  |     // Fill start date as after end date
  21  |     await page.locator('#cname').fill('Boundary Cycle Date')
  22  |     await page.locator('#cstart').fill('2026-08-01')
  23  |     await page.locator('#cend').fill('2026-07-01') // End date is before start date
  24  | 
  25  |     // Submit
  26  |     await page.getByRole('button', { name: 'Create', exact: true }).click()
  27  | 
  28  |     // Assert date range validation check (Toast or inline error message)
  29  |     await expect(page.getByText(/End date must be after start date/i).or(page.getByText(/Invalid date range/i))).toBeVisible({ timeout: 15_000 })
  30  | 
  31  |     // Cancel modal
  32  |     await page.getByRole('button', { name: 'Cancel' }).click()
  33  |   })
  34  | 
  35  |   test('BVA-010: Requirement title blank rejected, 1-character description succeeds', async ({ page }) => {
  36  |     // Navigate to requirements list
  37  |     await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/requirements`)
  38  |     await expect(page.getByRole('heading', { name: 'Requirements' }).first()).toBeVisible({ timeout: 30_000 })
  39  | 
  40  |     // Open create requirement view
  41  |     await page.getByRole('button', { name: 'Create Requirement' }).click()
  42  |     await expect(page.getByText('Basic Information').first()).toBeVisible({ timeout: 10_000 })
  43  | 
  44  |     // Enter valid Name, but blank Description (test field validations)
  45  |     const uniqueId = Date.now()
  46  |     const tempName = `BVA-010 Req ${uniqueId}`
  47  |     await page.locator('#name').fill(tempName)
  48  |     await page.locator('#description').fill('') // blank description
  49  | 
  50  |     // Click submit
  51  |     await page.getByRole('button', { name: 'Create Requirement', exact: true }).click()
  52  | 
  53  |     // Assert that description error validation is shown
  54  |     await expect(page.getByText('Description is required')).toBeVisible({ timeout: 10_000 })
  55  | 
  56  |     // Fill valid 1-character description
  57  |     await page.locator('#description').fill('D')
> 58  |     await page.getByRole('button', { name: 'Create Requirement', exact: true }).click()
      |                                                                                 ^ Error: locator.click: Test timeout of 300000ms exceeded.
  59  | 
  60  |     // Assert that creation succeeds and redirects back to requirements list
  61  |     await expect(page.getByRole('heading', { name: 'Requirements' }).first()).toBeVisible({ timeout: 20_000 })
  62  | 
  63  |     // Search and verify requirement is listed
  64  |     const searchInput = page.getByPlaceholder('Search requirements...')
  65  |     await searchInput.fill(tempName)
  66  |     await searchInput.press('Enter')
  67  |     await expect(page.locator('tbody').getByText(tempName)).toBeVisible({ timeout: 15_000 })
  68  | 
  69  |     // Cleanup: Delete the requirement
  70  |     const row = page.locator('tbody tr').filter({ hasText: tempName }).first()
  71  |     await row.getByTitle('Delete requirement').click()
  72  |     await page.getByRole('button', { name: 'Delete', exact: true }).last().click()
  73  |     await expect(page.locator('tbody').getByText(tempName)).not.toBeVisible({ timeout: 10_000 })
  74  |   })
  75  | 
  76  |   test('BVA-021: 0-byte attachment is rejected, 1-byte attachment succeeds', async ({ page }) => {
  77  |     // Navigate to requirements list
  78  |     await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/requirements`)
  79  |     await expect(page.getByRole('heading', { name: 'Requirements' }).first()).toBeVisible({ timeout: 30_000 })
  80  | 
  81  |     // Click on the first requirement link in the table to open its detail view
  82  |     const reqLink = page.locator('tbody tr').first().locator('td').nth(1).getByRole('button').first()
  83  |     await expect(reqLink).toBeVisible({ timeout: 15_000 })
  84  |     await reqLink.click()
  85  | 
  86  |     // Expect the detail view to be open (contains Attachment panel title)
  87  |     await expect(page.getByText('Attachments').first()).toBeVisible({ timeout: 15_000 })
  88  | 
  89  |     // Find the file input in the attachment panel
  90  |     const fileInput = page.locator('input[type="file"]')
  91  | 
  92  |     // 1. Try uploading a 0-byte file
  93  |     await fileInput.setInputFiles({
  94  |       name: 'empty.txt',
  95  |       mimeType: 'text/plain',
  96  |       buffer: Buffer.from('')
  97  |     })
  98  | 
  99  |     // Assert the warning toast
  100 |     await expect(page.getByText('"empty.txt" is empty and cannot be attached')).toBeVisible({ timeout: 10_000 })
  101 | 
  102 |     // 2. Upload a 1-byte file
  103 |     const uniqueId = Date.now()
  104 |     const fileName = `valid-${uniqueId}.txt`
  105 |     await fileInput.setInputFiles({
  106 |       name: fileName,
  107 |       mimeType: 'text/plain',
  108 |       buffer: Buffer.from('a')
  109 |     })
  110 | 
  111 |      // Wait for the selected file preview to show, then click the upload button
  112 |     await expect(page.getByText(fileName)).toBeVisible({ timeout: 10_000 })
  113 |     const previewContainer = page.locator('div.bg-blue-50').filter({ hasText: fileName }).first()
  114 |     await previewContainer.getByRole('button').first().click() // Click the upload button
  115 |  
  116 |     // Wait for upload to complete and the preview container to disappear
  117 |     await expect(previewContainer).not.toBeVisible({ timeout: 15_000 })
  118 |  
  119 |     // Assert that the file is added successfully to the live attachments list
  120 |     await expect(page.getByText(fileName)).toBeVisible({ timeout: 10_000 })
  121 |  
  122 |     // Cleanup: Delete the attachment
  123 |     const attachmentRow = page.locator('div.border.rounded-lg').filter({ hasText: fileName }).first()
  124 |     await attachmentRow.locator('button').last().click() // trash icon button (last button is trash, first is download)
  125 |     
  126 |     // Click Delete in the confirmation dialog
  127 |     await page.getByRole('button', { name: 'Delete', exact: true }).last().click()
  128 |     
  129 |     await expect(page.getByText(fileName)).not.toBeVisible({ timeout: 10_000 })
  130 |   })
  131 | })
  132 | 
```