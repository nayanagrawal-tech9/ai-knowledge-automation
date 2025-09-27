import { test as base, Page } from '@playwright/test';
import { LoginPage, GoogleOAuthPage, HomePage } from '../pages';

/**
 * Custom test fixtures that provide page objects
 */
type TestFixtures = {
  loginPage: LoginPage;
  googleOAuthPage: GoogleOAuthPage;
  homePage: HomePage;
};

/**
 * Extended test with page object fixtures
 */
export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  googleOAuthPage: async ({ page }, use) => {
    const googleOAuthPage = new GoogleOAuthPage(page);
    await use(googleOAuthPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
});

/**
 * Export expect from Playwright
 */
export { expect } from '@playwright/test';
