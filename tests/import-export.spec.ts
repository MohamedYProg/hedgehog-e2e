import { expect, test } from '@playwright/test'
import { RequirementsPage } from '../pages/RequirementsPage'
import { ImportExportDialog } from '../pages/ImportExportDialog'
import fs from 'fs'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'

test.describe('Asset Import & Export E2E', () => {
  let requirementsPage: RequirementsPage
  let importExportDialog: ImportExportDialog

  test.beforeEach(async ({ page }) => {
    requirementsPage = new RequirementsPage(page, PROJECT_KEY, BASE_URL)
    importExportDialog = new ImportExportDialog(page)
  })

  test('E2E Import & Export round-trip for Requirements', async ({ page }) => {
    // 1. Navigate to Requirements View
    await requirementsPage.gotoList()
    await requirementsPage.waitForListHeader()

    const uniqueId = Date.now()
    const requirementName = `Imported Req ${uniqueId}`
    const requirementDesc = `E2E automated description ${uniqueId}`

    // 2. Upload CSV file containing a test requirement
    const csvContent = `Name,Description,Type,Priority,Status\n"${requirementName}","${requirementDesc}","USER_STORY","HIGH","DRAFT"`
    
    // Open Import Dialog
    await importExportDialog.openImport()
    await expect(importExportDialog.importHeading).toBeVisible()

    // Upload using POM
    await importExportDialog.uploadCSV(csvContent)

    // Click "Next: Preview"
    await importExportDialog.advanceToPreview()

    // Assert preview — parsing awaits duplicate/reference-check network calls
    // (fetching all existing requirements/components in the project), which
    // can take a while now given how much data has accumulated across e2e
    // runs in this project, well past a 15s wait.
    await expect(importExportDialog.previewReadyText).toBeVisible({ timeout: 45_000 })
    
    // Click "Import 1 Requirement"
    await importExportDialog.confirmImport()

    // Assert successful import toast
    await expect(importExportDialog.importCompletedToast).toBeVisible({ timeout: 15_000 })

    // 3. Search and verify the imported requirement
    await requirementsPage.fillSearchInput(requirementName)
    await expect(requirementsPage.getRequirementCell(requirementName)).toBeVisible({ timeout: 15_000 })

    // 4. Export the requirement and verify download contents
    await importExportDialog.openExport()
    await importExportDialog.configureExport('csv')

    // Verify selection text
    await expect(importExportDialog.exportSelectionText).toBeVisible({ timeout: 15_000 })

    // Download E2E using POM
    const download = await importExportDialog.triggerDownload()

    // Save and assert content
    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    
    const downloadedContent = fs.readFileSync(downloadPath!, 'utf8')
    expect(downloadedContent).toContain(requirementName)
    expect(downloadedContent).toContain(requirementDesc)

    // 5. Cleanup: Delete the imported requirement
    const row = requirementsPage.getRequirementRow(requirementName)
    await row.getByTitle('Delete requirement').click()

    // Confirm deletion
    await requirementsPage.confirmDeleteButton.click()
    await expect(requirementsPage.getRequirementCell(requirementName)).not.toBeVisible({ timeout: 10_000 })
  })
})
