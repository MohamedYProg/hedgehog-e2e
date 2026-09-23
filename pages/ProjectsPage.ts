import { Page, Locator, expect } from '@playwright/test'

export class ProjectsPage {
  readonly page: Page
  readonly baseUrl: string
  readonly listUrl: string

  // Common & Navigation Locators
  readonly searchInput: Locator
  readonly projectSwitcherText: Locator
  readonly createProjectBtn: Locator

  // Form Locators
  readonly projectNameInput: Locator
  readonly projectAbbreviationInput: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly invalidAbbreviationToast: Locator

  constructor(page: Page, baseUrl: string) {
    this.page = page
    this.baseUrl = baseUrl
    this.listUrl = `${baseUrl}/app/admin/projects`

    // Common & Navigation Locators
    this.searchInput = page.getByPlaceholder('Search projects...')
    this.projectSwitcherText = page.locator('span.truncate').filter({ hasText: 'Select Project' }).first()
    this.createProjectBtn = page.getByRole('button', { name: 'Create Project' }).or(page.getByRole('button', { name: 'New Project' })).first()

    // Form Locators
    this.projectNameInput = page.locator('#projectName')
    this.projectAbbreviationInput = page.locator('#projectAbbreviation')
    this.submitButton = page.getByRole('button', { name: 'Create Project', exact: true })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    this.invalidAbbreviationToast = page.getByText('Invalid abbreviation').first()
  }

  async gotoList() {
    await this.page.goto(this.listUrl)
  }

  async openCreateModal() {
    await this.createProjectBtn.click()
  }

  async fillProjectForm(name: string, abbreviation: string) {
    await this.projectNameInput.fill(name)
    await this.projectAbbreviationInput.fill(abbreviation)
  }

  async submit() {
    await this.submitButton.click()
  }

  async cancel() {
    await this.cancelButton.click()
  }
}
