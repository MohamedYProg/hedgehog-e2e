import { Page, Locator, expect } from '@playwright/test'

export class DefectsPage {
  readonly page: Page
  readonly projectKey: string
  readonly listUrl: string
  readonly createUrl: string

  // Create Form Locators
  readonly summaryInput: Locator
  readonly descriptionInput: Locator
  readonly classificationInput: Locator
  readonly compTrigger: Locator
  readonly cycleSelect: Locator
  readonly reporterBtn: Locator
  readonly createDefectButton: Locator
  readonly toastError: Locator

  // List & Edit Locators
  readonly searchInput: Locator
  readonly firstRowEditButton: Locator
  readonly firstRowDeleteButton: Locator
  readonly confirmDeleteButton: Locator
  readonly updateDefectButton: Locator
  readonly firstRow: Locator

  // Bulk Operations Locators
  readonly bulkPriorityButton: Locator
  readonly bulkDeleteButton: Locator
  readonly bulkConfirmDeleteButton: Locator
  readonly successToast: Locator

  // Board (Kanban) Locators
  readonly listViewButton: Locator
  readonly boardViewButton: Locator
  readonly boardContainer: Locator

  constructor(page: Page, projectKey: string, baseUrl: string = '') {
    this.page = page
    this.projectKey = projectKey
    this.listUrl = `${baseUrl}/app/${projectKey}/defects`
    this.createUrl = `${baseUrl}/app/${projectKey}/defects/create`

    // Create Form Locators
    this.summaryInput = page.locator('#summary')
    this.descriptionInput = page.locator('#description')
    this.classificationInput = page.locator('#classification')
    this.compTrigger = page.locator('form').getByRole('combobox').filter({ hasText: /module/i })
    this.cycleSelect = page.locator('#detectedInCycleId')
    this.reporterBtn = page.getByRole('button', { name: /Select Reporter|Unassigned/i }).or(page.getByText('Select Reporter')).first()
    this.createDefectButton = page.getByRole('button', { name: 'Create Defect' })
    this.toastError = page.locator('[role="status"]').or(page.locator('.text-red-500'))

    // List & Edit Locators
    this.searchInput = page.getByPlaceholder('Search defects...').first()
    this.firstRowEditButton = page.locator('tbody tr').first().getByTitle('Edit defect')
    this.firstRowDeleteButton = page.locator('tbody tr').first().getByTitle('Delete defect')
    this.confirmDeleteButton = page.locator('.fixed.z-50').getByRole('button', { name: 'Delete', exact: true })
    this.updateDefectButton = page.getByRole('button', { name: 'Update Defect' })
    this.firstRow = page.locator('tbody tr').first()

    // Bulk Operations Locators
    this.bulkPriorityButton = page.locator("xpath=//span[contains(., 'selected')]/parent::div/parent::div//button[contains(., 'Priority')]")
    this.bulkDeleteButton = page.locator("xpath=//span[contains(., 'selected')]/parent::div/parent::div//button[contains(., 'Delete')]")
    this.bulkConfirmDeleteButton = page.locator('.fixed.z-50').getByRole('button', { name: 'Delete', exact: true })
    this.successToast = page.locator('div').filter({ hasText: /success/i }).first()

    // Board (Kanban) Locators
    this.listViewButton = page.getByRole('button', { name: 'List', exact: true })
    this.boardViewButton = page.getByRole('button', { name: 'Board', exact: true })
    this.boardContainer = page.locator('div.overflow-x-auto.overflow-y-hidden')
  }

  async gotoList() {
    await this.page.goto(this.listUrl)
  }

  async gotoCreate() {
    await this.page.goto(this.createUrl)
  }

  async waitForListHeader() {
    await expect(this.page.getByRole('heading', { name: 'Defects' })).toBeVisible({ timeout: 20_000 })
  }

  async createNewDefect(summary: string, description: string, classification: string) {
    await this.summaryInput.fill(summary)
    await this.descriptionInput.fill(description)
    await this.classificationInput.fill(classification)

    // Select module
    await expect(this.compTrigger).toBeEnabled({ timeout: 15_000 })
    await this.compTrigger.click()
    const validOption = this.page.locator('div[role="option"]').filter({ hasNotText: /^No module$/ }).first()
    await expect(validOption).toBeVisible({ timeout: 10_000 })
    await validOption.click()

    // Select cycle
    await expect(async () => {
      const count = await this.cycleSelect.locator('option').count()
      expect(count).toBeGreaterThan(1)
    }).toPass({ timeout: 10_000 })
    await this.cycleSelect.selectOption({ index: 1 })

    // Select reporter
    if (await this.reporterBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await this.reporterBtn.click()
      await this.page.waitForTimeout(300)
      const userItem = this.page.locator('button, div').filter({ hasText: /Admin|admin|User/ }).first()
      if (await userItem.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await userItem.click()
      }
    }

    await this.createDefectButton.click()
  }

