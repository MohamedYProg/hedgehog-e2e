import { Page, Locator, expect } from '@playwright/test'

export class SettingsPage {
  readonly page: Page
  readonly baseUrl: string

  // Settings Tabs
  readonly statusConfigTab: Locator
  readonly workflowEditorTab: Locator
  readonly customFieldsTab: Locator

  // Status Configuration Locators
  readonly addStatusBtn: Locator
  readonly statusCodeInput: Locator
  readonly statusDisplayInput: Locator
  readonly statusCategorySelect: Locator
  readonly createBtn: Locator
  readonly deleteBtn: Locator

  // Custom Fields Locators
  readonly addFieldBtn: Locator
  readonly fieldNameInput: Locator
  readonly fieldTypeSelect: Locator
  readonly fieldDescInput: Locator

  // User Management Locators
  readonly headingUserManagement: Locator
  readonly userCountText: Locator
  readonly searchUsersInput: Locator
  readonly createUserBtn: Locator
  readonly loginNameInput: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly titleInput: Locator
  readonly submitBtn: Locator

  // User View Detail Locators
  readonly assignRoleBtn: Locator
  readonly projectSelect: Locator
  readonly roleSelect: Locator
  readonly editProfileBtn: Locator
  readonly editFirstNameInput: Locator
  readonly editLastNameInput: Locator
  readonly saveChangesBtn: Locator
  readonly resetPasswordBtn: Locator
  readonly forceResetPasswordInput: Locator
  readonly savePasswordBtn: Locator
  readonly deactivateBtn: Locator
  readonly activateBtn: Locator
  readonly deleteUserBtn: Locator
  readonly confirmDeleteUserBtn: Locator

  constructor(page: Page, baseUrl: string = '') {
    this.page = page
    this.baseUrl = baseUrl

    // Settings Tabs
    this.statusConfigTab = page.getByRole('button', { name: 'Status Configuration' })
    this.workflowEditorTab = page.getByRole('button', { name: 'Workflow Editor' })
    this.customFieldsTab = page.getByRole('button', { name: 'Custom Fields' })

    // Status Configuration
    this.addStatusBtn = page.getByRole('button', { name: 'Add Status' })
    this.statusCodeInput = page.getByPlaceholder('e.g., MY_STATUS')
    this.statusDisplayInput = page.getByPlaceholder('e.g., My Status')
    this.statusCategorySelect = page.locator('div').filter({ hasText: /New Status/i }).locator('select').first()
    this.createBtn = page.getByRole('button', { name: 'Create', exact: true })
    this.deleteBtn = page.getByRole('button', { name: 'Delete', exact: true })

    // Custom Fields
    this.addFieldBtn = page.getByRole('button', { name: 'Add Field' })
    this.fieldNameInput = page.getByPlaceholder('Field name')
    this.fieldTypeSelect = page.locator('div').filter({ hasText: /Custom Field/i }).locator('select').first()
    this.fieldDescInput = page.getByPlaceholder('Optional description')

    // User Management
    this.headingUserManagement = page.getByRole('heading', { name: 'User Management' }).first()
    this.userCountText = page.locator('p.text-sm.text-gray-500').first()
    this.searchUsersInput = page.getByPlaceholder('Search users by name, email, or login...')
    this.createUserBtn = page.getByRole('button', { name: 'Create User', exact: true })
    this.loginNameInput = page.locator('#loginName')
    this.firstNameInput = page.locator('#firstName')
    this.lastNameInput = page.locator('#lastName')
    this.emailInput = page.locator('#email')
    this.passwordInput = page.locator('#password')
    this.titleInput = page.locator('#title')
    this.submitBtn = page.locator('button[type="submit"]')

    // User View Detail & Edit
    this.assignRoleBtn = page.getByRole('button', { name: 'Assign Role', exact: true }).first()
    this.projectSelect = page.locator('#projectId')
    this.roleSelect = page.locator('#roleId')
    this.editProfileBtn = page.getByRole('button', { name: 'Edit' })
    this.editFirstNameInput = page.locator('#edit-firstName')
    this.editLastNameInput = page.locator('#edit-lastName')
    this.saveChangesBtn = page.getByRole('button', { name: 'Save Changes' })
    this.resetPasswordBtn = page.getByRole('button', { name: 'Reset Password' })
    this.forceResetPasswordInput = page.locator('#forceResetPassword')
    this.savePasswordBtn = page.getByRole('button', { name: 'Save Password' })
    this.deactivateBtn = page.getByRole('button', { name: 'Deactivate' })
    this.activateBtn = page.getByRole('button', { name: 'Activate' })
    this.deleteUserBtn = page.getByRole('button', { name: 'Delete', exact: true })
    this.confirmDeleteUserBtn = page.getByRole('button', { name: 'Delete User', exact: true })
  }

  async gotoAdminSettings() {
    await this.page.goto(`${this.baseUrl}/app/admin/settings`)
  }

  async gotoUserManagement() {
    await this.page.goto(`${this.baseUrl}/app/admin/user-management`)
  }

  async addCustomStatus(name: string, displayName: string, category: string) {
    await this.addStatusBtn.click()
    await this.statusCodeInput.fill(name)
    await this.statusDisplayInput.fill(displayName)
    await this.statusCategorySelect.selectOption(category)
    await this.createBtn.click()
  }

  async deleteCustomStatus(displayName: string) {
    const row = this.page.locator('.group').filter({ hasText: displayName }).first()
    await row.getByRole('button').last().click({ force: true })
    await this.deleteBtn.click()
  }

  async addCustomField(name: string, type: string, description: string) {
    await this.customFieldsTab.click()
    await this.addFieldBtn.click()
    await this.fieldNameInput.fill(name)
    await this.fieldTypeSelect.selectOption(type)
    await this.fieldDescInput.fill(description)
    await this.createBtn.click()
  }

  async deleteCustomField(name: string) {
    const row = this.page.locator('tbody tr').filter({ hasText: name }).first()
    await row.getByRole('button').last().click()
    await this.deleteBtn.click()
  }

  async searchUsers(query: string) {
    await this.searchUsersInput.fill(query)
  }

  async createUser(login: string, first: string, last: string, email: string, pass: string, title?: string) {
    await this.createUserBtn.click()
    await expect(this.page.getByRole('heading', { name: 'Create New User' })).toBeVisible()
    await this.loginNameInput.fill(login)
    await this.firstNameInput.fill(first)
    await this.lastNameInput.fill(last)
    await this.emailInput.fill(email)
    if (title) {
      await this.titleInput.fill(title)
    }
    await this.passwordInput.fill(pass)
    await this.submitBtn.click()
  }

  async assignProjectRole(index: number, roleName: string) {
    await this.assignRoleBtn.click()
    await this.projectSelect.selectOption({ index })
    await this.roleSelect.selectOption({ label: roleName })
    await this.submitBtn.click()
  }

  getUserCard(email: string): Locator {
    return this.page.locator('.rounded-lg').filter({ hasText: email }).first()
  }
}
