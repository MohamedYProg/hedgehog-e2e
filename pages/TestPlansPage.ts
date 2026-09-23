import { Page, Locator, expect } from '@playwright/test'

export class TestPlansPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string
  readonly createUrl: string

  // Common & Navigation Locators
  readonly searchInput: Locator
  readonly firstRow: Locator
  readonly firstTitleButton: Locator

  // Create/Edit Form Locators
  readonly nameInput: Locator
  readonly saveButton: Locator

  // Detail & List Actions Locators
  readonly firstRowDeleteButton: Locator
  readonly confirmDeleteButton: Locator

  constructor(page: Page, projectKey: string, baseUrl: string) {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/test-plans`
    this.createUrl = `${this.listUrl}/create`

    // Common & Navigation Locators
    this.searchInput = page.getByPlaceholder('Search test plans...')
    this.firstRow = page.locator('tbody tr').first()
    this.firstTitleButton = this.firstRow.locator('button.text-left').first()

    // Create/Edit Form Locators
    this.nameInput = page.locator('#test-plan-name')
    this.saveButton = page.getByRole('button', { name: 'Save Test Plan' })

    // Detail & List Actions Locators
    this.firstRowDeleteButton = page.locator('tbody tr').first().getByTitle('Delete test plan')
    this.confirmDeleteButton = page.locator('[role="dialog"]').getByRole('button', { name: 'Delete', exact: true }).or(page.getByRole('button', { name: 'Delete', exact: true })).first()
  }

  async gotoList() {
    await this.page.goto(this.listUrl)
  }

  async gotoCreate() {
    await this.page.goto(this.createUrl)
  }

  async gotoBrowse(id: string) {
    await this.page.goto(`${this.listUrl}/browse/${id}`)
  }

  async gotoEdit(id: string) {
    await this.page.goto(`${this.listUrl}/edit/${id}`)
  }

  async waitForList() {
    await expect(this.searchInput).toBeVisible({ timeout: 20_000 })
  }

  async createNewTestPlan(name: string) {
    await this.nameInput.fill(name)
    await this.saveButton.click()
  }

  async editTestPlanName(newName: string) {
    await this.nameInput.clear()
    await this.nameInput.fill(newName)
    // Wait for the update to actually commit — clicking Save navigates back
    // to the list as soon as the request resolves client-side, which doesn't
    // guarantee the write has landed before the caller immediately searches
    // for the new name.
    await Promise.all([
      this.page.waitForResponse((r) => /\/api\/v1\/test-plans\/[^/]+$/.test(r.url()) && r.request().method() === 'PATCH' && r.ok(), { timeout: 20_000 }),
      this.saveButton.click(),
    ])
  }

  async searchTestPlan(searchTerm: string) {
    await this.searchInput.fill(searchTerm)
    await this.searchInput.press('Enter')
    await this.page.waitForTimeout(600)
  }

  async searchAndOpenFirstMatch(searchTerm: string): Promise<string> {
    await this.searchTestPlan(searchTerm)
    await expect(this.firstTitleButton).toBeVisible({ timeout: 10_000 })
    await expect(this.firstTitleButton).toHaveText(searchTerm, { timeout: 15_000 })
    await this.firstTitleButton.click()
    await this.page.waitForURL(/\/test-plans\/browse\//, { timeout: 15_000 })
    return this.page.url().split('/').pop()!
  }

  async deleteFirstTestPlan() {
    await this.firstRowDeleteButton.click()
    await this.confirmDeleteButton.click()
  }

  getTestPlanRow(name: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name }).first()
  }

  getTestPlanCell(name: string): Locator {
    return this.page.locator('tbody').getByText(name, { exact: true })
  }
}