  async searchDefect(summary: string) {
    if (await this.searchInput.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await this.searchInput.fill(summary)
      await this.searchInput.press('Enter')
      await this.page.waitForTimeout(1000)
    }
  }

  async editFirstDefect(updatedSummary: string) {
    if (await this.firstRowEditButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await this.firstRowEditButton.click()
      await this.page.waitForURL(/\/defects\/edit\//, { timeout: 15_000 })
      await this.summaryInput.clear()
      await this.summaryInput.fill(updatedSummary)
      await this.updateDefectButton.click()
    }
  }

  async deleteFirstDefect() {
    if (await this.firstRowDeleteButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await this.firstRowDeleteButton.click()
      await this.confirmDeleteButton.click()
    }
  }

  getDefectRow(summary: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: summary }).first()
  }

  getDefectCell(summary: string): Locator {
    return this.page.locator('tbody').getByText(summary)
  }

  getBulkSelectedText(count: number): Locator {
    return this.page.getByText(`${count} defects selected`)
  }

  async bulkUpdatePriority(priority: string) {
    await this.bulkPriorityButton.click()
    await this.page.getByRole('menuitem', { name: priority, exact: true }).or(this.page.getByRole('button', { name: priority, exact: true })).first().click()
  }

  async bulkDeleteSelected() {
    await this.bulkDeleteButton.click()
    await this.bulkConfirmDeleteButton.click()
  }

  checkboxInRow(row: Locator): Locator {
    return row.locator('input[type="checkbox"]').first()
  }

  // ── Board (Kanban) helpers ────────────────────────────────────────────────

  async switchToBoardView() {
    await this.boardViewButton.click()
    await expect(this.boardContainer).toBeVisible({ timeout: 20_000 })
  }

  async switchToListView() {
    await this.listViewButton.click()
    await expect(this.page.locator('tbody')).toBeVisible({ timeout: 20_000 })
  }

  /** Locates a board column by its status display name (e.g. "New", "Assigned"). */
  getBoardColumn(displayName: string): Locator {
    return this.boardContainer
      .locator('div.rounded-2xl.border')
      .filter({ has: this.page.getByText(displayName, { exact: true }) })
  }

  /** Locates a draggable defect card within the board by summary or defect number text. */
  getBoardCard(text: string): Locator {
    return this.boardContainer.locator('div[draggable="true"]').filter({ hasText: text })
  }

  /** Locates a defect card scoped to a specific board column. */
  getBoardCardInColumn(displayName: string, text: string): Locator {
    return this.getBoardColumn(displayName).locator('div[draggable="true"]').filter({ hasText: text })
  }

  /**
   * Drags a defect card into another board column.
   *
   * Uses a manual mouse sequence (move → down → move in steps → up) rather than
   * Locator.dragTo(): dragTo() resolves the correct source element but Chromium's
   * synthesized drag consistently starts on the wrong card in this app's React
   * DnD implementation. Explicit incremental mouse moves give the browser a real
   * drag gesture and reliably originate from the intended card.
   */
  async dragCardToColumn(cardText: string, toColumnDisplayName: string) {
    const card = this.getBoardCard(cardText)
    const column = this.getBoardColumn(toColumnDisplayName)

    const sourceBox = await card.boundingBox()
    const targetBox = await column.boundingBox()
    if (!sourceBox || !targetBox) {
      throw new Error(`dragCardToColumn: could not resolve bounding box for "${cardText}" -> "${toColumnDisplayName}"`)
    }

    const sx = sourceBox.x + sourceBox.width / 2
    const sy = sourceBox.y + sourceBox.height / 2
    const tx = targetBox.x + targetBox.width / 2
    // Drop near the top of the column rather than its vertical center — the column's
    // bounding box spans its full (scrollable) content height, not just the viewport.
    const ty = Math.min(targetBox.y + 100, targetBox.y + targetBox.height / 2)

    await this.page.mouse.move(sx, sy)
    await this.page.mouse.down()
    await this.page.mouse.move(sx + (tx - sx) * 0.3, sy + (ty - sy) * 0.3, { steps: 5 })
    await this.page.mouse.move(tx, ty, { steps: 10 })
    await this.page.mouse.up()
  }
}
