# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-lab-runs.spec.ts >> Test Lab Cycles & Runs management >> RUN-005 to RUN-009: Test Run creation lifecycle, metadata edit, case association, stats and bulk deletion
- Location: tests\test-lab-runs.spec.ts:46:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByRole('heading', { name: 'Add Test Repository' })
Expected: not visible
Received: visible
Timeout:  20000ms

Call log:
  - Expect "not toBeVisible" with timeout 20000ms
  - waiting for getByRole('heading', { name: 'Add Test Repository' })
    42 × locator resolved to <h1 class="text-2xl font-bold text-gray-900">Add Test Repository</h1>
       - unexpected value "visible"

```

```yaml
- heading "Add Test Repository" [level=1]
```

# Test source

```ts
  133 |     await expect(this.page.getByRole('heading', { name: 'Create Environment' })).toBeVisible({ timeout: 10_000 })
  134 |     await this.envNameInput.fill(name)
  135 |     await this.envDescInput.fill(description)
  136 |     await this.submitEnvBtn.click()
  137 |   }
  138 | 
  139 |   async deleteEnvironment(name: string) {
  140 |     const card = this.page.locator('.card-hover, div.border').filter({ hasText: name }).first()
  141 |     await card.getByRole('button').last().click()
  142 |     await this.deleteEnvConfirmBtn.click()
  143 |   }
  144 | 
  145 |   // Cycles actions
  146 |   async createCycle(name: string, start: string, end: string, desc?: string) {
  147 |     await this.newCycleBtn.click()
  148 |     await expect(this.page.getByRole('heading', { name: 'New Cycle' })).toBeVisible({ timeout: 10_000 })
  149 |     await this.cycleNameInput.fill(name)
  150 |     if (desc) {
  151 |       await this.cycleDescInput.fill(desc)
  152 |     }
  153 |     await this.cycleStartInput.fill(start)
  154 |     await this.cycleEndInput.fill(end)
  155 |     await this.submitCycleBtn.click()
  156 |     await expect(this.page.getByText('Loading...')).not.toBeVisible({ timeout: 15_000 }).catch(() => {})
  157 |   }
  158 | 
  159 |   async editCycle(oldName: string, newName: string) {
  160 |     const row = this.page.locator('div.group.flex').filter({ hasText: oldName }).first()
  161 |     await row.hover()
  162 |     
  163 |     const editBtn = row.getByTitle('Edit cycle').first()
  164 |     await editBtn.click({ force: true })
  165 |     await expect(this.page.getByRole('heading', { name: 'Edit Cycle' })).toBeVisible({ timeout: 10_000 })
  166 |     await this.cycleNameInput.fill(newName)
  167 |     await this.submitCycleBtn.click()
  168 |   }
  169 | 
  170 |   async deleteCycle(name: string) {
  171 |     const row = this.page.locator('div.group.flex').filter({ hasText: name }).first()
  172 |     await row.hover()
  173 |     
  174 |     const deleteBtn = row.getByTitle('Delete cycle').first()
  175 |     await deleteBtn.click({ force: true })
  176 |     await this.deleteCycleConfirmBtn.click()
  177 |   }
  178 | 
  179 |   getCycleNode(name: string): Locator {
  180 |     return this.page.locator('main').getByText(name).first()
  181 |   }
  182 | 
  183 |   // Runs actions
  184 |   async createRun(name: string, planName: string, description?: string) {
  185 |     await this.runNameInput.fill(name)
  186 |     if (description) {
  187 |       await this.page.locator('#description').fill(description)
  188 |     }
  189 | 
  190 |     // Select Plan trigger
  191 |     await this.planTrigger.click()
  192 |     await this.page.getByRole('option', { name: planName }).click()
  193 | 
  194 |     // Select Environment trigger
  195 |     await this.environmentTrigger.click()
  196 |     await this.page.getByRole('option').first().click()
  197 | 
  198 |     // Select Cycle trigger
  199 |     const cycleVis = await this.cycleTrigger.isVisible().catch(() => false)
  200 |     if (cycleVis) {
  201 |       await this.cycleTrigger.click()
  202 |       await this.page.getByRole('option').first().click()
  203 |     }
  204 | 
  205 |     await this.createRunBtn.click()
  206 |   }
  207 | 
  208 |   async associateTestCase(caseTitle: string) {
  209 |     await this.addTestCasesBtn.click()
  210 |     await expect(this.page.getByRole('heading', { name: 'Add Test Repository' })).toBeVisible({ timeout: 20_000 })
  211 | 
  212 |     const orphanHeader = this.page.getByText('Orphan Test Cases')
  213 |     if (await orphanHeader.isVisible()) {
  214 |       await orphanHeader.click()
  215 |     }
  216 | 
  217 |     // Anchor on the case title's exact text, then its direct parent row —
  218 |     // filtering generic `div.flex` wrappers by substring text and taking
  219 |     // `.last()` is ambiguous once there are many similarly-prefixed case
  220 |     // titles in the list (accumulated E2E data does exactly this) and can
  221 |     // silently check the wrong case's checkbox.
  222 |     const caseTitleEl = this.page.getByText(caseTitle, { exact: true })
  223 |     await expect(caseTitleEl).toBeVisible({ timeout: 15_000 })
  224 |     // Nearest ancestor that has a checkbox descendant, rather than assuming a
  225 |     // fixed nesting depth between the title and its row's checkbox.
  226 |     const caseRow = caseTitleEl.locator('xpath=ancestor::*[.//input[@type="checkbox"] or .//*[@role="checkbox"]][1]')
  227 |     await caseRow.getByRole('checkbox').first().click()
  228 |     await expect(this.addCasesConfirmBtn).toBeEnabled({ timeout: 10_000 })
  229 |     await this.addCasesConfirmBtn.click()
  230 |     // Wait for the modal to actually close rather than returning immediately —
  231 |     // the caller checks the run's detail table for the new case right after,
  232 |     // which doesn't wait long enough on its own for the association to land.
> 233 |     await expect(this.page.getByRole('heading', { name: 'Add Test Repository' })).not.toBeVisible({ timeout: 20_000 })
      |                                                                                       ^ Error: expect(locator).not.toBeVisible() failed
  234 |   }
  235 | 
  236 |   async removeTestCase(caseTitle: string) {
  237 |     const detailRow = this.page.locator('div.flex-col.sm\\:flex-row').filter({ hasText: caseTitle }).first()
  238 |     await detailRow.getByRole('checkbox').click()
  239 |     await this.deleteSelectedCasesBtn.click()
  240 |   }
  241 | 
  242 |   async searchRuns(searchTerm: string) {
  243 |     await this.searchRunsInput.fill(searchTerm)
  244 |     await this.page.waitForTimeout(1000)
  245 |   }
  246 | 
  247 |   async deleteRun(name: string) {
  248 |     const listRow = this.page.locator('tbody tr').filter({ hasText: name }).first()
  249 |     await listRow.getByRole('button', { name: 'More actions' }).click()
  250 |     await this.page.getByRole('menuitem', { name: 'Edit' }).click()
  251 |     
  252 |     await expect(this.page.getByRole('heading', { name: 'Edit Test Run' })).toBeVisible({ timeout: 15_000 })
  253 |     // wait, RUN-009 deletes via checkbox on list!
  254 |   }
  255 | 
  256 |   async bulkDeleteRun(name: string) {
  257 |     const listRow = this.page.locator('tbody tr').filter({ hasText: name }).first()
  258 |     await listRow.locator('input[type="checkbox"]').first().click()
  259 |     await this.bulkDeleteRunsBtn.click()
  260 |     await this.bulkConfirmDeleteRunsBtn.click()
  261 |   }
  262 | }
  263 | 
```