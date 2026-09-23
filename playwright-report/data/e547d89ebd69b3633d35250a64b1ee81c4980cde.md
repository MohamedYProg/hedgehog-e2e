# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: step-editor.spec.ts >> Test Case Step Editor controls >> TC-003: Add, edit, remove steps and verify sequencing shifts correctly
- Location: tests\step-editor.spec.ts:7:7

# Error details

```
Test timeout of 300000ms exceeded.
```

```
Error: expect(locator).toHaveValue(expected) failed

Locator:  locator('textarea[placeholder="Enter test step"]').first()
Expected: "Step 1 content"
Received: ""

Call log:
  - Expect "toHaveValue" with timeout 300000ms
  - waiting for locator('textarea[placeholder="Enter test step"]').first()
    549 × locator resolved to <textarea rows="2" name="steps.0.step" placeholder="Enter test step" class="w-full p-1.5 text-sm resize-none outline-none bg-transparent"></textarea>
        - unexpected value ""

```

```yaml
- textbox "Enter test step"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | 
  3  | const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  4  | const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
  5  | 
  6  | test.describe('Test Case Step Editor controls', () => {
  7  |   test('TC-003: Add, edit, remove steps and verify sequencing shifts correctly', async ({ page }) => {
  8  |     // 1. Navigate directly to create test case page
  9  |     await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-cases/create`)
  10 |     await expect(page.getByRole('heading', { name: 'Create New Test Case' })).toBeVisible({ timeout: 35_000 })
  11 | 
  12 |     const uniqueId = Date.now()
  13 |     const testCaseName = `Step Editor Test ${uniqueId}`
  14 | 
  15 |     // Fill out basic details
  16 |     await page.locator('#title').fill(testCaseName)
  17 |     
  18 |     // Select first test suite
  19 |     const suiteSelect = page.locator('#suiteId')
  20 |     await expect(suiteSelect).toBeVisible()
  21 |     await suiteSelect.selectOption({ index: 1 })
  22 | 
  23 |     // 2. Add 2 more rows to make a total of 3 steps
  24 |     const addRowBtn = page.getByRole('button', { name: 'Add Row' })
  25 |     await addRowBtn.click()
  26 |     await addRowBtn.click()
  27 | 
  28 |     // Assert that 3 steps are present
  29 |     const stepTextareas = page.locator('textarea[placeholder="Enter test step"]')
  30 |     const expectedTextareas = page.locator('textarea[placeholder="Enter expected result"]')
  31 |     await expect(stepTextareas).toHaveCount(3)
  32 | 
  33 |     // 3. Fill details for all 3 steps
  34 |     await stepTextareas.nth(0).fill('Step 1 content')
  35 |     await expectedTextareas.nth(0).fill('Expected 1')
  36 | 
  37 |     await stepTextareas.nth(1).fill('Step 2 content')
  38 |     await expectedTextareas.nth(1).fill('Expected 2')
  39 | 
  40 |     await stepTextareas.nth(2).fill('Step 3 content')
  41 |     await expectedTextareas.nth(2).fill('Expected 3')
  42 | 
  43 |     // 4. Delete the middle step (Step 2)
  44 |     const removeButtons = page.getByTitle('Remove row')
  45 |     await removeButtons.nth(1).click()
  46 | 
  47 |     // Assert that count is now 2
  48 |     await expect(stepTextareas).toHaveCount(2)
  49 | 
  50 |     // Assert that Step 3 shifted up to become the new Step 2
  51 |     await expect(stepTextareas.nth(1)).toHaveValue('Step 3 content')
  52 |     await expect(expectedTextareas.nth(1)).toHaveValue('Expected 3')
  53 | 
  54 |     // 5. Save the test case
  55 |     await page.getByRole('button', { name: 'Create Test Case' }).click()
  56 | 
  57 |     // Verify redirected back to test cases list
  58 |     await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }).first())).toBeVisible({ timeout: 25_000 })
  59 |     await page.getByText('All Test Cases').first().click()
  60 | 
  61 |     // 6. Search for the created test case and open it for editing
  62 |     const searchInput = page.getByPlaceholder('Search test cases...')
  63 |     await searchInput.fill(testCaseName)
  64 |     
  65 |     const row = page.locator('tbody tr').filter({ hasText: testCaseName }).first()
  66 |     await expect(row).toBeVisible({ timeout: 15_000 })
  67 | 
  68 |     // Click Edit button
  69 |     await row.getByTitle('Edit test case').click()
  70 |     await expect(page.getByRole('heading', { name: 'Edit Test Case' })).toBeVisible({ timeout: 15_000 })
  71 | 
  72 |     // 7. Verify step values are preserved correctly
> 73 |     await expect(stepTextareas.nth(0)).toHaveValue('Step 1 content')
     |                                        ^ Error: expect(locator).toHaveValue(expected) failed
  74 |     await expect(expectedTextareas.nth(0)).toHaveValue('Expected 1')
  75 |     await expect(stepTextareas.nth(1)).toHaveValue('Step 3 content')
  76 |     await expect(expectedTextareas.nth(1)).toHaveValue('Expected 3')
  77 | 
  78 |     // Exit form
  79 |     await page.getByRole('button', { name: 'Cancel' }).click()
  80 | 
  81 |     // 8. Cleanup: Delete the test case
  82 |     await expect(page.getByRole('heading', { name: 'Test Repository' }).first().or(page.getByRole('heading', { name: 'Test Cases' }).first())).toBeVisible({ timeout: 25_000 })
  83 |     await page.getByText('All Test Cases').first().click()
  84 |     await searchInput.fill(testCaseName)
  85 |     const cleanupRow = page.locator('tbody tr').filter({ hasText: testCaseName }).first()
  86 |     await cleanupRow.getByTitle('Delete test case').click()
  87 |     await page.getByRole('button', { name: 'Delete', exact: true }).click()
  88 | 
  89 |     // Confirm it is gone
  90 |     await expect(page.locator('tbody').getByText(testCaseName)).not.toBeVisible({ timeout: 10_000 })
  91 |   })
  92 | })
  93 | 
```