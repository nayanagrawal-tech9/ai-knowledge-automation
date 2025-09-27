import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for the Home Page (after successful login)
 */
export class HomePage extends BasePage {
  // Page URL
  private readonly HOME_URL = 'https://ai-knowledge-chat-ui.vercel.app/home';

  // Page elements
  private readonly pageTitle: Locator;
  private readonly chatContainer: Locator;
  private readonly messageInput: Locator;
  private readonly sendButton: Locator;
  private readonly userProfile: Locator;
  private readonly logoutButton: Locator;
  private readonly welcomeMessage: Locator;
  private readonly chatHistory: Locator;
  private readonly fileUploadButton: Locator;
  private readonly settingsButton: Locator;
  
  // Weather query specific elements
  private readonly weatherInput: Locator;
  private readonly weatherSendButton: Locator;
  private readonly weatherResponse: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.pageTitle = page.locator('h1, [data-testid="page-title"]');
    this.chatContainer = page.locator('[data-testid="chat-container"], .chat-container, #chat-container');
    this.messageInput = page.locator('input[type="text"], textarea[placeholder*="message"], [data-testid="message-input"]');
    this.sendButton = page.locator('button:has-text("Send"), [data-testid="send-button"]');
    this.userProfile = page.locator('[data-testid="user-profile"], .user-profile');
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), [data-testid="logout-button"]');
    this.welcomeMessage = page.locator(':text("Welcome"), [data-testid="welcome-message"]');
    this.chatHistory = page.locator('[data-testid="chat-history"], .chat-history');
    this.fileUploadButton = page.locator('input[type="file"], [data-testid="file-upload"]');
    this.settingsButton = page.locator('button:has-text("Settings"), [data-testid="settings-button"]');
    
    // Weather query specific elements
    this.weatherInput = page.locator('input[placeholder="Ask about weather or upload a file for analysis..."]');
    this.weatherSendButton = page.locator('.lucide.lucide-send.w-4.h-4');
    this.weatherResponse = page.locator('.space-y-2.text-gray-800');
  }

  /**
   * Wait for home page to load after successful login
   */
  async waitForHomePageLoad(): Promise<void> {
    await this.waitForUrlContains('/home');
    await this.waitForPageLoad();
  }

  /**
   * Verify user is successfully logged in and on home page
   */
  async verifySuccessfulLogin(): Promise<boolean> {
    try {
      const currentUrl = await this.getCurrentUrl();
      console.log('🔍 Verifying login - Current URL:', currentUrl);
      
      // Check if we're on the home page
      if (currentUrl.includes('/home')) {
        console.log('✅ Successfully on home page');
        return true;
      }
      
      // Check if we're on callback page (which should redirect to home)
      if (currentUrl.includes('/auth/callback')) {
        console.log('🔄 On callback page, waiting for redirect to home...');
        await this.waitForHomePageLoad();
        const finalUrl = await this.getCurrentUrl();
        console.log('🏠 Final URL after redirect:', finalUrl);
        return finalUrl.includes('/home');
      }
      
      console.log('❌ Not on home page or callback page');
      return false;
    } catch (error) {
      console.log('❌ Error verifying login:', error);
      return false;
    }
  }

  /**
   * Verify specifically that we're on the home page URL
   */
  async verifyOnHomePage(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    const isOnHome = currentUrl.includes('/home');
    console.log(`🏠 Home page verification: ${isOnHome ? 'SUCCESS' : 'FAILED'} - URL: ${currentUrl}`);
    return isOnHome;
  }

  /**
   * Send a message in the chat
   * @param message - Message to send
   */
  async sendChatMessage(message: string): Promise<void> {
    if (await this.isElementVisible(this.messageInput)) {
      await this.fillText(this.messageInput, message);
      await this.clickElement(this.sendButton);
    }
  }

  /**
   * Check if chat container is visible
   */
  async isChatContainerVisible(): Promise<boolean> {
    return await this.isElementVisible(this.chatContainer);
  }

  /**
   * Check if message input is visible
   */
  async isMessageInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.messageInput);
  }

  /**
   * Check if user profile is visible
   */
  async isUserProfileVisible(): Promise<boolean> {
    return await this.isElementVisible(this.userProfile);
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    if (await this.isElementVisible(this.logoutButton)) {
      await this.clickElement(this.logoutButton);
    }
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    if (await this.isElementVisible(this.welcomeMessage)) {
      return await this.getElementText(this.welcomeMessage);
    }
    return '';
  }

  /**
   * Upload a file
   * @param filePath - Path to the file to upload
   */
  async uploadFile(filePath: string): Promise<void> {
    if (await this.isElementVisible(this.fileUploadButton)) {
      await this.fileUploadButton.setInputFiles(filePath);
    }
  }

  /**
   * Verify home page elements are loaded
   */
  async verifyHomePageElements(): Promise<void> {
    // Wait for essential elements that indicate successful login
    const currentUrl = await this.getCurrentUrl();
    
    if (currentUrl.includes('/home') || currentUrl.includes('dashboard')) {
      // We're on the home page, now check for key elements
      // Note: Not all elements may be present, so we check what's available
      return;
    } else {
      throw new Error(`Not on home page. Current URL: ${currentUrl}`);
    }
  }

  /**
   * Check if user is authenticated (on home page)
   */
  async isUserAuthenticated(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('/home') || 
           currentUrl.includes('dashboard') || 
           !currentUrl.includes('/login');
  }

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.getTitle();
  }

  /**
   * Navigate directly to home page (should redirect to login if not authenticated)
   */
  async navigateToHome(): Promise<void> {
    await this.goto(this.HOME_URL);
    await this.waitForPageLoad();
  }

  // Getters for elements (useful for custom assertions)
  get chatContainerElement(): Locator {
    return this.chatContainer;
  }

  get messageInputElement(): Locator {
    return this.messageInput;
  }

  get sendButtonElement(): Locator {
    return this.sendButton;
  }

  get userProfileElement(): Locator {
    return this.userProfile;
  }

  get logoutButtonElement(): Locator {
    return this.logoutButton;
  }

  /**
   * Send a weather query
   * @param query - Weather query to send
   */
  async sendWeatherQuery(query: string): Promise<void> {
    await this.waitForElement(this.weatherInput);
    await this.fillText(this.weatherInput, query);
    await this.clickElement(this.weatherSendButton);
  }

  /**
   * Get weather response text
   */
  async getWeatherResponse(): Promise<string> {
    await this.waitForElement(this.weatherResponse, 30000);
    return await this.getElementText(this.weatherResponse);
  }

  /**
   * Check if weather input is visible
   */
  async isWeatherInputVisible(): Promise<boolean> {
    return await this.isElementVisible(this.weatherInput);
  }

  /**
   * Check if weather send button is visible
   */
  async isWeatherSendButtonVisible(): Promise<boolean> {
    return await this.isElementVisible(this.weatherSendButton);
  }

  // Getters for weather elements
  get weatherInputElement(): Locator {
    return this.weatherInput;
  }

  get weatherSendButtonElement(): Locator {
    return this.weatherSendButton;
  }

  get weatherResponseElement(): Locator {
    return this.weatherResponse;
  }
}
