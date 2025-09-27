import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Login Page
 */
export class LoginPage extends BasePage {
  // Page URL
  private readonly LOGIN_URL = 'https://ai-knowledge-chat-ui.vercel.app/login';

  // Page elements
  private readonly pageTitle: Locator;
  private readonly logo: Locator;
  private readonly headerText: Locator;
  private readonly subHeaderText: Locator;
  private readonly ssoButton: Locator;
  private readonly secureLoginText: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageTitle = page.locator('h1').filter({ hasText: 'Universal Knowledge Chatbot' });
    this.logo = page.locator('img[alt*="Universal Knowledge Chatbot Logo"]');
    this.headerText = page.locator('h1:has-text("Universal Knowledge Chatbot")');
    this.subHeaderText = page.locator('text=Sign in to your account using your organization\'s SSO');
    this.ssoButton = page.locator('button:has-text("Sign in with SSO")');
    this.secureLoginText = page.locator('text=Secure login powered by Auth0');
  }

  /**
   * Navigate to the login page
   */
  async navigateToLogin(): Promise<void> {
    await this.goto(this.LOGIN_URL);
    await this.waitForPageLoad();
  }

  /**
   * Verify login page elements are visible
   */
  async verifyLoginPageElements(): Promise<void> {
    await this.waitForElement(this.logo);
    await this.waitForElement(this.headerText);
    await this.waitForElement(this.subHeaderText);
    await this.waitForElement(this.ssoButton);
    await this.waitForElement(this.secureLoginText);
  }

  /**
   * Click on Sign in with SSO button
   */
  async clickSignInWithSSO(): Promise<void> {
    await this.clickElement(this.ssoButton);
  }

  /**
   * Get the header text
   */
  async getHeaderText(): Promise<string> {
    return await this.getElementText(this.headerText);
  }

  /**
   * Get the sub header text
   */
  async getSubHeaderText(): Promise<string> {
    return await this.getElementText(this.subHeaderText);
  }

  /**
   * Check if SSO button is enabled
   */
  async isSSOButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.ssoButton.isDisabled();
    return !isDisabled;
  }

  /**
   * Check if logo is visible
   */
  async isLogoVisible(): Promise<boolean> {
    return await this.isElementVisible(this.logo);
  }

  /**
   * Get SSO button text
   */
  async getSSOButtonText(): Promise<string> {
    return await this.getElementText(this.ssoButton);
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(): Promise<string> {
    return await this.getTitle();
  }

  /**
   * Wait for login page to load completely
   */
  async waitForLoginPageLoad(): Promise<void> {
    await this.waitForElement(this.ssoButton);
    await this.waitForPageLoad();
  }

  // Getters for elements (useful for custom assertions)
  get logoElement(): Locator {
    return this.logo;
  }

  get ssoButtonElement(): Locator {
    return this.ssoButton;
  }

  get headerElement(): Locator {
    return this.headerText;
  }

  get subHeaderElement(): Locator {
    return this.subHeaderText;
  }
}
