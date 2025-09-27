import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for Google OAuth Login Page
 */
export class GoogleOAuthPage extends BasePage {
  // Page elements
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly nextButton: Locator;
  private readonly forgotEmailButton: Locator;
  private readonly createAccountButton: Locator;
  private readonly signInHeader: Locator;
  private readonly googleLogo: Locator;
  private readonly continueToText: Locator;
  private readonly errorMessage: Locator;
  private readonly languageSelector: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.emailInput = page.locator('input[type="email"], input[id="identifierId"], input[name="identifier"]');
    this.passwordInput = page.locator('input[name="Passwd"], input[autocomplete="current-password"]:visible').first();
    this.nextButton = page.getByRole('button', { name: 'Next' }).first();
    this.forgotEmailButton = page.locator('button:has-text("Forgot email?")');
    this.createAccountButton = page.locator('button:has-text("Create account")');
    this.signInHeader = page.locator('h1:has-text("Sign in")');
    this.googleLogo = page.locator('img[alt*="Google"], [role="img"]:has-text("Google")');
    this.continueToText = page.locator('text=to continue to');
    this.errorMessage = page.locator('[role="alert"], .error-msg, [data-error="true"]');
    this.languageSelector = page.locator('select, [role="combobox"]:has-text("English")');
  }

  /**
   * Wait for Google OAuth page to load
   */
  async waitForGoogleOAuthPageLoad(): Promise<void> {
    await this.waitForUrlContains('accounts.google.com');
    await this.waitForElement(this.emailInput);
    await this.waitForPageLoad();
  }

  /**
   * Enter email address
   * @param email - Email address to enter
   */
  async enterEmail(email: string): Promise<void> {
    await this.fillText(this.emailInput, email);
  }

  /**
   * Enter password
   * @param password - Password to enter
   */
  async enterPassword(password: string): Promise<void> {
    await this.fillText(this.passwordInput, password);
  }

  /**
   * Click Next button
   */
  async clickNext(): Promise<void> {
    await this.clickElement(this.nextButton);
  }

  /**
   * Click Next button after password entry (more specific)
   */
  async clickNextAfterPassword(): Promise<void> {
    // Try multiple selectors for the Next button after password
    const nextSelectors = [
      'button:has-text("Next")',
      '[id="passwordNext"]',
      'button[type="submit"]',
      'input[type="submit"][value="Next"]'
    ];

    for (const selector of nextSelectors) {
      try {
        const button = this.page.locator(selector).first();
        if (await button.isVisible({ timeout: 3000 })) {
          await button.click();
          console.log(`✅ Next button clicked using selector: ${selector}`);
          return;
        }
      } catch (error) {
        console.log(`❌ Next button not found with selector: ${selector}`);
      }
    }

    // Fallback to original method
    await this.clickNext();
  }

  /**
   * Click Forgot Email button
   */
  async clickForgotEmail(): Promise<void> {
    await this.clickElement(this.forgotEmailButton);
  }

  /**
   * Click Create Account button
   */
  async clickCreateAccount(): Promise<void> {
    await this.clickElement(this.createAccountButton);
  }

  /**
   * Perform login with email and password
   * @param email - Email address
   * @param password - Password
   */
  async loginWithCredentials(email: string, password: string): Promise<void> {
    // Enter email
    await this.enterEmail(email);
    await this.clickNext();
    
    // Wait for password field to appear
    await this.waitForElement(this.passwordInput, 10000);
    
    // Enter password
    await this.enterPassword(password);
    
    // Use the more robust Next button click after password
    await this.clickNextAfterPassword();
  }



  /**
   * Check if email input is visible
   */
  async isEmailInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.emailInput);
  }

  /**
   * Check if password input is visible
   */
  async isPasswordInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.passwordInput);
  }

  /**
   * Check if Next button is enabled
   */
  async isNextButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.nextButton.isDisabled();
    return !isDisabled;
  }

  /**
   * Get error message if any
   */
  async getErrorMessage(): Promise<string> {
    if (await this.isElementVisible(this.errorMessage)) {
      return await this.getElementText(this.errorMessage);
    }
    return '';
  }

  /**
   * Check if on Google OAuth page
   */
  async isOnGoogleOAuthPage(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('accounts.google.com');
  }

  /**
   * Get sign in header text
   */
  async getSignInHeaderText(): Promise<string> {
    return await this.getElementText(this.signInHeader);
  }

  /**
   * Verify Google OAuth page elements
   */
  async verifyGoogleOAuthPageElements(): Promise<void> {
    await this.waitForElement(this.signInHeader);
    await this.waitForElement(this.emailInput);
    // Check if Next button is visible (may have multiple elements, so check visibility)
    const isNextVisible = await this.isElementVisible(this.nextButton);
    if (!isNextVisible) {
      throw new Error('Next button is not visible on Google OAuth page');
    }
  }

  /**
   * Wait for navigation after login
   * @param expectedUrl - Expected URL pattern after successful login
   */
  async waitForLoginRedirect(expectedUrl: string): Promise<void> {
    await this.waitForUrlContains(expectedUrl, 30000);
  }

  // Getters for elements (useful for custom assertions)
  get emailInputElement(): Locator {
    return this.emailInput;
  }

  get passwordInputElement(): Locator {
    return this.passwordInput;
  }

  get nextButtonElement(): Locator {
    return this.nextButton;
  }

  get signInHeaderElement(): Locator {
    return this.signInHeader;
  }
}
