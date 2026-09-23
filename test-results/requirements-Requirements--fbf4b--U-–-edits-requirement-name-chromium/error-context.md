# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: requirements.spec.ts >> Requirements – CRUD & Details >> U – edits requirement name
- Location: tests\requirements.spec.ts:51:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://127.0.0.1:3000/app/TMTT/requirements" until "load"
============================================================
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
            - button "Notifications (1 unread)" [ref=e72] [cursor=pointer]:
              - img [ref=e73]
              - generic [ref=e76]: "1"
            - button "Updated User admin@hedgehog.com" [ref=e77] [cursor=pointer]:
              - img [ref=e79]
              - generic [ref=e83]:
                - paragraph [ref=e84]: Updated User
                - paragraph [ref=e85]: admin@hedgehog.com
              - img [ref=e86]
        - main [ref=e88]:
          - generic [ref=e91]:
            - generic [ref=e93]:
              - button "Back" [ref=e94] [cursor=pointer]:
                - img [ref=e95]
                - text: Back
              - heading "Edit Requirement" [level=1] [ref=e97]
            - generic [ref=e98]:
              - generic [ref=e99]:
                - heading "Basic Information" [level=3] [ref=e101]
                - generic [ref=e102]:
                  - generic [ref=e103]:
                    - text: Name *
                    - textbox "Name *" [ref=e104]:
                      - /placeholder: Enter requirement name
                      - text: E2E Requirement 1790152064350 [Edited]
                    - button "Improve with AI" [ref=e106] [cursor=pointer]:
                      - img [ref=e107]
                      - text: Improve with AI
                  - generic [ref=e110]:
                    - text: Summary
                    - textbox "Summary" [ref=e111]:
                      - /placeholder: Brief summary of the requirement
                    - button "Improve with AI" [ref=e113] [cursor=pointer]:
                      - img [ref=e114]
                      - text: Improve with AI
                  - generic [ref=e117]:
                    - text: Description *
                    - textbox "Description *" [active] [invalid] [ref=e118]:
                      - /placeholder: Detailed description of the requirement
                    - button "Improve with AI" [ref=e120] [cursor=pointer]:
                      - img [ref=e121]
                      - text: Improve with AI
                    - paragraph [ref=e124]: Description is required
              - generic [ref=e125]:
                - heading "Classification" [level=3] [ref=e127]
                - generic [ref=e128]:
                  - generic [ref=e129]:
                    - generic [ref=e130]:
                      - text: Type
                      - combobox "Type" [ref=e131]:
                        - option "Use Case"
                        - option "User Story" [selected]
                        - option "Other"
                    - generic [ref=e132]:
                      - text: Priority
                      - combobox "Priority" [ref=e133]:
                        - option "Select Priority" [selected]
                        - option "High"
                        - option "Medium"
                        - option "Low"
                    - generic [ref=e134]:
                      - text: Status
                      - combobox "Status" [ref=e135]:
                        - option "Draft" [selected]
                        - option "Review"
                        - option "Approved"
                        - option "Implemented"
                        - option "Verified"
                        - option "Rejected"
                    - generic [ref=e136]:
                      - text: Assignee
                      - button "Change assignee" [ref=e138] [cursor=pointer]:
                        - generic [ref=e139]: Unassigned
                        - img [ref=e140]
                  - generic [ref=e143]:
                    - text: Module
                    - combobox [ref=e144] [cursor=pointer]:
                      - generic: No module
                      - img [ref=e145]
                    - combobox [ref=e147]
                  - generic [ref=e148]:
                    - text: Labels
                    - textbox "Labels" [ref=e149]:
                      - /placeholder: Comma-separated labels (e.g., frontend, backend, urgent)
              - generic [ref=e150]:
                - heading "Attachments (0)" [level=3] [ref=e152]:
                  - img [ref=e153]
                  - text: Attachments (0)
                - generic [ref=e156]:
                  - generic [ref=e157] [cursor=pointer]:
                    - img [ref=e159]
                    - generic [ref=e162]:
                      - paragraph [ref=e163]: Drag & drop files here
                      - paragraph [ref=e164]: or click to browse
                    - generic [ref=e165]: Max 10 MB per file
                  - generic [ref=e166]:
                    - img [ref=e167]
                    - paragraph [ref=e169]: No attachments
              - generic [ref=e170]:
                - heading "Linked Items (0) Link Item" [level=3] [ref=e172]:
                  - generic [ref=e173]:
                    - img [ref=e174]
                    - text: Linked Items (0)
                  - button "Link Item" [ref=e177] [cursor=pointer]:
                    - img [ref=e178]
                    - text: Link Item
                - generic [ref=e182]:
                  - img [ref=e183]
                  - paragraph [ref=e186]: No linked items
                  - button "Link Item" [ref=e187] [cursor=pointer]:
                    - img [ref=e188]
                    - text: Link Item
              - generic [ref=e191]:
                - button "Cancel" [ref=e192] [cursor=pointer]
                - button "Update Requirement" [ref=e193] [cursor=pointer]:
                  - img [ref=e194]
                  - text: Update Requirement
  - generic [ref=e198]:
    - img [ref=e200]
    - button "Open Tanstack query devtools" [ref=e248] [cursor=pointer]:
      - img [ref=e249]
  - generic [ref=e301] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e302]:
      - img [ref=e303]
    - generic [ref=e306]:
      - button "Open issues overlay" [ref=e307]:
        - generic [ref=e308]:
          - generic [ref=e309]: "1"
          - generic [ref=e310]: "2"
        - generic [ref=e311]:
          - text: Issue
          - generic [ref=e312]: s
      - button "Collapse issues badge" [ref=e313]:
        - img [ref=e314]
  - alert [ref=e316]
  - generic [ref=e320]:
    - generic [ref=e323]:
      - heading "Unsaved Changes" [level=2] [ref=e324]
      - paragraph [ref=e325]: You have unsaved changes. Are you sure you want to exit without saving?
    - generic [ref=e326]:
      - button "Stay" [ref=e327] [cursor=pointer]
      - button "Exit Without Saving" [ref=e328] [cursor=pointer]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | import { RequirementsPage } from '../pages/RequirementsPage'
  3  | 
  4  | const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  5  | const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
  6  | 
  7  | let createdName = ''
  8  | 
  9  | test.describe.serial('Requirements – CRUD & Details', () => {
  10 |   let requirementsPage: RequirementsPage
  11 | 
  12 |   test.beforeEach(async ({ page }) => {
  13 |     requirementsPage = new RequirementsPage(page, PROJECT_KEY, BASE_URL)
  14 |   })
  15 | 
  16 |   test('C – creates a requirement via create form', async ({ page }) => {
  17 |     createdName = `E2E Requirement ${Date.now()}`
  18 | 
  19 |     await requirementsPage.gotoCreate()
  20 |     await expect(requirementsPage.nameInput).toBeVisible({ timeout: 20_000 })
  21 | 
  22 |     await requirementsPage.createNewRequirement(
  23 |       createdName,
  24 |       'Detailed requirement description created by E2E automation.'
  25 |     )
  26 | 
  27 |     await page.waitForURL(/\/requirements(\?|$)/, { timeout: 20_000 }).catch(async () => requirementsPage.gotoList())
  28 |     await requirementsPage.waitForListHeader()
  29 |   })
  30 | 
  31 |   test('R – requirement appears in table list and can be searched', async () => {
  32 |     test.skip(!createdName, 'Skipped — Create test did not run')
  33 | 
  34 |     await requirementsPage.gotoList()
  35 |     await requirementsPage.waitForListHeader()
  36 | 
  37 |     await requirementsPage.searchRequirement(createdName)
  38 | 
  39 |     const row = requirementsPage.getRequirementRow(createdName)
  40 |     const isVisible = await row.waitFor({ state: 'visible', timeout: 10_000 })
  41 |       .then(() => true)
  42 |       .catch(() => false)
  43 | 
  44 |     if (isVisible) {
  45 |       await expect(row).toBeVisible()
  46 |     } else {
  47 |       await expect(requirementsPage.firstRow).toBeVisible({ timeout: 10_000 })
  48 |     }
  49 |   })
  50 | 
  51 |   test('U – edits requirement name', async ({ page }) => {
  52 |     test.skip(!createdName, 'Skipped — no created name')
  53 | 
  54 |     await requirementsPage.gotoList()
  55 |     await requirementsPage.waitForListHeader()
  56 | 
  57 |     await requirementsPage.fillSearchInput(createdName)
  58 | 
  59 |     const updatedName = createdName + ' [Edited]'
  60 |     await requirementsPage.editFirstRequirement(updatedName)
  61 | 
> 62 |     await page.waitForURL(requirementsPage.listUrl, { timeout: 20_000 })
     |                ^ TimeoutError: page.waitForURL: Timeout 20000ms exceeded.
  63 |     createdName = updatedName
  64 |   })
  65 | 
  66 |   test('D – deletes requirement', async () => {
  67 |     test.skip(!createdName, 'Skipped — no created name')
  68 | 
  69 |     await requirementsPage.gotoList()
  70 |     await requirementsPage.waitForListHeader()
  71 | 
  72 |     await requirementsPage.fillSearchInput(createdName)
  73 | 
  74 |     await requirementsPage.deleteFirstRequirement()
  75 |     await expect(requirementsPage.getRequirementCell(createdName)).not.toBeVisible({ timeout: 10_000 })
  76 |   })
  77 | })
  78 | 
```