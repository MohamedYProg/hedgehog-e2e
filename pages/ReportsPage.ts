import { Page, Locator } from '@playwright/test'

export class ReportsPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string

  // Tab Locators
  readonly tabContainer: Locator
  readonly projectTab: Locator
  readonly testRunTab: Locator
  readonly defectsTab: Locator

  // Export Locators
  readonly exportButton: Locator
  readonly exportMenu: Locator
  readonly csvOption: Locator
  readonly excelOption: Locator
  readonly pdfOption: Locator

  constructor(page: Page, projectKey: string, baseUrl: string = '') {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/reports`

    // Tabs
    this.tabContainer = page.locator('div.flex.border-b')
    this.projectTab = this.tabContainer.getByRole('button', { name: 'Project', exact: true })
    this.testRunTab = this.tabContainer.getByRole('button', { name: 'Test Run', exact: true })
    this.defectsTab = this.tabContainer.getByRole('button', { name: 'Defects', exact: true })

    // Export Action Menu
    this.exportButton = page.getByRole('button', { name: 'Export' }).first()
    this.exportMenu = page.locator('div.absolute.right-0.mt-1')
    this.csvOption = this.exportMenu.getByRole('button', { name: 'CSV' })
    this.excelOption = this.exportMenu.getByRole('button', { name: 'Excel' })
    this.pdfOption = this.exportMenu.getByRole('button', { name: 'PDF' })
  }

  async goto() {
    await this.page.goto(this.listUrl)
  }

  async switchTab(tab: 'Project' | 'Test Run' | 'Defects') {
    if (tab === 'Project') {
      await this.projectTab.click()
    } else if (tab === 'Test Run') {
      await this.testRunTab.click()
    } else {
      await this.defectsTab.click()
    }
  }

  async openExportMenu() {
    await this.exportButton.click()
  }
}
