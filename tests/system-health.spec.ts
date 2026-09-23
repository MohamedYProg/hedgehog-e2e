import { expect, test } from '@playwright/test'

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

test.describe('System Health checks', () => {
  test('SYS-001: Public health endpoint returns operational status metrics', async ({ request }) => {
    // Fire a public request to the system health route
    const response = await request.get(`${BASE_URL}/api/v1/system/health`)
    expect(response.status()).toBe(200)

    const healthData = await response.json()
    expect(healthData.success).toBeTruthy()
    expect(healthData.data).toBeTruthy()

    const { status, database, uptime, memory, version } = healthData.data
    
    // Assert general metrics
    expect(status).toBe('healthy')
    expect(database.status).toBe('healthy')
    expect(database.responseTime).toBeGreaterThanOrEqual(0)
    
    // Assert node version and platform parameters are populated
    expect(version.node).toContain('v')
    expect(version.platform).toBeTruthy()
    expect(version.arch).toBeTruthy()

    // Assert memory numbers are positive
    expect(memory.rss).toBeGreaterThan(0)
    expect(memory.heapUsed).toBeGreaterThan(0)

    // Assert uptime fields exist
    expect(uptime.seconds).toBeGreaterThan(0)
    expect(uptime.human).toBeTruthy()
  })
})
