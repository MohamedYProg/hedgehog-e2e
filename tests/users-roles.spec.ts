import { expect, test } from '@playwright/test'
import { adminUrl, loginAs } from './helpers/auth'
import { SettingsPage } from '../pages/SettingsPage'

test.describe('Users & Roles Management – Admin', () => {
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page)
    // Log in as admin and skip project selection since we're in admin panel
    await loginAs(page, 'admin', { skipProject: true })
    await settingsPage.gotoUserManagement()
    await expect(settingsPage.headingUserManagement).toBeVisible({ timeout: 30_000 })
  })

  test('S1 - Admin can search and filter the users list', async ({ page }) => {
    // Wait for the users list to load (by checking total items text or user cards)
    await expect(settingsPage.userCountText).toBeVisible({ timeout: 15_000 })

    // Search for 'admin'
    await settingsPage.searchUsers('admin')
    
    // Verify results count and that the admin user card is visible
    await expect(page.getByText('admin', { exact: false }).first()).toBeVisible()
  })

  test('S2 - Admin can create a new user with password validation', async () => {
    await expect(settingsPage.createUserBtn).toBeVisible()
    await settingsPage.createUserBtn.click()

    // Create User Modal should show up
    await expect(settingsPage.page.getByRole('heading', { name: 'Create New User' })).toBeVisible()

    // 1. Check password validations by filling in an invalid short password
    await settingsPage.passwordInput.fill('short')
    
    // The submit button should be disabled
    await expect(settingsPage.submitBtn).toBeDisabled()

    // 2. Fill in valid password and required fields
    const uniqueId = Date.now()
    const username = `e2e_${uniqueId}`
    const email = `e2e_${uniqueId}@example.com`

    await settingsPage.loginNameInput.fill(username)
    await settingsPage.firstNameInput.fill('E2E')
    await settingsPage.lastNameInput.fill('User')
    await settingsPage.emailInput.fill(email)
    await settingsPage.titleInput.fill('QA Automation Engineer')
    await settingsPage.passwordInput.fill('SecurePassword123!')

    // Now submit button should be enabled
    await expect(settingsPage.submitBtn).toBeEnabled()
    await settingsPage.submitBtn.click()

    // Verify success toast or modal closing and user list updated
    await expect(settingsPage.page.getByRole('heading', { name: 'Create New User' })).not.toBeVisible()
    
    // Verify newly created user is in the list
    await settingsPage.searchUsers(username)
    await expect(settingsPage.page.getByText(`${username}`).first()).toBeVisible({ timeout: 10_000 })
  })

  test('S3 - Admin can view user details, assign a project role, and remove role assignment', async ({ page }) => {
    // 1. Create the user
    await settingsPage.createUserBtn.click()

    const uniqueId = Date.now()
    const username = `e2e_role_${uniqueId}`
    const email = `e2e_role_${uniqueId}@example.com`

    await settingsPage.loginNameInput.fill(username)
    await settingsPage.firstNameInput.fill('E2ERole')
    await settingsPage.lastNameInput.fill('User')
    await settingsPage.emailInput.fill(email)
    await settingsPage.passwordInput.fill('SecurePassword123!')
    await settingsPage.submitBtn.click()

    // 2. Search and open View modal
    await settingsPage.searchUsers(username)
    
    const userCard = settingsPage.getUserCard(email)
    await expect(userCard).toBeVisible({ timeout: 15_000 })

    await userCard.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('heading', { name: 'E2ERole User' })).toBeVisible()

    // 3. Assign role
    await settingsPage.assignProjectRole(1, 'QA Tester')

    await expect(page.locator('p', { hasText: 'QA Tester' }).first()).toBeVisible()

    // 4. Remove role assignment
    const roleCard = page.locator('.border.rounded-lg.bg-gray-50').filter({ hasText: 'QA Tester' }).first()
    await roleCard.getByRole('button').click()

    // Confirm Remove dialog should open
    const removeBtn = page.getByRole('button', { name: 'Remove', exact: true })
    await removeBtn.click()

    // Verify QA Tester role is gone
    await expect(page.locator('p', { hasText: 'QA Tester' })).not.toBeVisible()

    // Close view modal
    await page.getByRole('button', { name: 'Close', exact: true }).click()
    
    // Cleanup: delete this role-test user since they have no role assignments now
    await userCard.getByRole('button', { name: 'View' }).click()
    await settingsPage.deleteUserBtn.click()
    await settingsPage.confirmDeleteUserBtn.click()
  })

  test('S4 - Admin can edit user profile, reset password, toggle status, and delete user', async ({ page }) => {
    // 1. Create user
    await settingsPage.createUserBtn.click()

    const uniqueId = Date.now()
    const username = `e2e_profile_${uniqueId}`
    const email = `e2e_profile_${uniqueId}@example.com`

    await settingsPage.loginNameInput.fill(username)
    await settingsPage.firstNameInput.fill('E2EProfile')
    await settingsPage.lastNameInput.fill('User')
    await settingsPage.emailInput.fill(email)
    await settingsPage.passwordInput.fill('SecurePassword123!')
    await settingsPage.submitBtn.click()

    // 2. Search and view modal
    await settingsPage.searchUsers(username)
    
    const userCard = settingsPage.getUserCard(email)
    await expect(userCard).toBeVisible({ timeout: 15_000 })

    await userCard.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('heading', { name: 'E2EProfile User' })).toBeVisible()

    // 3. Edit profile
    await settingsPage.editProfileBtn.click()
    await settingsPage.editFirstNameInput.fill('E2EProfile Edited')
    await settingsPage.editLastNameInput.fill('User Edited')
    await settingsPage.saveChangesBtn.click()

    // Wait for update to propagate
    await expect(page.getByRole('heading', { name: 'Edit User' })).not.toBeVisible()
    await expect(userCard.getByText('E2EProfile Edited User Edited').first()).toBeVisible({ timeout: 10_000 })

    // Reopen View modal
    await userCard.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).toBeVisible()

    // 4. Reset Password
    await settingsPage.resetPasswordBtn.click()
    await settingsPage.forceResetPasswordInput.fill('NewSecurePassword123!')
    await settingsPage.savePasswordBtn.click()
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).toBeVisible()

    // 5. Toggle Status
    // Deactivate
    await settingsPage.deactivateBtn.click()
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).not.toBeVisible()

    // Wait for list to reload status to INACTIVE
    await expect(userCard.getByText('INACTIVE')).toBeVisible({ timeout: 15_000 })

    // Reopen and verify INACTIVE
    await userCard.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).toBeVisible()
    await expect(page.locator('span', { hasText: 'INACTIVE' }).first()).toBeVisible()

    // Activate
    await settingsPage.activateBtn.click()
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).not.toBeVisible()

    // Wait for list to reload status to ACTIVE
    await expect(userCard.getByText('ACTIVE')).toBeVisible({ timeout: 15_000 })

    // Reopen and verify ACTIVE
    await userCard.getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).toBeVisible()
    await expect(page.locator('span', { hasText: 'ACTIVE' }).first()).toBeVisible()

    // 6. Delete User
    await settingsPage.deleteUserBtn.click()
    await settingsPage.confirmDeleteUserBtn.click()

    // Verify deleted
    await expect(page.getByRole('heading', { name: 'E2EProfile Edited User Edited' })).not.toBeVisible()
    await settingsPage.searchUsers(username)
    await expect(page.getByText('No users found')).toBeVisible()
  })
})
