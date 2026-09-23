# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: components.spec.ts >> Components (Modules) – CRUD >> C – creates a module via the New Module modal
- Location: tests\components.spec.ts:16:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('tbody').getByText('E2E Module 1790151722511', { exact: true })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('tbody').getByText('E2E Module 1790151722511', { exact: true })

```

```yaml
- main:
  - img "HedgeHog Logo"
  - text: HedgeHog
  - button "Collapse sidebar"
  - button "TMT"
  - navigation:
    - button "Test Plans"
    - button "Modules"
    - button "Requirements"
    - button "Test Repository"
    - button "Defects"
    - button "Test Lab"
    - button "Reports"
  - heading "Modules" [level=2]
  - button "Open search"
  - button "Notifications"
  - button "Updated User admin@hedgehog.com":
    - paragraph: Updated User
    - paragraph: admin@hedgehog.com
  - main:
    - text: Modules
    - button "Create Module"
    - button "Import"
    - button "Export"
    - textbox "Search modules...": E2E Module 1790151722511
    - button "Delete"
    - button "Open table options"
    - table:
      - rowgroup:
        - row "Select all modules Module Name Description Defects Requirements Created Actions":
          - columnheader "Select all modules":
            - checkbox "Select all modules"
          - columnheader "Module Name":
            - button "Module Name"
          - columnheader "Description"
          - columnheader "Defects"
          - columnheader "Requirements"
          - columnheader "Created":
            - button "Created"
          - columnheader "Actions"
      - rowgroup:
        - row "Select module cms2ztp5101xwugl0afovpj12 E2E Module 1785921257520 [edited] Created by Playwright E2E test 14 0 7/27/2026":
          - cell "Select module cms2ztp5101xwugl0afovpj12":
            - checkbox "Select module cms2ztp5101xwugl0afovpj12"
          - cell "E2E Module 1785921257520 [edited]":
            - button "E2E Module 1785921257520 [edited]"
          - cell "Created by Playwright E2E test"
          - cell "14":
            - link "14":
              - /url: /app/TMTT/defects?componentSubtreeOf=TMTT-MOD-14
          - cell "0"
          - cell "7/27/2026"
          - cell:
            - button "Edit module"
            - button "Delete module"
        - row "Select module cmshbwi4b0003ug684flfavhh E2E Module 1786009424292 Created by Playwright E2E test 0 0 8/6/2026":
          - cell "Select module cmshbwi4b0003ug684flfavhh":
            - checkbox "Select module cmshbwi4b0003ug684flfavhh"
          - cell "E2E Module 1786009424292":
            - button "E2E Module 1786009424292"
          - cell "Created by Playwright E2E test"
          - cell "0"
          - cell "0"
          - cell "8/6/2026"
          - cell:
            - button "Edit module"
            - button "Delete module"
        - row "Select module cms1phyqp00nmugt0nl0k52h6 E2E Module 1786009424292 [edited] Created by Playwright E2E test 0 0 7/26/2026":
          - cell "Select module cms1phyqp00nmugt0nl0k52h6":
            - checkbox "Select module cms1phyqp00nmugt0nl0k52h6"
          - cell "E2E Module 1786009424292 [edited]":
            - button "E2E Module 1786009424292 [edited]"
          - cell "Created by Playwright E2E test"
          - cell "0"
          - cell "0"
          - cell "7/26/2026"
          - cell:
            - button "Edit module"
            - button "Delete module"
        - row "Select module cmsofn8310003ugfs0roppvfu E2E Module 1786438968587 Created by Playwright E2E test 0 0 8/11/2026":
          - cell "Select module cmsofn8310003ugfs0roppvfu":
            - checkbox "Select module cmsofn8310003ugfs0roppvfu"
          - cell "E2E Module 1786438968587":
            - button "E2E Module 1786438968587"
          - cell "Created by Playwright E2E test"
          - cell "0"
          - cell "0"
          - cell "8/11/2026"
          - cell:
            - button "Edit module"
            - button "Delete module"
        - row "Select module cmsfver0601gfugtovbcpcm5y E2E Module 1786438968587 [edited] Created by Playwright E2E test 1 0 8/5/2026":
          - cell "Select module cmsfver0601gfugtovbcpcm5y":
            - checkbox "Select module cmsfver0601gfugtovbcpcm5y"
          - cell "E2E Module 1786438968587 [edited]":
            - button "E2E Module 1786438968587 [edited]"
          - cell "Created by Playwright E2E test"
          - cell "1":
            - link "1":
              - /url: /app/TMTT/defects?componentSubtreeOf=TMTT-MOD-38
          - cell "0"
          - cell "8/5/2026"
          - cell:
            - button "Edit module"
            - button "Delete module"
