import { Page, Locator, expect } from '@playwright/test'

export class ImportExportDialog {
  readonly page: Page

  // Import Dialog Locators
  readonly importBtn: Locator
  readonly importHeading: Locator
  readonly importFileInput: Locator
  readonly nextPreviewBtn: Locator
  readonly previewReadyText: Locator
  readonly confirmImportBtn: Locator
  readonly importCompletedToast: Locator

  // Export Dialog Locators
  readonly exportBtn: Locator
  readonly exportFormatSelect: Locator
  readonly previewExportBtn: Locator
  readonly exportSelectionText: Locator
  readonly confirmExportBtn: Locator

  constructor(page: Page) {
    this.page = page

    // Import Dialog
    this.importBtn = page.getByRole('button', { name: 'Import', exact: true })
    this.importHeading = page.getByText('Import Requirements')
    this.importFileInput = page.locator('#import-file-input-req')
    this.nextPreviewBtn = page.getByRole('button', { name: 'Next: Preview' })
    this.previewReadyText = page.getByText('Ready to import').first()
    this.confirmImportBtn = page.getByRole('button', { name: /Import \d+ (Requirements|Requirement)/ })
    this.importCompletedToast = page.getByText('Import Completed')

    // Export Dialog
    this.exportBtn = page.getByRole('button', { name: 'Export', exact: true })
    this.exportFormatSelect = page.locator('#export-format')
    this.previewExportBtn = page.getByRole('button', { name: 'Preview Export' })
    this.exportSelectionText = page.getByText('1 of 1 requirements selected').or(page.getByText('selected for export'))
    this.confirmExportBtn = page.getByRole('button', { name: /Export \d+ (Requirements|Requirement)/ })
  }

  async openImport() {
    await this.importBtn.click()
  }

  async uploadCSV(csvContent: string, filename: string = 'requirements.csv') {
    await this.importFileInput.setInputFiles({
      name: filename,
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    })
  }

  async advanceToPreview() {
    await this.nextPreviewBtn.click()
  }

  async confirmImport() {
    await this.confirmImportBtn.click()
  }

  async openExport() {
    await this.exportBtn.click()
  }

  async configureExport(format: string) {
    await this.exportFormatSelect.selectOption(format)
    await this.previewExportBtn.click()
  }

  async triggerDownload(): Promise<any> {
    const downloadPromise = this.page.waitForEvent('download')
    await this.confirmExportBtn.click()
    return await downloadPromise
  }
}
