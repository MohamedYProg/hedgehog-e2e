import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly baseUrl: string
  readonly url: string

  // Form Locators
  readonly loginNameInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorAlert: Locator

  constructor(page: Page, baseUrl: string = '') {
    this.page = page
    this.baseUrl = baseUrl
    this.url = `${baseUrl}/auth/signin`

    // Form Locators
    this.loginNameInput = page.locator('#loginName')
    this.passwordInput = page.locator('#password')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorAlert = page.locator('div[role="alert"]')
  }

  async goto() {
    await this.page.goto(this.url)
  }

  async fillForm(loginName: string, secret: string) {
    await this.loginNameInput.fill(loginName)
    await this.passwordInput.fill(secret)
  }

  async submit() {
    await this.submitButton.click()
  }

  async login(loginName: string, secret: string) {
    await this.fillForm(loginName, secret)
    await this.submit()
  }

  async getErrorAlertText(): Promise<string> {
    return (await this.errorAlert.first().innerText()) || ''
  }
}
