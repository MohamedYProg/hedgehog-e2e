import { Page, Locator, Response, expect } from '@playwright/test'

export class ModulesPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string

  // Common & Navigation Locators
  readonly headingModules: Locator
  readonly searchInput: Locator
  readonly successToast: Locator
  readonly firstRow: Locator

  // Create Form Locators
  readonly createModuleBtn: Locator
  readonly nameInput: Locator
  readonly descriptionInput: Locator
  readonly parentSelect: Locator
  readonly submitCreateBtn: Locator

  // Edit/Delete Form Locators
  readonly editNameInput: Locator
  readonly editParentSelect: Locator
  readonly submitUpdateBtn: Locator
  readonly confirmDeleteBtn: Locator
  readonly editIcon: Locator
  readonly deleteIcon: Locator
  readonly cancelBtn: Locator

  constructor(page: Page, projectKey: string, baseUrl: string = '') {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/modules`

    // Common & Navigation Locators
    this.headingModules = page.getByRole('heading', { name: 'Modules' })
    this.searchInput = page.getByPlaceholder('Search modules...')
    this.successToast = page.locator('div').filter({ hasText: /success/i }).first()
    this.firstRow = page.locator('tbody tr').first()

    // Create Form Locators
    this.createModuleBtn = page.getByRole('button', { name: 'Create Module' }).first()
    this.nameInput = page.locator('#name').or(page.locator('input[placeholder="Module name"]'))
    this.descriptionInput = page.locator('#description')
    this.parentSelect = page.locator('#parentId')
    this.submitCreateBtn = page.getByRole('button', { name: 'Create Module' }).last()

    // Edit/Delete Form Locators
    this.editNameInput = page.locator('#editName')
    this.editParentSelect = page.locator('#editParentId')
    this.submitUpdateBtn = page.getByRole('button', { name: 'Update Module' })
    this.confirmDeleteBtn = page.getByRole('button', { name: 'Delete Module', exact: true }).last()
    this.editIcon = page.locator('tbody tr').first().getByTitle('Edit module')
    this.deleteIcon = page.locator('tbody tr').first().getByTitle('Delete module')
    this.cancelBtn = page.getByRole('button', { name: 'Cancel' })
  }

  async goto() {
    await this.page.goto(this.listUrl)
  }

  async waitForList() {
    await expect(this.searchInput).toBeVisible({ timeout: 45_000 })
  }

  async openCreateModal() {
    await this.createModuleBtn.click()
  }

  async createNewModule(name: string, description: string = '', parentLabel?: string) {
    await this.openCreateModal()
    await expect(this.page.getByRole('heading', { name: /Create/i })).toBeVisible({ timeout: 10_000 })
    await this.nameInput.fill(name)
    if (description) {
      await this.descriptionInput.fill(description)
    }
    if (parentLabel) {
      await this.parentSelect.selectOption({ label: parentLabel })
    }
    await this.submitCreateBtn.click()
  }

  async searchModule(name: string) {
    const q = 'q=' + encodeURIComponent(name).replace(/%20/g, '+')
    const isSearchResponse = (r: Response) =>
      r.url().includes('/components?') && r.url().includes('page=') && r.url().includes(q) && r.ok()

    // Type the search and wait until it reaches the API. Retried because text
    // typed while the list is still refreshing (e.g. right after a create) can
    // be dropped.
    await expect(async () => {
      const searched = this.page.waitForResponse(isSearchResponse, { timeout: 5_000 })
      await this.searchInput.fill('')
      await this.searchInput.fill(name)
      await searched
    }).toPass({ timeout: 30_000 })

    // Workaround: with the default sort the API ignores the search text and
    // returns unfiltered rows. An explicit sort makes the API apply the filter.
    // The column header cycles asc -> desc -> off, so click until the request
    // actually carries a sort (a second search on the same page may already be
    // on "desc", where one more click would turn sorting off).
    const sortButton = this.page.getByRole('button', { name: 'Module Name' })
    for (let attempt = 0; attempt < 3; attempt++) {
      const [response] = await Promise.all([
        this.page.waitForResponse(isSearchResponse, { timeout: 20_000 }),
        sortButton.click(),
      ])
      if (response.url().includes('sort=')) return
    }
    throw new Error('Could not apply a sort to the modules list')
  }

  async editFirstModuleName(newName: string) {
    await this.editIcon.click()
    await expect(this.editNameInput).toBeVisible({ timeout: 10_000 })
    await this.editNameInput.clear()
    await this.editNameInput.fill(newName)
    await this.submitUpdateBtn.click()
  }

  async deleteFirstModule() {
    await this.deleteIcon.click()
    await this.confirmDeleteBtn.click()
  }

  async deleteModule(name: string) {
    await this.searchModule(name)
    const row = this.page.locator('tbody tr').filter({ hasText: name }).first()
    await expect(row).toBeVisible({ timeout: 15_000 })
    await row.getByTitle('Delete module').click()
    await this.confirmDeleteBtn.click()
  }

  getModuleRow(name: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: name }).first()
  }

  getModuleCell(name: string): Locator {
    return this.page.locator('tbody').getByText(name, { exact: true })
  }
}
