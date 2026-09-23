import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication Regression (AUTH)', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('AUTH-001: Login with valid admin credentials succeeds', async ({ page }) => {
    await loginPage.login('admin', 'admin123');

    // Should redirect to projects page
    await expect(page).toHaveURL(/.*\/app\/projects/);

    // Verify user profile stored in localStorage
    const userJson = await page.evaluate(() => localStorage.getItem('user'));
    expect(userJson).not.toBeNull();
    const user = JSON.parse(userJson || '{}');
    expect(user.loginName).toBe('admin');
  });

  test('AUTH-002: Login with wrong password shows error', async ({ page }) => {
    await loginPage.login('admin', 'wrongpassword');

    // Should stay on signin page
    await expect(page).toHaveURL(/.*\/auth\/signin/);

    // Error alert should be visible
    const alert = loginPage.errorAlert.filter({ hasText: 'Invalid' }).first();
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Invalid login credentials');
  });
});
