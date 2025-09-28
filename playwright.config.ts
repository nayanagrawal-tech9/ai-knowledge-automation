import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Global timeout for each test */
  timeout: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : parseInt(process.env.PARALLEL_WORKERS || '1'),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
    ['allure-playwright', { 
      outputFolder: 'allure-results',
      detail: true,
      suiteTitle: false 
    }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'https://ai-knowledge-chat-ui.vercel.app',

    /* Set normal desktop viewport size */
    viewport: { width: 1366, height: 768 },

    /* Custom User Agent to appear more like a real browser */
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: process.env.CAPTURE_VIDEOS === 'true' ? 'retain-on-failure' : 'off',
    
    /* Default timeout for actions */
    actionTimeout: 10000,
    
    /* Default timeout for navigation */
    navigationTimeout: parseInt(process.env.NAVIGATION_TIMEOUT || '30000'),
  },

  /* Global test setup */
  globalSetup: require.resolve('./src/utils/global-setup.ts'),

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        /* Use Chrome for better OAuth support */
        channel: 'chrome',
        /* Realistic User Agent */
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        /* Normal desktop viewport size */
        viewport: { width: 1366, height: 768 },
        /* Slow down for better visibility during development */
        launchOptions: {
          slowMo: parseInt(process.env.SLOW_MO || '100'),
          args: [
            '--start-maximized', // Start browser maximized
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--no-sandbox',
            '--disable-setuid-sandbox'
          ]
        },
      },
    },

    // Only Chrome browser for testing
    // Removed Firefox and Safari configurations
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
