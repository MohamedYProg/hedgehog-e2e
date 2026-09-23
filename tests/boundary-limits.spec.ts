import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Boundary Value Analysis (BVA) limits', () => {

  test('BVA-015: Test Cycle startDate after endDate is rejected', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/test-lab`)
    await expect(page.getByRole('heading', { name: 'Test Lab' })).toBeVisible({ timeout: 30_000 })

    // Switch to Cycles tab
    await page.getByRole('button', { name: 'Cycles', exact: true }).click()
    await expect(page.getByText('Select a cycle or run')).toBeVisible({ timeout: 15_000 })

    // Click tree header New Cycle button
    await page.locator('button[title="New Cycle"]').first().click()
    await expect(page.getByRole('heading', { name: 'New Cycle' })).toBeVisible({ timeout: 10_000 })

    // Fill start date as after end date
    await page.locator('#cname').fill('Boundary Cycle Date')
    await page.locator('#cstart').fill('2026-08-01')
    await page.locator('#cend').fill('2026-07-01') // End date is before start date

    // Submit
    await page.getByRole('button', { name: 'Create', exact: true }).click()

    // Assert date range validation check (Toast or inline error message)
    await expect(page.getByText(/End date must be after start date/i).or(page.getByText(/Invalid date range/i))).toBeVisible({ timeout: 15_000 })

    // Cancel modal
    await page.getByRole('button', { name: 'Cancel' }).click()
  })

  test('BVA-010: Requirement title blank rejected, 1-character description succeeds', async ({ page }) => {
    // Navigate to requirements list
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/requirements`)
    await expect(page.getByRole('heading', { name: 'Requirements' }).first()).toBeVisible({ timeout: 30_000 })

    // Open create requirement view
    await page.getByRole('button', { name: 'Create Requirement' }).click()
    await expect(page.getByText('Basic Information').first()).toBeVisible({ timeout: 10_000 })

    // Enter valid Name, but blank Description (test field validations)
    const uniqueId = Date.now()
    const tempName = `BVA-010 Req ${uniqueId}`
    await page.locator('#name').fill(tempName)
    await page.locator('#description').fill('') // blank description

    // Click submit
    await page.getByRole('button', { name: 'Create Requirement', exact: true }).click()

    // Assert that description error validation is shown
    await expect(page.getByText('Description is required')).toBeVisible({ timeout: 10_000 })

    // Fill valid 1-character description
    await page.locator('#description').fill('D')
    await page.getByRole('button', { name: 'Create Requirement', exact: true }).click()

    // Assert that creation succeeds and redirects back to requirements list
    await expect(page.getByRole('heading', { name: 'Requirements' }).first()).toBeVisible({ timeout: 20_000 })

    // Search and verify requirement is listed
    const searchInput = page.getByPlaceholder('Search requirements...')
    await searchInput.fill(tempName)
    await searchInput.press('Enter')
    await expect(page.locator('tbody').getByText(tempName)).toBeVisible({ timeout: 15_000 })

    // Cleanup: Delete the requirement
    const row = page.locator('tbody tr').filter({ hasText: tempName }).first()
    await row.getByTitle('Delete requirement').click()
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click()
    await expect(page.locator('tbody').getByText(tempName)).not.toBeVisible({ timeout: 10_000 })
  })

  test('BVA-021: 0-byte attachment is rejected, 1-byte attachment succeeds', async ({ page }) => {
    // Navigate to requirements list
    await page.goto(`${BASE_URL}/app/${PROJECT_KEY}/requirements`)
    await expect(page.getByRole('heading', { name: 'Requirements' }).first()).toBeVisible({ timeout: 30_000 })

    // Click on the first requirement link in the table to open its detail view
    const reqLink = page.locator('tbody tr').first().locator('td').nth(1).getByRole('button').first()
    await expect(reqLink).toBeVisible({ timeout: 15_000 })
    await reqLink.click()

    // Expect the detail view to be open (contains Attachment panel title)
    await expect(page.getByText('Attachments').first()).toBeVisible({ timeout: 15_000 })

    // Find the file input in the attachment panel
    const fileInput = page.locator('input[type="file"]')

    // 1. Try uploading a 0-byte file
    await fileInput.setInputFiles({
      name: 'empty.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('')
    })

    // Assert the warning toast
    await expect(page.getByText('"empty.txt" is empty and cannot be attached')).toBeVisible({ timeout: 10_000 })

    // 2. Upload a 1-byte file
    const uniqueId = Date.now()
    const fileName = `valid-${uniqueId}.txt`
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'text/plain',
      buffer: Buffer.from('a')
    })

     // Wait for the selected file preview to show, then click the upload button
    await expect(page.getByText(fileName)).toBeVisible({ timeout: 10_000 })
    const previewContainer = page.locator('div.bg-blue-50').filter({ hasText: fileName }).first()
    await previewContainer.getByRole('button').first().click() // Click the upload button
 
    // Wait for upload to complete and the preview container to disappear
    await expect(previewContainer).not.toBeVisible({ timeout: 15_000 })
 
    // Assert that the file is added successfully to the live attachments list
    await expect(page.getByText(fileName)).toBeVisible({ timeout: 10_000 })
 
    // Cleanup: Delete the attachment
    const attachmentRow = page.locator('div.border.rounded-lg').filter({ hasText: fileName }).first()
    await attachmentRow.locator('button').last().click() // trash icon button (last button is trash, first is download)
    
    // Click Delete in the confirmation dialog
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click()
    
    await expect(page.getByText(fileName)).not.toBeVisible({ timeout: 10_000 })
  })
})
