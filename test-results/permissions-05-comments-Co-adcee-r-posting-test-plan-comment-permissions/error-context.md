# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: permissions\05-comments.spec.ts >> Comments - Permissions >> S25 - API returns 403 for Viewer posting test plan comment
- Location: tests\permissions\05-comments.spec.ts:145:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 403
Received: 404
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
            - heading "Test Plans" [level=2] [ref=e67]
          - generic [ref=e68]:
            - button "Notifications" [ref=e69] [cursor=pointer]:
              - img [ref=e70]
            - button "View Only viewer@qira.com" [ref=e73] [cursor=pointer]:
              - img [ref=e75]
              - generic [ref=e79]:
                - paragraph [ref=e80]: View Only
                - paragraph [ref=e81]: viewer@qira.com
              - img [ref=e82]
        - main [ref=e84]:
          - generic [ref=e87]:
            - generic [ref=e88]:
              - generic [ref=e89]:
                - generic [ref=e90]: Total Plans
                - generic [ref=e91]:
                  - generic [ref=e92]: "68"
                  - img [ref=e94]
              - generic [ref=e97]:
                - generic [ref=e98]: Draft
                - generic [ref=e99]:
                  - generic [ref=e100]: "45"
                  - img [ref=e102]
              - generic [ref=e105]:
                - generic [ref=e106]: In Review
                - generic [ref=e107]:
                  - generic [ref=e108]: "3"
                  - img [ref=e110]
              - generic [ref=e113]:
                - generic [ref=e114]: Approved
                - generic [ref=e115]:
                  - generic [ref=e116]: "0"
                  - img [ref=e118]
              - generic [ref=e121]:
                - generic [ref=e122]: Active
                - generic [ref=e123]:
                  - generic [ref=e124]: "19"
                  - img [ref=e126]
              - generic [ref=e128]:
                - generic [ref=e129]: Completed
                - generic [ref=e130]:
                  - generic [ref=e131]: "1"
                  - img [ref=e133]
            - generic [ref=e137]:
              - generic [ref=e139]:
                - generic [ref=e141]: Test Plans
                - generic [ref=e142]:
                  - generic [ref=e143]:
                    - img [ref=e144]
                    - textbox "Search test plans..." [ref=e147]
                  - generic [ref=e148]:
                    - button "Status" [ref=e150] [cursor=pointer]:
                      - generic [ref=e151]: Status
                      - img [ref=e152]
                    - button "Owner" [ref=e154] [cursor=pointer]:
                      - generic [ref=e155]: Owner
                      - img [ref=e156]
                    - button "Date:" [ref=e159] [cursor=pointer]:
                      - img [ref=e160]
                      - generic [ref=e162]: "Date:"
                    - button "Open table options" [ref=e163] [cursor=pointer]:
                      - img [ref=e164]
              - table [ref=e167]:
                - rowgroup [ref=e168]:
                  - row "Select all test plans Name Description Status OWNER Start End SUITES RUNS" [ref=e169]:
                    - columnheader "Select all test plans" [ref=e170]:
                      - checkbox "Select all test plans" [ref=e171]
                    - columnheader "Name" [ref=e172]:
                      - button "Name" [ref=e174] [cursor=pointer]:
                        - generic [ref=e175]: Name
                        - img [ref=e177]
                      - generic "Drag to resize" [ref=e180]
                    - columnheader "Description" [ref=e182]:
                      - button "Description" [ref=e184] [cursor=pointer]:
                        - generic [ref=e185]: Description
                        - img [ref=e187]
                      - generic "Drag to resize" [ref=e190]
                    - columnheader "Status" [ref=e192]:
                      - button "Status" [ref=e194] [cursor=pointer]:
                        - generic [ref=e195]: Status
                        - img [ref=e197]
                      - generic "Drag to resize" [ref=e200]
                    - columnheader "OWNER" [ref=e202]:
                      - generic [ref=e203]: OWNER
                      - generic "Drag to resize" [ref=e204]
                    - columnheader "Start" [ref=e206]:
                      - button "Start" [ref=e208] [cursor=pointer]:
                        - generic [ref=e209]: Start
                        - img [ref=e211]
                      - generic "Drag to resize" [ref=e214]
                    - columnheader "End" [ref=e216]:
                      - button "End" [ref=e218] [cursor=pointer]:
                        - generic [ref=e219]: End
                        - img [ref=e221]
                      - generic "Drag to resize" [ref=e224]
                    - columnheader "SUITES" [ref=e226]:
                      - generic [ref=e227]: SUITES
                      - generic "Drag to resize" [ref=e228]
                    - columnheader "RUNS" [ref=e230]:
                      - generic [ref=e231]: RUNS
                      - generic "Drag to resize" [ref=e232]
                - rowgroup [ref=e234]:
                  - row "Select test plan cmt1nrkyr01rqugkct6yc0fs2 Plan Exit 1787238679621 No description ACTIVE Updated User Not set Not set 0 1" [ref=e235] [cursor=pointer]:
                    - cell "Select test plan cmt1nrkyr01rqugkct6yc0fs2" [ref=e236]:
                      - checkbox "Select test plan cmt1nrkyr01rqugkct6yc0fs2" [ref=e238]
                    - cell "Plan Exit 1787238679621" [ref=e239]:
                      - button "Plan Exit 1787238679621" [ref=e242]
                    - cell "No description" [ref=e243]:
                      - generic "No description" [ref=e245]
                    - cell "ACTIVE" [ref=e246]:
                      - generic [ref=e248]: ACTIVE
                    - cell "Updated User" [ref=e249]:
                      - generic [ref=e252]: Updated User
                    - cell "Not set" [ref=e253]:
                      - generic [ref=e254]: Not set
                    - cell "Not set" [ref=e255]:
                      - generic [ref=e256]: Not set
                    - cell "0" [ref=e257]:
                      - generic [ref=e258]: "0"
                    - cell "1" [ref=e259]:
                      - generic [ref=e260]: "1"
                  - row "Select test plan cmt1m4f6w019cugkcprdtn3oh Plan Exit 1787235909534 No description ACTIVE Updated User Not set Not set 0 1" [ref=e261] [cursor=pointer]:
                    - cell "Select test plan cmt1m4f6w019cugkcprdtn3oh" [ref=e262]:
                      - checkbox "Select test plan cmt1m4f6w019cugkcprdtn3oh" [ref=e264]
                    - cell "Plan Exit 1787235909534" [ref=e265]:
                      - button "Plan Exit 1787235909534" [ref=e268]
                    - cell "No description" [ref=e269]:
                      - generic "No description" [ref=e271]
                    - cell "ACTIVE" [ref=e272]:
                      - generic [ref=e274]: ACTIVE
                    - cell "Updated User" [ref=e275]:
                      - generic [ref=e278]: Updated User
                    - cell "Not set" [ref=e279]:
                      - generic [ref=e280]: Not set
                    - cell "Not set" [ref=e281]:
                      - generic [ref=e282]: Not set
                    - cell "0" [ref=e283]:
                      - generic [ref=e284]: "0"
                    - cell "1" [ref=e285]:
                      - generic [ref=e286]: "1"
                  - row "Select test plan cmt1jakwi00q8ugkcj7j4oe4j E2E Test Plan 1787231161663 No description DRAFT Updated User Not set Not set 0 0" [ref=e287] [cursor=pointer]:
                    - cell "Select test plan cmt1jakwi00q8ugkcj7j4oe4j" [ref=e288]:
                      - checkbox "Select test plan cmt1jakwi00q8ugkcj7j4oe4j" [ref=e290]
                    - cell "E2E Test Plan 1787231161663" [ref=e291]:
                      - button "E2E Test Plan 1787231161663" [ref=e294]
                    - cell "No description" [ref=e295]:
                      - generic "No description" [ref=e297]
                    - cell "DRAFT" [ref=e298]:
                      - generic [ref=e300]: DRAFT
                    - cell "Updated User" [ref=e301]:
                      - generic [ref=e304]: Updated User
                    - cell "Not set" [ref=e305]:
                      - generic [ref=e306]: Not set
                    - cell "Not set" [ref=e307]:
                      - generic [ref=e308]: Not set
                    - cell "0" [ref=e309]:
                      - generic [ref=e310]: "0"
                    - cell "0" [ref=e311]:
                      - generic [ref=e312]: "0"
                  - row "Select test plan cmt1g6hra00dmugkc7smgeo3f E2E Test Plan 1787225929839 No description DRAFT Updated User Not set Not set 0 0" [ref=e313] [cursor=pointer]:
                    - cell "Select test plan cmt1g6hra00dmugkc7smgeo3f" [ref=e314]:
                      - checkbox "Select test plan cmt1g6hra00dmugkc7smgeo3f" [ref=e316]
                    - cell "E2E Test Plan 1787225929839" [ref=e317]:
                      - button "E2E Test Plan 1787225929839" [ref=e320]
                    - cell "No description" [ref=e321]:
                      - generic "No description" [ref=e323]
                    - cell "DRAFT" [ref=e324]:
                      - generic [ref=e326]: DRAFT
                    - cell "Updated User" [ref=e327]:
                      - generic [ref=e330]: Updated User
                    - cell "Not set" [ref=e331]:
                      - generic [ref=e332]: Not set
                    - cell "Not set" [ref=e333]:
                      - generic [ref=e334]: Not set
                    - cell "0" [ref=e335]:
                      - generic [ref=e336]: "0"
                    - cell "0" [ref=e337]:
                      - generic [ref=e338]: "0"
                  - row "Select test plan cmt1g5d2m00daugkc7h57ln5d Plan Exit 1787225879903 No description ACTIVE Updated User Not set Not set 0 1" [ref=e339] [cursor=pointer]:
                    - cell "Select test plan cmt1g5d2m00daugkc7h57ln5d" [ref=e340]:
                      - checkbox "Select test plan cmt1g5d2m00daugkc7h57ln5d" [ref=e342]
                    - cell "Plan Exit 1787225879903" [ref=e343]:
                      - button "Plan Exit 1787225879903" [ref=e346]
                    - cell "No description" [ref=e347]:
                      - generic "No description" [ref=e349]
                    - cell "ACTIVE" [ref=e350]:
                      - generic [ref=e352]: ACTIVE
                    - cell "Updated User" [ref=e353]:
                      - generic [ref=e356]: Updated User
                    - cell "Not set" [ref=e357]:
                      - generic [ref=e358]: Not set
                    - cell "Not set" [ref=e359]:
                      - generic [ref=e360]: Not set
                    - cell "0" [ref=e361]:
                      - generic [ref=e362]: "0"
                    - cell "1" [ref=e363]:
                      - generic [ref=e364]: "1"
              - generic [ref=e365]:
                - generic [ref=e366]:
                  - paragraph [ref=e367]:
                    - generic [ref=e368]: 1–5
                    - text: of 68 results
                  - combobox [ref=e369] [cursor=pointer]:
                    - option "5 / page" [selected]
                    - option "10 / page"
                    - option "15 / page"
                    - option "20 / page"
                    - option "50 / page"
                - navigation "Pagination" [ref=e370]:
                  - link "Prev" [disabled]:
                    - /url: /app/TMTT/test-plans?page=0
                    - img
                    - text: Prev
                  - generic [ref=e372]:
                    - link "1" [ref=e373] [cursor=pointer]:
                      - /url: /app/TMTT/test-plans?page=1
                    - link "2" [ref=e374] [cursor=pointer]:
                      - /url: /app/TMTT/test-plans?page=2
                    - generic [ref=e375]: ···
                    - link "14" [ref=e376] [cursor=pointer]:
                      - /url: /app/TMTT/test-plans?page=14
                  - link "Next" [ref=e378] [cursor=pointer]:
                    - /url: /app/TMTT/test-plans?page=2
                    - text: Next
                    - img [ref=e379]
  - generic [ref=e381]:
    - img [ref=e383]
    - button "Open Tanstack query devtools" [ref=e431] [cursor=pointer]:
      - img [ref=e432]
  - generic [ref=e484] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e485]:
      - img [ref=e486]
    - generic [ref=e489]:
      - button "Open issues overlay" [ref=e490]:
        - generic [ref=e491]:
          - generic [ref=e492]: "0"
          - generic [ref=e493]: "1"
        - generic [ref=e494]: Issue
      - button "Collapse issues badge" [ref=e495]:
        - img [ref=e496]
  - alert [ref=e498]
