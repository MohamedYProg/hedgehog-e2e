import { Page, Locator, expect } from '@playwright/test'

export class TestLabPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string
  readonly createRunUrl: string

  // Tabs
  readonly cyclesTabBtn: Locator
  readonly environmentsTabBtn: Locator

  // Environments Locators
  readonly newEnvironmentBtn: Locator
  readonly envNameInput: Locator
  readonly envDescInput: Locator
  readonly submitEnvBtn: Locator
  readonly deleteEnvConfirmBtn: Locator

  // Cycles Locators
  readonly newCycleBtn: Locator
  readonly cycleNameInput: Locator
  readonly cycleDescInput: Locator
  readonly cycleStartInput: Locator
  readonly cycleEndInput: Locator
  readonly submitCycleBtn: Locator
  readonly editCycleBtn: Locator
  readonly deleteCycleBtn: Locator
  readonly deleteCycleConfirmBtn: Locator

  // Runs Locators
  readonly runNameInput: Locator
  readonly planTrigger: Locator
  readonly environmentTrigger: Locator
  readonly cycleTrigger: Locator
  readonly createRunBtn: Locator
  readonly addTestCasesBtn: Locator
  readonly addCasesConfirmBtn: Locator
  readonly deleteSelectedCasesBtn: Locator
  readonly searchRunsInput: Locator
  readonly bulkDeleteRunsBtn: Locator
  readonly bulkConfirmDeleteRunsBtn: Locator

  constructor(page: Page, projectKey: string, baseUrl: string = '') {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/test-lab`
    this.createRunUrl = `${this.listUrl}/runs-create` // supports both /runs-create and /runs/create

    // Tabs
    this.cyclesTabBtn = page.getByRole('button', { name: 'Cycles', exact: true })
    this.environmentsTabBtn = page.getByRole('button', { name: 'Environments', exact: true })

    // Environments
    this.newEnvironmentBtn = page.getByRole('button', { name: 'New Environment' }).or(page.getByRole('button', { name: 'Create Environment' }))
    this.envNameInput = page.locator('#name')
    this.envDescInput = page.locator('#description')
    this.submitEnvBtn = page.getByRole('button', { name: 'Create', exact: true })
    this.deleteEnvConfirmBtn = page.getByRole('button', { name: 'Delete', exact: true }).last()

    // Cycles
    this.newCycleBtn = page.getByTitle('New Cycle').first()
    this.cycleNameInput = page.locator('#cname')
    this.cycleDescInput = page.locator('#cdesc')
    this.cycleStartInput = page.locator('#cstart')
    this.cycleEndInput = page.locator('#cend')
    this.submitCycleBtn = page.getByRole('button', { name: 'Create', exact: true }).or(page.getByRole('button', { name: 'Update', exact: true }))
    this.editCycleBtn = page.getByTitle('Edit cycle')
    this.deleteCycleBtn = page.getByTitle('Delete cycle')
    this.deleteCycleConfirmBtn = page.getByRole('button', { name: 'Delete', exact: true }).last()

    // Runs
    this.runNameInput = page.locator('#name')
    this.planTrigger = page.locator('#plan')
    this.environmentTrigger = page.locator('#environment')
    this.cycleTrigger = page.locator('#cycle')
    this.createRunBtn = page.getByRole('button', { name: 'Create Test Run' })
    this.addTestCasesBtn = page.getByRole('button', { name: 'Add Test Cases' })
    this.addCasesConfirmBtn = page.getByRole('button', { name: /Add \(\d+\)/ })
    this.deleteSelectedCasesBtn = page.getByRole('button', { name: 'Delete Selected' })
    this.searchRunsInput = page.getByPlaceholder('Search test runs...')
    this.bulkDeleteRunsBtn = page.getByRole('button', { name: 'Delete', exact: true })
    // The confirm dialog is a custom implementation that never sets
    // role="dialog", so getByRole('dialog') can never match it — scope by
    // its title text instead. Test runs use their own bulk-delete dialog
    // (title "Delete N test run(s)?"), not GenericModuleTable's generic
    // "Delete Selected" one.
    this.bulkConfirmDeleteRunsBtn = page.locator('.fixed.z-50').filter({ hasText: /Delete \d+ test run/ }).getByRole('button', { name: 'Delete', exact: true })
  }

  async goto() {
    await this.page.goto(this.listUrl)
    await this.page.waitForURL(/\/test-lab/, { timeout: 15_000 })
    await this.page.waitForLoadState('load')
    await this.page.waitForLoadState('networkidle').catch(() => {})
    await expect(this.page.getByText('Loading...')).not.toBeVisible({ timeout: 15_000 }).catch(() => {})
  }

  async gotoCreateRun(alternativeUrl?: string) {
    if (alternativeUrl) {
      await this.page.goto(alternativeUrl)
    } else {
      await this.page.goto(this.createRunUrl)
    }
  }

  async gotoRunStats(runId: string) {
    await this.page.goto(`${this.listUrl}/runs/browse/${runId}/stats`)
  }

  async gotoRunDetails(runId: string) {
    await this.page.goto(`${this.listUrl}/runs/browse/${runId}`)
  }

  async waitForListHeader() {
    await expect(this.page.getByRole('heading', { name: 'Test Lab' }).first()).toBeVisible({ timeout: 35_000 })
  }

  async switchTab(tab: 'Cycles' | 'Environments') {
    await this.page.waitForTimeout(500)
    if (tab === 'Cycles') {
      await this.cyclesTabBtn.waitFor({ state: 'visible', timeout: 5_000 })
      await this.cyclesTabBtn.click()
    } else {
      await this.environmentsTabBtn.waitFor({ state: 'visible', timeout: 5_000 })
      await this.environmentsTabBtn.click()
    }
  }

  // Environments actions
  async createEnvironment(name: string, description: string) {
    await this.newEnvironmentBtn.click()
    await expect(this.page.getByRole('heading', { name: 'Create Environment' })).toBeVisible({ timeout: 10_000 })
    await this.envNameInput.fill(name)
    await this.envDescInput.fill(description)
    await this.submitEnvBtn.click()
  }

  async deleteEnvironment(name: string) {
    const card = this.page.locator('.card-hover, div.border').filter({ hasText: name }).first()
    await card.getByRole('button').last().click()
    await this.deleteEnvConfirmBtn.click()
  }

  // Cycles actions
  async createCycle(name: string, start: string, end: string, desc?: string) {
    await this.newCycleBtn.click()
    await expect(this.page.getByRole('heading', { name: 'New Cycle' })).toBeVisible({ timeout: 10_000 })
    await this.cycleNameInput.fill(name)
    if (desc) {
      await this.cycleDescInput.fill(desc)
    }
    await this.cycleStartInput.fill(start)
    await this.cycleEndInput.fill(end)
    await this.submitCycleBtn.click()
    await expect(this.page.getByText('Loading...')).not.toBeVisible({ timeout: 15_000 }).catch(() => {})
  }

  async editCycle(oldName: string, newName: string) {
    const row = this.page.locator('div.group.flex').filter({ hasText: oldName }).first()
    await row.hover()
    
    const editBtn = row.getByTitle('Edit cycle').first()
    await editBtn.click({ force: true })
    await expect(this.page.getByRole('heading', { name: 'Edit Cycle' })).toBeVisible({ timeout: 10_000 })
    await this.cycleNameInput.fill(newName)
    await this.submitCycleBtn.click()
  }

  async deleteCycle(name: string) {
    const row = this.page.locator('div.group.flex').filter({ hasText: name }).first()
    await row.hover()
    
    const deleteBtn = row.getByTitle('Delete cycle').first()
    await deleteBtn.click({ force: true })
    await this.deleteCycleConfirmBtn.click()
  }

  getCycleNode(name: string): Locator {
    return this.page.locator('main').getByText(name).first()
  }

  // Runs actions
  async createRun(name: string, planName: string, description?: string) {
    await this.runNameInput.fill(name)
    if (description) {
      await this.page.locator('#description').fill(description)
    }

    // Select Plan trigger
    await this.planTrigger.click()
    await this.page.getByRole('option', { name: planName }).click()

    // Select Environment trigger
    await this.environmentTrigger.click()
    await this.page.getByRole('option').first().click()

    // Select Cycle trigger
    const cycleVis = await this.cycleTrigger.isVisible().catch(() => false)
    if (cycleVis) {
      await this.cycleTrigger.click()
      await this.page.getByRole('option').first().click()
    }

    await this.createRunBtn.click()
  }

  async associateTestCase(caseTitle: string) {
    await this.addTestCasesBtn.click()
    await expect(this.page.getByRole('heading', { name: 'Add Test Repository' })).toBeVisible({ timeout: 20_000 })

    const orphanHeader = this.page.getByText('Orphan Test Cases')
    if (await orphanHeader.isVisible()) {
      await orphanHeader.click()
    }

    // Anchor on the case title's exact text, then its direct parent row —
    // filtering generic `div.flex` wrappers by substring text and taking
    // `.last()` is ambiguous once there are many similarly-prefixed case
    // titles in the list (accumulated E2E data does exactly this) and can
    // silently check the wrong case's checkbox.
    const caseTitleEl = this.page.getByText(caseTitle, { exact: true })
    await expect(caseTitleEl).toBeVisible({ timeout: 15_000 })
    // Nearest ancestor that has a checkbox descendant, rather than assuming a
    // fixed nesting depth between the title and its row's checkbox.
    const caseRow = caseTitleEl.locator('xpath=ancestor::*[.//input[@type="checkbox"] or .//*[@role="checkbox"]][1]')
    await caseRow.getByRole('checkbox').first().click()
    await expect(this.addCasesConfirmBtn).toBeEnabled({ timeout: 10_000 })
    await this.addCasesConfirmBtn.click()
    // Wait for the modal to actually close rather than returning immediately —
    // the caller checks the run's detail table for the new case right after,
    // which doesn't wait long enough on its own for the association to land.
    await expect(this.page.getByRole('heading', { name: 'Add Test Repository' })).not.toBeVisible({ timeout: 20_000 })
  }

  async removeTestCase(caseTitle: string) {
    const detailRow = this.page.locator('div.flex-col.sm\\:flex-row').filter({ hasText: caseTitle }).first()
    await detailRow.getByRole('checkbox').click()
    await this.deleteSelectedCasesBtn.click()
  }

  async searchRuns(searchTerm: string) {
    await this.searchRunsInput.fill(searchTerm)
    await this.page.waitForTimeout(1000)
  }

  async deleteRun(name: string) {
    const listRow = this.page.locator('tbody tr').filter({ hasText: name }).first()
    await listRow.getByRole('button', { name: 'More actions' }).click()
    await this.page.getByRole('menuitem', { name: 'Edit' }).click()
    
    await expect(this.page.getByRole('heading', { name: 'Edit Test Run' })).toBeVisible({ timeout: 15_000 })
    // wait, RUN-009 deletes via checkbox on list!
  }

  async bulkDeleteRun(name: string) {
    const listRow = this.page.locator('tbody tr').filter({ hasText: name }).first()
    await listRow.locator('input[type="checkbox"]').first().click()
    await this.bulkDeleteRunsBtn.click()
    await this.bulkConfirmDeleteRunsBtn.click()
  }
}
