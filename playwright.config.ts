import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Parse .env file manually to avoid external dependencies
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const delimiterIndex = trimmed.indexOf('=');
      if (delimiterIndex > -1) {
        const key = trimmed.slice(0, delimiterIndex).trim();
        const val = trimmed.slice(delimiterIndex + 1).trim();
        // Only set if not already set by command line
        if (key && !(key in process.env)) {
          process.env[key] = val;
        }
      }
    }
  });
}

const authFile = 'tests/.auth/user.json';

export default defineConfig({
  testDir: './tests',
  timeout: 300_000,          // 5 min per test
  expect: {
    timeout: 300_000,        // 5 min per assertion
  },
  fullyParallel: false,
  workers: 1,                // Run sequentially to prevent CPU overload on slow machines
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    navigationTimeout: 300_000, // 5 min for page navigations
    actionTimeout: 300_000,     // 5 min for individual actions
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /permissions\/.*\.spec\.ts/],
    },
    {
      name: 'permissions',
      testMatch: /permissions\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
      timeout: 300_000,       // 5 min per permissions test
    },
  ],
});
