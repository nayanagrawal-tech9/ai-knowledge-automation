import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class containing common functionality for all page objects
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param url - The URL to navigate to
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for the page to load completely
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Get the current page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for an element to be visible
   * @param locator - The element locator
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Click an element with wait
   * @param locator - The element locator
   */
  async clickElement(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click({ force: true });
  }

  /**
   * Fill text in an input field
   * @param locator - The input field locator
   * @param text - Text to fill
   */
  async fillText(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.fill(text);
  }

  /**
   * Take a screenshot
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if element is visible
   * @param locator - The element locator
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   * @param locator - The element locator
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    const text = await locator.textContent();
    return text?.trim() || '';
  }

  /**
   * Wait for URL to contain specific text
   * @param urlPart - Part of URL to wait for
   * @param timeout - Maximum time to wait in milliseconds
   */
  async waitForUrlContains(urlPart: string, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(url => url.toString().includes(urlPart), { timeout });
  }
}
