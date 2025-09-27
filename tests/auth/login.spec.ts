import { test, expect } from '../../src/fixtures/test-fixtures';
import { testData, appUrls, timeouts } from '../../src/utils/test-config';



test.describe('Gmail SSO Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for authentication tests
    test.setTimeout(timeouts.authentication);
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

  test('@success should complete full Gmail SSO login flow', async ({ 
    loginPage, 
    googleOAuthPage, 
    homePage,
    page 
  }) => {
    // Using direct credentials for this test
    const testEmail = 'nayanlnct@gmail.com';
    const testPassword = '942517502';

    console.log('🚀 Starting Gmail SSO login test...');

    // Navigate to login page and initiate SSO
    console.log('📍 Step 1: Navigate to login page');
    await loginPage.navigateToLogin();
    await loginPage.clickSignInWithSSO();
    await googleOAuthPage.waitForGoogleOAuthPageLoad();
    console.log('✅ Successfully reached Google OAuth page');

    // Enter email step by step
    console.log('📍 Step 2: Enter email');
    await googleOAuthPage.enterEmail(testEmail);
    await googleOAuthPage.clickNext();
    console.log('✅ Email entered and Next clicked');

    // Wait a bit and check current page state
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('🔍 Current URL after email:', currentUrl);

    // Try to find password field with better error handling
    console.log('📍 Step 3: Looking for password field...');
    try {
      await page.waitForSelector('input[name="Passwd"], input[type="password"]:visible', { 
        timeout: 15000,
        state: 'visible' 
      });
      console.log('✅ Password field found');
      
      // Enter password
      console.log('📍 Step 4: Enter password');
      await googleOAuthPage.enterPassword(testPassword);
      console.log('✅ Password entered');
      
      // Find and click Next button after password
      console.log('📍 Step 4b: Looking for Next button after password...');
      const nextButtonAfterPassword = page.getByRole('button', { name: 'Next' }).first();
      await nextButtonAfterPassword.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Next button found after password');
      
      await nextButtonAfterPassword.click();
      console.log('✅ Next button clicked after password');
      
    } catch (error) {
      console.log('❌ Could not find password field');
      console.log('📸 Taking screenshot for debugging...');
      await page.screenshot({ path: 'debug-password-field.png', fullPage: true });
      throw error;
    }

    // Wait for authentication completion and redirect to home page
    console.log('📍 Step 5: Waiting for redirect to home page...');
    await page.waitForFunction(
      () => {
        const url = window.location.href;
        console.log('Current URL check:', url);
        return url.includes('/home') || url.includes('/auth/callback') || !url.includes('accounts.google.com');
      },
      {},
      { timeout: 45000 }
    );

    console.log('📍 Step 6: Verify successful navigation to home page');
    const finalUrl = page.url();
    console.log('🎯 Final URL:', finalUrl);

    // Check if we're on the home page or callback (which redirects to home)
    if (finalUrl.includes('/auth/callback')) {
      console.log('🔄 Currently on callback page, waiting for redirect to home...');
      // Wait for redirect from callback to home
      await page.waitForURL('**/home', { timeout: 15000 });
      const homeUrl = page.url();
      console.log('🏠 Redirected to home page:', homeUrl);
      expect(homeUrl).toContain('/home');
    } else if (finalUrl.includes('/home')) {
      console.log('✅ Successfully navigated directly to home page');
      expect(finalUrl).toContain('/home');
    } else {
      console.log('❌ Unexpected final URL:', finalUrl);
      throw new Error(`Expected to be on home page, but got: ${finalUrl}`);
    }

    // Additional verification that we're on the correct home page
    console.log('📍 Step 7: Verify home page content');
    const pageTitle = await page.title();
    console.log('📄 Page title:', pageTitle);
    expect(pageTitle).toContain('Universal Knowledge Chatbot');

    // Check if we can see home page elements
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      console.log('✅ Home page loaded successfully');
    } catch (error) {
      console.log('⚠️ Could not verify home page elements, but URL is correct');
    }
    
    console.log('🎉 Gmail SSO login test completed successfully!');
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
