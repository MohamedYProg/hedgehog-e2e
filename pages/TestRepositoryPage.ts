import { Page, Locator, expect } from '@playwright/test'

export class TestRepositoryPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string
  readonly createUrl: string

  // Common & Navigation Locators
  readonly searchInput: Locator
  readonly allTestCasesRow: Locator
  readonly createMenuButton: Locator
  readonly newTestSuiteMenuItem: Locator
  readonly suiteNameInput: Locator
  readonly createSuiteButton: Locator
  readonly firstTitleButton: Locator

  // Create Form Locators
  readonly headingCreateNewTestCase: Locator
  readonly titleInput: Locator
  readonly descriptionInput: Locator
  readonly stepInput: Locator
  readonly resultInput: Locator
  readonly typeSelect: Locator
  readonly prioritySelect: Locator
  readonly suiteSelect: Locator
  readonly createTestCaseButton: Locator

  // Detail View Locators
  readonly headingTestCaseDetails: Locator
  readonly backButton: Locator
  readonly statusSelect: Locator

  constructor(page: Page, projectKey: string, baseUrl: string) {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/test-cases`
    this.createUrl = `${this.listUrl}/create`

    // Common & Navigation Locators
    this.searchInput = page.getByPlaceholder('Search test cases...')
    this.allTestCasesRow = page.getByText('All Test Cases').first()
    this.createMenuButton = page.getByRole('button', { name: /Create/i }).first()
    this.newTestSuiteMenuItem = page.getByRole('menuitem', { name: 'Create new Test Suite' })
    this.suiteNameInput = page.locator('#suite-name')
    this.createSuiteButton = page.getByRole('button', { name: 'Create Suite' })
    this.firstTitleButton = page.locator('tbody tr td button').first()

    // Create Form Locators
    this.headingCreateNewTestCase = page.getByRole('heading', { name: 'Create New Test Case' })
    this.titleInput = page.getByLabel('Title *')
    this.descriptionInput = page.getByLabel('Description')
    this.stepInput = page.getByPlaceholder('Enter test step').first()
    this.resultInput = page.getByPlaceholder('Enter expected result').first()
    this.typeSelect = page.locator('#type')
    this.prioritySelect = page.locator('#priority')
    this.suiteSelect = page.locator('#suiteId')
    this.createTestCaseButton = page.getByRole('button', { name: 'Create Test Case' })

    // Detail View Locators
    this.headingTestCaseDetails = page.getByText('Test Case Details')
    this.backButton = page.getByRole('button', { name: 'Back' })
    this.statusSelect = page.locator('select').first()
  }

  async gotoList() {
    await this.page.goto(this.listUrl)
  }

  async gotoCreate() {
    await this.page.goto(this.createUrl)
  }

  async waitForList() {
    const isSearchVisible = await this.searchInput.isVisible()
    if (!isSearchVisible) {
      await expect(this.allTestCasesRow).toBeVisible({ timeout: 20_000 })
      await this.allTestCasesRow.click()
    }
    await expect(this.searchInput).toBeVisible({ timeout: 30_000 })
  }

  async createNewSuite(name: string) {
    await this.createMenuButton.click()
    await this.newTestSuiteMenuItem.click()
    await this.suiteNameInput.fill(name)
    await this.createSuiteButton.click()
    await this.page.waitForTimeout(1000)
  }

  async fillTestCaseForm(title: string, description: string, step: string, expectedResult: string, type: string, priority: string) {
    await this.titleInput.fill(title)
    await this.descriptionInput.fill(description)
    await this.stepInput.fill(step)
    await this.resultInput.fill(expectedResult)
    await this.typeSelect.selectOption(type)
    await this.prioritySelect.selectOption(priority)
    await this.suiteSelect.selectOption({ index: 1 })
  }

  async createTestCase(title: string, description: string, step: string, expectedResult: string, type: string, priority: string) {
    await this.fillTestCaseForm(title, description, step, expectedResult, type, priority)
    await this.createTestCaseButton.click()
  }
}
