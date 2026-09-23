import { test, expect } from '@playwright/test'
import { loginAs, API_URL } from '../helpers/auth'

// ============================================================================
// Section 6: Attachments (Scenarios 26-28)
// ============================================================================

test.describe('Attachments - Permissions', () => {
  // Scenario 26: API enforcement - Viewer cannot upload attachment
  test('S26 - API returns 403 for Viewer uploading attachment', async ({ page }) => {
    await loginAs(page, 'viewer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/attachments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test content'),
        },
        entityType: 'DEFECT',
        entityId: 'fake-id',
      },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 27: Developer cannot upload attachment (no attachments.create)
  test('S27 - API returns 403 for Developer uploading attachment', async ({ page }) => {
    await loginAs(page, 'developer')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/attachments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test content'),
        },
        entityType: 'DEFECT',
        entityId: 'fake-id',
      },
    })

    expect(response.status()).toBe(403)
  })

  // Scenario 28: QA Tester CAN upload attachment (has attachments.create)
  test('S28 - API allows QA Tester to upload attachment (not 403)', async ({ page }) => {
    await loginAs(page, 'qa_tester')

    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'))

    const response = await page.request.post(`${API_URL}/api/v1/attachments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test content'),
        },
        entityType: 'DEFECT',
        entityId: 'fake-id',
      },
    })

    // QA Tester HAS attachments.create, so the permission gate must pass. The
    // entityId is a non-existent 'fake-id', so the expected outcome is a
    // validation/not-found error (400/404) — NOT a 403 (forbidden) and NOT a
    // 401 (auth). Asserting an explicit allowed set means this can actually fail
    // if the permission check regresses (a bare `.not.toBe(403)` passes on
    // 401/500 too, hiding real breakage).
    expect([200, 201, 400, 404]).toContain(response.status())
    expect(response.status()).not.toBe(403)
    expect(response.status()).not.toBe(401)
  })
})
