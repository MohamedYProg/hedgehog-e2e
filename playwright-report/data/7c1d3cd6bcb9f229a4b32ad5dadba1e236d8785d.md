# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: boundary-limits.spec.ts >> Boundary Value Analysis (BVA) limits >> BVA-021: 0-byte attachment is rejected, 1-byte attachment succeeds
- Location: tests\boundary-limits.spec.ts:76:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Attachments').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByText('Attachments').first()

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
  - heading "Requirements" [level=2]
  - button "Open search"
  - button "Notifications"
  - button "Updated User admin@hedgehog.com":
    - paragraph: Updated User
    - paragraph: admin@hedgehog.com
  - main:
    - paragraph: Requirement not found
- button "Open Tanstack query devtools":
  - img
- alert
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
  58  |     await page.getByRole('button', { name: 'Create Requirement', exact: true }).click()
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
> 87  |     await expect(page.getByText('Attachments').first()).toBeVisible({ timeout: 15_000 })
      |                                                         ^ Error: expect(locator).toBeVisible() failed
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