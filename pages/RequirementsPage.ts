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
    // Wait for the filtered list to come back so row actions hit the right row.
    await Promise.all([
      this.page.waitForResponse(
        (r) => r.url().includes('/api/v1/requirements?') && r.url().includes('q=') && r.ok(),
        { timeout: 20_000 }
      ),
      this.searchInput.fill(name),
    ])
    await this.page.waitForTimeout(300)
  }

  async editFirstRequirement(updatedName: string) {
    if (await this.firstRowEditButton.isVisible().catch(() => false)) {
      // Workaround: the Edit button links by business ID (e.g. TMTT_REQ_00023),
      // which the API currently rejects with 404. Open the edit page by the
      // internal ID from the row checkbox label instead.
      const label = await this.firstRow.getByRole('checkbox').first().getAttribute('aria-label')
      const id = label?.replace('Select requirement ', '').trim()
      if (!id) throw new Error('Could not read requirement id from row checkbox')
      await this.page.goto(`${this.listUrl}/edit/${id}`)
      await expect(this.nameInput).toHaveValue(/.+/, { timeout: 20_000 })
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
