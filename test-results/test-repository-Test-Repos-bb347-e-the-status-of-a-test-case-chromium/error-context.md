# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-repository.spec.ts >> Test Repository E2E >> Test Case – Inline Status Change >> can change the status of a test case
- Location: tests\test-repository.spec.ts:99:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('select').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('select').first()

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
  - heading "Test Repository" [level=2]
  - button "Open search"
  - button "Notifications (1 unread)"
  - button "Updated User admin@hedgehog.com":
    - paragraph: Updated User
    - paragraph: admin@hedgehog.com
  - main:
    - paragraph: Resource not found
    - button "Back"
    - button "Try Again"
- button "Open Tanstack query devtools":
  - img
- alert
```

# Test source

```ts
  14  |   test.describe('Test Case – Create', () => {
  15  |     test('navigates to the create form', async () => {
  16  |       await testRepositoryPage.gotoCreate()
  17  |       await expect(testRepositoryPage.headingCreateNewTestCase).toBeVisible({ timeout: 15_000 })
  18  |     })
  19  | 
  20  |     test('shows validation error when title is empty', async ({ page }) => {
  21  |       await testRepositoryPage.gotoCreate()
  22  |       await expect(testRepositoryPage.headingCreateNewTestCase).toBeVisible({ timeout: 15_000 })
  23  | 
  24  |       await testRepositoryPage.createTestCaseButton.click()
  25  |       await expect(page).toHaveURL(testRepositoryPage.createUrl)
  26  |     })
  27  | 
  28  |     test('creates a test case and redirects to list', async ({ page }) => {
  29  |       await testRepositoryPage.gotoList()
  30  |       await testRepositoryPage.waitForList()
  31  | 
  32  |       await testRepositoryPage.createNewSuite(`Default Suite ${Date.now()}`)
  33  | 
  34  |       await testRepositoryPage.gotoCreate()
  35  |       await expect(testRepositoryPage.headingCreateNewTestCase).toBeVisible({ timeout: 15_000 })
  36  | 
  37  |       const title = `E2E Test Case ${Date.now()}`
  38  |       await testRepositoryPage.createTestCase(
  39  |         title,
  40  |         'Created by Playwright E2E test',
  41  |         '1. Open the app\n2. Navigate to test cases\n3. Click create',
  42  |         'Test case is created successfully',
  43  |         'FUNCTIONAL',
  44  |         'HIGH'
  45  |       )
  46  | 
  47  |       await page.waitForURL(testRepositoryPage.listUrl, { timeout: 15_000 })
  48  |       await expect(page).toHaveURL(testRepositoryPage.listUrl)
  49  |     })
  50  |   })
  51  | 
  52  |   test.describe('Test Case – Detail View', () => {
  53  |     test('shows the test cases table', async () => {
  54  |       await testRepositoryPage.gotoList()
  55  |       await testRepositoryPage.waitForList()
  56  |       await expect(testRepositoryPage.searchInput).toBeVisible()
  57  |     })
  58  | 
  59  |     test('opens detail view when clicking a test case title', async ({ page }) => {
  60  |       await testRepositoryPage.gotoList()
  61  |       await testRepositoryPage.waitForList()
  62  | 
  63  |       const titleBtn = testRepositoryPage.firstTitleButton
  64  |       const hasCases = await titleBtn.isVisible().catch(() => false)
  65  | 
  66  |       if (!hasCases) {
  67  |         test.skip(true, 'No test cases in project — skipping detail view test')
  68  |         return
  69  |       }
  70  | 
  71  |       await titleBtn.click()
  72  |       await page.waitForURL(/\/test-cases\/browse\//, { timeout: 15_000 })
  73  |       await expect(page).toHaveURL(/\/test-cases\/browse\//)
  74  |       await expect(testRepositoryPage.headingTestCaseDetails).toBeVisible({ timeout: 30_000 })
  75  |     })
  76  | 
  77  |     test('back button returns to the test cases list', async ({ page }) => {
  78  |       await testRepositoryPage.gotoList()
  79  |       await testRepositoryPage.waitForList()
  80  | 
  81  |       const titleBtn = testRepositoryPage.firstTitleButton
  82  |       const hasCases = await titleBtn.isVisible().catch(() => false)
  83  | 
  84  |       if (!hasCases) {
  85  |         test.skip(true, 'No test cases in project — skipping back button test')
  86  |         return
  87  |       }
  88  | 
  89  |       await titleBtn.click()
  90  |       await page.waitForURL(/\/test-cases\/browse\//, { timeout: 15_000 })
  91  | 
  92  |       await testRepositoryPage.backButton.click()
  93  |       await page.waitForURL(testRepositoryPage.listUrl, { timeout: 10_000 })
  94  |       await expect(page).toHaveURL(testRepositoryPage.listUrl)
  95  |     })
  96  |   })
  97  | 
  98  |   test.describe('Test Case – Inline Status Change', () => {
  99  |     test('can change the status of a test case', async ({ page }) => {
  100 |       await testRepositoryPage.gotoList()
  101 |       await testRepositoryPage.waitForList()
  102 | 
  103 |       const titleBtn = testRepositoryPage.firstTitleButton
  104 |       const hasCases = await titleBtn.isVisible().catch(() => false)
  105 | 
  106 |       if (!hasCases) {
  107 |         test.skip(true, 'No test cases in project — skipping status change test')
  108 |         return
  109 |       }
  110 | 
  111 |       await titleBtn.click()
  112 |       await page.waitForURL(/\/test-cases\/browse\//, { timeout: 15_000 })
  113 | 
> 114 |       await expect(testRepositoryPage.statusSelect).toBeVisible({ timeout: 10_000 })
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  115 | 
  116 |       const currentStatus = await testRepositoryPage.statusSelect.inputValue()
  117 |       const nextStatus = currentStatus === 'DRAFT' ? 'READY_FOR_REVIEW' : 'DRAFT'
  118 | 
  119 |       await testRepositoryPage.statusSelect.selectOption(nextStatus)
  120 |       await expect(testRepositoryPage.statusSelect).toHaveValue(nextStatus)
  121 |     })
  122 |   })
  123 | })
  124 | 
```