```

# Test source

```ts
  58  | 
  59  | 
  60  | test.describe('Comments - Permissions', () => {
  61  |   // Scenario 21: QA Tester can navigate to a defect detail with comments
  62  |   test('S21 - QA Tester can view defect detail with comment section', async ({ page }) => {
  63  |     await loginAs(page, 'qa_tester')
  64  |     await ensureDefectExists(page)
  65  |     await page.goto(projectUrl('defects'))
  66  | 
  67  |     // Wait for the table to render
  68  |     await expect(page.locator('table')).toBeVisible({ timeout: 15_000 })
  69  | 
  70  |     // Find and click the first defect title
  71  |     const firstDefectBtn = page.locator('tbody tr td button').first()
  72  |     await expect(firstDefectBtn).toBeVisible({ timeout: 10_000 })
  73  |     await firstDefectBtn.click()
  74  | 
  75  |     // Wait for the detail page URL
  76  |     await page.waitForURL(/defects\/browse/, { timeout: 15_000 })
  77  | 
  78  |     // Wait for defect detail to load — the "Back" button and defect summary are always present
  79  |     await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({ timeout: 15_000 })
  80  | 
  81  |     // Wait for the Comments card to render (it loads with the defect data)
  82  |     await expect(page.locator('text=Comments (')).toBeVisible({ timeout: 15_000 })
  83  |   })
  84  | 
  85  |   // Scenario 22: Viewer can also view defect detail
  86  |   test('S22 - Viewer can navigate to defect detail page', async ({ page }) => {
  87  |     // Ensure the defect is created using a QA Tester context first
  88  |     await loginAs(page, 'qa_tester')
  89  |     await ensureDefectExists(page)
  90  | 
  91  |     // Now log in as viewer for the actual verification
  92  |     await loginAs(page, 'viewer')
  93  |     await page.goto(projectUrl('defects'))
  94  | 
  95  |     await expect(page.locator('table')).toBeVisible({ timeout: 15_000 })
  96  | 
  97  |     const firstDefectBtn = page.locator('tbody tr td button').first()
  98  |     await expect(firstDefectBtn).toBeVisible({ timeout: 10_000 })
  99  | 
  100 |     await firstDefectBtn.click()
  101 |     await page.waitForURL(/defects\/browse/, { timeout: 15_000 })
  102 | 
  103 |     // Wait for defect detail to load
  104 |     await expect(page.getByRole('button', { name: 'Back' })).toBeVisible({ timeout: 15_000 })
  105 | 
  106 |     // Wait for the Comments card
  107 |     await expect(page.locator('text=Comments (')).toBeVisible({ timeout: 15_000 })
  108 |   })
  109 | 
  110 |   // Scenario 23: API enforcement - comments.create on defect
  111 |   test('S23 - API returns 403 for Viewer posting defect comment', async ({ page }) => {
  112 |     await loginAs(page, 'viewer')
  113 | 
  114 |     const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
  115 | 
  116 |     const response = await page.request.post(`${API_URL}/api/v1/defects/fake-id/comments`, {
  117 |       headers: {
  118 |         Authorization: `Bearer ${accessToken}`,
  119 |         'Content-Type': 'application/json',
  120 |       },
  121 |       data: { content: 'Viewer should not be able to post this' },
  122 |     })
  123 | 
  124 |     expect(response.status()).toBe(403)
  125 |   })
  126 | 
  127 |   // Scenario 24: API enforcement - comments.create on test case
  128 |   test('S24 - API returns 403 for Viewer posting test case comment', async ({ page }) => {
  129 |     await loginAs(page, 'viewer')
  130 | 
  131 |     const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
  132 | 
  133 |     const response = await page.request.post(`${API_URL}/api/v1/test-cases/fake-id/comments`, {
  134 |       headers: {
  135 |         Authorization: `Bearer ${accessToken}`,
  136 |         'Content-Type': 'application/json',
  137 |       },
  138 |       data: { content: 'Should be blocked' },
  139 |     })
  140 | 
  141 |     expect(response.status()).toBe(403)
  142 |   })
  143 | 
  144 |   // Scenario 25: API enforcement - comments.create on test plan
  145 |   test('S25 - API returns 403 for Viewer posting test plan comment', async ({ page }) => {
  146 |     await loginAs(page, 'viewer')
  147 | 
  148 |     const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))
  149 | 
  150 |     const response = await page.request.post(`${API_URL}/api/v1/test-plans/fake-id/comments`, {
  151 |       headers: {
  152 |         Authorization: `Bearer ${accessToken}`,
  153 |         'Content-Type': 'application/json',
  154 |       },
  155 |       data: { content: 'Should be blocked' },
  156 |     })
  157 | 
> 158 |     expect(response.status()).toBe(403)
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  159 |   })
  160 | })
  161 | 
```