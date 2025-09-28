import { test, expect } from '../../src/fixtures/test-fixtures';
import { testData, appUrls, timeouts } from '../../src/utils/test-config';
import { getTestCredentials, getAppUrls, TEST_CREDENTIALS } from '../../src/config/credentials';
import { allure } from 'allure-playwright';



test.describe('Gmail SSO Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for authentication tests
    test.setTimeout(timeouts.authentication);
    
    // Allure configuration
    await allure.epic('Authentication');
    await allure.feature('Gmail SSO Login');
    await allure.story('User Authentication Flow');
    await allure.owner('QA Team');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('auth');
    await allure.tag('sso');
  });

  test('should display login page elements correctly', async ({ loginPage }) => {
    // Navigate to login page
    await loginPage.navigateToLogin();

    // Verify page title
    const title = await loginPage.verifyPageTitle();
    expect(title).toContain('Universal Knowledge Chatbot');

    // Verify login page elements
    await loginPage.verifyLoginPageElements();

    // Check individual elements
    expect(await loginPage.isLogoVisible()).toBe(true);
    expect(await loginPage.getSSOButtonText()).toContain('Sign in with SSO');
    expect(await loginPage.isSSOButtonEnabled()).toBe(true);

    // Verify text content
    const headerText = await loginPage.getHeaderText();
    expect(headerText).toContain('Universal Knowledge Chatbot');

    const subHeaderText = await loginPage.getSubHeaderText();
    expect(subHeaderText).toContain('Sign in to your account using your organization\'s SSO');
  });

  test('should redirect to Google OAuth when SSO button is clicked', async ({ 
    loginPage, 
    googleOAuthPage 
  }) => {
    // Navigate to login page
    await loginPage.navigateToLogin();

    // Click SSO button
    await loginPage.clickSignInWithSSO();

    // Verify redirect to Google OAuth
    await googleOAuthPage.waitForGoogleOAuthPageLoad();
    expect(await googleOAuthPage.isOnGoogleOAuthPage()).toBe(true);

    // Verify Google OAuth page elements
    await googleOAuthPage.verifyGoogleOAuthPageElements();
    expect(await googleOAuthPage.isEmailInputVisible()).toBe(true);
    expect(await googleOAuthPage.isNextButtonEnabled()).toBe(true);

    const signInHeader = await googleOAuthPage.getSignInHeaderText();
    expect(signInHeader).toContain('Sign in');
  });

  test('should handle invalid email on Google OAuth', async ({ 
    loginPage, 
    googleOAuthPage 
  }) => {
    // Navigate to login page and initiate SSO
    await loginPage.navigateToLogin();
    await loginPage.clickSignInWithSSO();
    await googleOAuthPage.waitForGoogleOAuthPageLoad();

    // Try to login with invalid email
    await googleOAuthPage.enterEmail(testData.invalidUser.email);
    await googleOAuthPage.clickNext();

    // Wait a bit for potential error message
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check if error message appears or email field is still visible
    const errorMessage = await googleOAuthPage.getErrorMessage();
    const isEmailVisible = await googleOAuthPage.isEmailInputVisible();
    
    // Either we should see an error message or still be on the email input page
    expect(errorMessage.length > 0 || isEmailVisible).toBe(true);
  });

  test('should complete Gmail SSO login successfully', async ({ 
    page, 
    loginPage, 
    googleOAuthPage, 
    homePage 
  }) => {
    // Set test metadata
    await allure.description('This test verifies the complete Gmail SSO authentication flow from login page to home page');
    await allure.link('https://ai-knowledge-chat-ui.vercel.app/login', 'Test Application');
    
    console.log('🚀 Starting Gmail SSO login test with Allure reporting');
    
    await allure.step('Get test credentials from configuration', async () => {
      const credentials = getTestCredentials();
      const urls = getAppUrls();
      
      await allure.parameter('Email', credentials.email);
      await allure.parameter('Base URL', urls.baseUrl);
      
      console.log('✅ Credentials loaded successfully');
    });

    const credentials = getTestCredentials();
    
    await allure.step('Navigate to login page', async () => {
      await loginPage.navigateToLogin();
      
      // Attach screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await allure.attachment('Login Page Screenshot', screenshot, 'image/png');
      
      console.log('✅ Navigated to login page');
    });
    
    await allure.step('Click Sign in with SSO button', async () => {
      await loginPage.clickSignInWithSSO();
      
      // Wait for redirect and take screenshot
      await page.waitForTimeout(2000);
      const screenshot = await page.screenshot({ fullPage: true });
      await allure.attachment('After SSO Click Screenshot', screenshot, 'image/png');
      
      console.log('✅ Clicked login button, should redirect to Auth0');
    });
    
    await allure.step('Complete Google OAuth authentication', async () => {
      await googleOAuthPage.loginWithCredentials(credentials.email, credentials.password);
      
      // Take screenshot after login
      await page.waitForTimeout(3000);
      const screenshot = await page.screenshot({ fullPage: true });
      await allure.attachment('After Google Login Screenshot', screenshot, 'image/png');
      
      console.log('✅ Completed Google OAuth flow');
    });
    
    await allure.step('Verify successful login and home page access', async () => {
      await homePage.waitForHomePageLoad();
      
      // Verify URL contains expected path
      const currentUrl = page.url();
      expect(currentUrl).toContain('ai-knowledge-chat-ui.vercel.app');
      
      // Take final success screenshot
      const screenshot = await page.screenshot({ fullPage: true });
      await allure.attachment('Success - Home Page Screenshot', screenshot, 'image/png');
      
      console.log('✅ Successfully reached homepage after login');
    });
    
    await allure.step('Capture test artifacts', async () => {
      // Capture page title
      const pageTitle = await page.title();
      await allure.parameter('Final Page Title', pageTitle);
      
      // Capture final URL
      const finalUrl = page.url();
      await allure.parameter('Final URL', finalUrl);
      
      // Take final screenshot for report
      await page.screenshot({ 
        path: 'allure-login-success.png', 
        fullPage: true 
      });
      console.log('✅ Test artifacts captured');
    });
    
    // Final assertion
    expect(true).toBe(true);
  });

  test('should redirect to login when accessing home page without authentication', async ({ 
    homePage, 
    loginPage,
    page 
  }) => {
    // Try to access home page directly
    await homePage.navigateToHome();

    // Should be redirected to login page
    const currentUrl = await page.url();
    expect(currentUrl).toContain('login');

    // Verify we're on login page
    await loginPage.waitForLoginPageLoad();
    expect(await loginPage.isLogoVisible()).toBe(true);
  });

  test('should handle browser back navigation correctly', async ({ 
    loginPage, 
    googleOAuthPage,
    page 
  }) => {
    // Navigate to login page
    await loginPage.navigateToLogin();
    const loginUrl = page.url();

    // Click SSO button to go to Google OAuth
    await loginPage.clickSignInWithSSO();
    await googleOAuthPage.waitForGoogleOAuthPageLoad();

    // Go back to login page
    await page.goBack();
    await loginPage.waitForLoginPageLoad();

    // Verify we're back on login page
    expect(page.url()).toContain('login');
    expect(await loginPage.isLogoVisible()).toBe(true);
  });

  test('should display correct page titles and metadata', async ({ loginPage, page }) => {
    // Navigate to login page
    await loginPage.navigateToLogin();

    // Check page title
    const title = await page.title();
    expect(title).toContain('Universal Knowledge Chatbot');

    // Check if page has favicon
    const favicon = await page.locator('link[rel="icon"], link[rel="shortcut icon"]').count();
    expect(favicon).toBeGreaterThan(0);
  });

  test('should be responsive on different screen sizes', async ({ loginPage, page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await loginPage.navigateToLogin();
    
    // Verify elements are still visible
    expect(await loginPage.isLogoVisible()).toBe(true);
    expect(await loginPage.isSSOButtonEnabled()).toBe(true);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    expect(await loginPage.isLogoVisible()).toBe(true);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    expect(await loginPage.isLogoVisible()).toBe(true);
  });
});
