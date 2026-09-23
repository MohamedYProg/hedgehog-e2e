import { Page, Locator } from '@playwright/test'

export class PasswordResetPage {
  readonly page: Page
  readonly baseUrl: string

  // Form Locators
  readonly newPasswordInput: Locator
  readonly confirmPasswordInput: Locator
  readonly submitButton: Locator

  constructor(page: Page, baseUrl: string = '') {
    this.page = page
    this.baseUrl = baseUrl

    // Form Locators
    this.newPasswordInput = page.locator('#newPassword')
    this.confirmPasswordInput = page.locator('#confirmPassword')
    this.submitButton = page.getByRole('button', { name: 'Update password' })
  }

  async goto(token: string) {
    await this.page.goto(`${this.baseUrl}/auth/reset-password?token=${token}`)
  }

  async fillForm(newPassword: string, confirmPassword: string) {
    await this.newPasswordInput.fill(newPassword)
    await this.confirmPasswordInput.fill(confirmPassword)
  }

  async submit() {
    await this.submitButton.click()
  }

  async resetPassword(newPassword: string, confirmPassword: string) {
    await this.fillForm(newPassword, confirmPassword)
    await this.submit()
  }
}