- button "Open Tanstack query devtools":
  - img
- alert
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test'
  2  | import { ModulesPage } from '../pages/ModulesPage'
  3  | 
  4  | const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'
  5  | const PROJECT_KEY = process.env.E2E_PROJECT_KEY || 'TMTT'
  6  | 
  7  | let createdName = ''
  8  | 
  9  | test.describe.serial('Components (Modules) – CRUD', () => {
  10 |   let modulesPage: ModulesPage
  11 | 
  12 |   test.beforeEach(async ({ page }) => {
  13 |     modulesPage = new ModulesPage(page, PROJECT_KEY, BASE_URL)
  14 |   })
  15 | 
  16 |   test('C – creates a module via the New Module modal', async () => {
  17 |     createdName = `E2E Module ${Date.now()}`
  18 | 
  19 |     await modulesPage.goto()
  20 |     await modulesPage.waitForList()
  21 | 
  22 |     await modulesPage.createNewModule(createdName, 'Created by Playwright E2E test')
  23 | 
  24 |     // Wait for modal to close, then search to confirm the item exists in the list
  25 |     await expect(modulesPage.nameInput).not.toBeVisible({ timeout: 10_000 })
  26 |     await modulesPage.searchModule(createdName)
> 27 |     await expect(modulesPage.getModuleCell(createdName)).toBeVisible({ timeout: 10_000 })
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  28 |   })
  29 | 
  30 |   test('R – module appears in the list', async () => {
  31 |     test.skip(!createdName, 'Skipped — Create test did not produce a name')
  32 | 
  33 |     await modulesPage.goto()
  34 |     await modulesPage.waitForList()
  35 | 
  36 |     await modulesPage.searchModule(createdName)
  37 |     await expect(modulesPage.getModuleCell(createdName)).toBeVisible({ timeout: 10_000 })
  38 |   })
  39 | 
  40 |   test('U – edits the module name via the Edit modal', async () => {
  41 |     test.skip(!createdName, 'Skipped — no created name')
  42 | 
  43 |     await modulesPage.goto()
  44 |     await modulesPage.waitForList()
  45 | 
  46 |     await modulesPage.searchModule(createdName)
  47 | 
  48 |     // Edit the module
  49 |     const updatedName = createdName + ' [edited]'
  50 |     await modulesPage.editFirstModuleName(updatedName)
  51 | 
  52 |     // Modal closes; verify updated name appears in the table
  53 |     await expect(modulesPage.getModuleCell(updatedName)).toBeVisible({ timeout: 10_000 })
  54 | 
  55 |     createdName = updatedName
  56 |   })
  57 | 
  58 |   test('D – deletes the module via the Delete modal', async () => {
  59 |     test.skip(!createdName, 'Skipped — no created name')
  60 | 
  61 |     await modulesPage.goto()
  62 |     await modulesPage.waitForList()
  63 | 
  64 |     await modulesPage.searchModule(createdName)
  65 | 
  66 |     await modulesPage.deleteFirstModule()
  67 | 
  68 |     await expect(modulesPage.getModuleCell(createdName)).not.toBeVisible({ timeout: 10_000 })
  69 |   })
  70 | })
  71 | 
```