import { test as base, expect, chromium, BrowserContext } from '@playwright/test';
import { LoginPage, GoogleOAuthPage, HomePage } from '../pages';
import path from 'path';
import os from 'os';

/**
 * Custom test fixtures with persistent browser context
 */
type TestFixtures = {
  persistentContext: BrowserContext;
  loginPage: LoginPage;
  googleOAuthPage: GoogleOAuthPage;
  homePage: HomePage;
};

/**
 * Test with persistent browser context using real Chrome profile
 */
export const test = base.extend<TestFixtures>({
  persistentContext: async ({}, use) => {
    // Define the path to Chrome user data directory
    const userDataDir = path.join(os.homedir(), 'playwright-chrome-profile');
    
    // Launch browser with persistent context
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false, // Always run headed for persistent context
      channel: 'chrome', // Use real Chrome instead of Chromium
      args: [
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows',
        '--disable-client-side-phishing-detection',
        '--disable-default-apps',
        '--disable-extensions-http-throttling',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-sync',
        '--disable-translate',
        '--metrics-recording-only',
        '--no-first-run',
        '--safebrowsing-disable-auto-update',
        '--enable-automation',
        '--password-store=basic',
        '--use-mock-keychain'
      ],
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation', 'notifications'],
      // Additional options to appear more like a real user
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    await use(context);
    await context.close();
  },

  loginPage: async ({ persistentContext }, use) => {
    const page = persistentContext.pages()[0] || await persistentContext.newPage();
    
    // Add stealth modifications to avoid detection
    await page.addInitScript(() => {
      // Remove webdriver property
      delete (window as any).webdriver;
      
      // Mock plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
      
      // Mock languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Mock webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
      
      // Mock chrome object
      (window as any).chrome = { runtime: {} };
      
      // Mock permissions
      Object.defineProperty(navigator, 'permissions', {
        get: () => ({
          query: () => Promise.resolve({ state: 'granted' }),
        }),
      });
    });
    
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  googleOAuthPage: async ({ persistentContext }, use) => {
    const page = persistentContext.pages()[0] || await persistentContext.newPage();
    const googleOAuthPage = new GoogleOAuthPage(page);
    await use(googleOAuthPage);
  },

  homePage: async ({ persistentContext }, use) => {
    const page = persistentContext.pages()[0] || await persistentContext.newPage();
    const homePage = new HomePage(page);
    await use(homePage);
  },
});

export { expect };
