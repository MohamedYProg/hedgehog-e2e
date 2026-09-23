import { Page, Locator } from '@playwright/test'

export class NotificationsPage {
  readonly page: Page
  readonly projectKey: string

  // Header & Profile Menu Locators
  readonly userMenuBtn: Locator
  readonly signOutMenuItem: Locator

  // Notification Bell Locators
  readonly bellBtn: Locator
  readonly badge: Locator
  readonly popupHeading: Locator
  readonly markAllReadBtn: Locator

  // Comment Form Locators
  readonly commentInput: Locator
  readonly addCommentBtn: Locator

  constructor(page: Page, projectKey: string) {
    this.page = page
    this.projectKey = projectKey

    // Header & Profile Menu
    this.userMenuBtn = page.locator('header button').last()
    this.signOutMenuItem = page.getByRole('menuitem', { name: 'Sign out' })

    // Notification Bell & Popup
    this.bellBtn = page.locator('button[aria-label^="Notifications"]')
    this.badge = this.bellBtn.locator('span')
    this.popupHeading = page.getByRole('heading', { name: 'Notifications' })
    this.markAllReadBtn = page.getByRole('button', { name: 'Mark all read' })

    // Comment Form
    this.commentInput = page.getByPlaceholder('Add a comment... use @ to mention a teammate')
    this.addCommentBtn = page.getByRole('button', { name: 'Add Comment' })
  }

  async signOut() {
    await this.userMenuBtn.click()
    await this.signOutMenuItem.click()
  }

  async openNotifications() {
    await this.bellBtn.click()
  }

  async markAllAsRead() {
    await this.markAllReadBtn.click()
  }

  async addComment(text: string) {
    await this.commentInput.fill(text)
    await this.addCommentBtn.click()
  }

  getCommentCard(user: string, text: string): Locator {
    return this.page.locator('div.border.rounded-lg').filter({ hasText: user }).filter({ hasText: text }).first()
  }

  getNotificationItem(text: string): Locator {
    return this.page.locator('button').filter({ hasText: text }).first()
  }
}
