import { expect, Page } from '@playwright/test'

export type RoleName =
  | 'admin'
  | 'project_manager'
  | 'qa_lead'
  | 'developer'
  | 'qa_tester'
  | 'viewer'

interface UserCredentials {
  loginName: string
  password: string
  displayName: string
}

export const ROLE_USERS: Record<RoleName, UserCredentials> = {
  admin: { loginName: 'admin', password: 'admin123', displayName: 'Admin User' },
  project_manager: { loginName: 'john.doe', password: 'password123', displayName: 'John Doe' },
  qa_lead: { loginName: 'jane.smith', password: 'password123', displayName: 'Jane Smith' },
  developer: { loginName: 'mike.wilson', password: 'password123', displayName: 'Mike Wilson' },
  qa_tester: { loginName: 'sarah.johnson', password: 'password123', displayName: 'Sarah Johnson' },
  viewer: { loginName: 'viewer.user', password: 'password123', displayName: 'View Only' },
}

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3000'
const API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3001'
const PROJECT_KEY = process.env.E2E_PROJECT_KEY ?? 'TMTT'

/**
 * Log in as a specific role user, navigate to project context,
 * and wait for project data to load.
 *
 * Pass `{ skipProject: true }` for tests that only use the admin panel.
 */
export async function loginAs(
  page: Page,
  role: RoleName,
  opts: { skipProject?: boolean } = {},
) {
  const creds = ROLE_USERS[role]

  await page.goto(`${BASE_URL}/auth/signin`)
  await page.locator('#loginName').fill(creds.loginName)
  await page.locator('#password').fill(creds.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/.*\/app\/.*/, {
    timeout: 60_000,
  })

  await page.evaluate(() => {
    const userJson = localStorage.getItem('user')
    if (userJson) {
      const user = JSON.parse(userJson)
      if (user.id) localStorage.setItem('userId', user.id)
      if (user.email) localStorage.setItem('userEmail', user.email)
    }
  })

  if (!opts.skipProject) {
    await page.goto(`${BASE_URL}/app/projects`)

    // Try data-attribute first, fall back to text match for the project key
    let projectCard = page.locator(`[data-project-key="${PROJECT_KEY}"]`).first()
    const hasDataAttr = await projectCard.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasDataAttr) {
      // Fallback: find the card by the abbreviation text badge
      projectCard = page.locator(`text=${PROJECT_KEY}`).first()
    }
    await expect(projectCard).toBeVisible({ timeout: 30_000 })
    await projectCard.click()

    await page.waitForFunction(
      () => {
        const data = localStorage.getItem('currentProjectData')
        return !!data && data !== 'null'
      },
      { timeout: 60_000 },
    )
  }
}

/**
 * Navigate to a module page within the current project.
 */
export function projectUrl(module: string, subpath = '') {
  return `${BASE_URL}/app/${PROJECT_KEY}/${module}${subpath ? '/' + subpath : ''}`
}

/**
 * Navigate to an admin page.
 */
export function adminUrl(subpath = 'user-management') {
  return `${BASE_URL}/app/admin/${subpath}`
}

export { BASE_URL, API_URL, PROJECT_KEY }
