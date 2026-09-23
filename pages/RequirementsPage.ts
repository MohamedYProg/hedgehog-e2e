import { Page, Locator, expect } from '@playwright/test'

export class RequirementsPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string
  readonly createUrl: string

  // Common & Navigation Locators
  readonly headingRequirements: Locator
  readonly searchInput: Locator
  readonly firstRow: Locator

  // Create Form Locators
  readonly nameInput: Locator
  readonly descriptionInput: Locator
  readonly createRequirementButton: Locator

  // List & Edit Locators
  readonly firstRowEditButton: Locator
  readonly firstRowDeleteButton: Locator
  readonly confirmDeleteButton: Locator
  readonly updateRequirementButton: Locator
  readonly saveButton: Locator

  constructor(page: Page, projectKey: string, baseUrl: string) {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/requirements`
    this.createUrl = `${this.listUrl}/create`

    // Common & Navigation Locators
    this.headingRequirements = page.getByRole('heading', { name: 'Requirements' })
    this.searchInput = page.getByPlaceholder('Search requirements...').first()
    this.firstRow = page.locator('tbody tr').first()

    // Create Form Locators
    this.nameInput = page.locator('#name')
    this.descriptionInput = page.locator('#description')
    this.createRequirementButton = page.getByRole('button', { name: 'Create Requirement' })

    // List & Edit Locators
    this.firstRowEditButton = page.locator('tbody tr').first().getByTitle('Edit requirement')
    this.firstRowDeleteButton = page.locator('tbody tr').first().getByTitle('Delete requirement')
    this.confirmDeleteButton = page.locator('.fixed.z-50').getByRole('button', { name: 'Delete', exact: true })
    this.updateRequirementButton = page.getByRole('button', { name: 'Update Requirement' })
    this.saveButton = page.getByRole('button', { name: 'Save' })
  }

  async gotoList() {
    await this.page.goto(this.listUrl)
  }

  async gotoCreate() {
    await this.page.goto(this.createUrl)
  }

  async waitForListHeader() {
    await expect(this.headingRequirements).toBeVisible({ timeout: 20_000 })
  }

  async createNewRequirement(name: string, description: string) {
    await this.nameInput.fill(name)
    await this.descriptionInput.fill(description)
    await this.createRequirementButton.click()
  }

  async searchRequirement(name: string) {
    if (await this.searchInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await this.searchInput.fill(name)
      await this.searchInput.press('Enter')
      await this.page.waitForTimeout(1000)
    }
  }

  async fillSearchInput(name: string) {
    await this.searchInput.fill(name)
    await this.page.waitForTimeout(600)
  }

  async editFirstRequirement(updatedName: string) {
    if (await this.firstRowEditButton.isVisible().catch(() => false)) {
      await this.firstRowEditButton.click()
      await this.page.waitForURL(/\/requirements\/edit\//, { timeout: 15_000 })
      await this.nameInput.clear()
      await this.nameInput.fill(updatedName)
      await this.updateRequirementButton.click().catch(async () => {
        await this.saveButton.click()
      })
    }
  }

  async deleteFirstRequirement() {
    if (await this.firstRowDeleteButton.isVisible().catch(() => false)) {
      await this.firstRowDeleteButton.click()
      await this.confirmDeleteButton.click()
    }
  }

  getRequirementRow(name: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name }).first()
  }

  getRequirementCell(name: string): Locator {
    return this.page.locator('tbody').getByText(name, { exact: true })
  }
}
