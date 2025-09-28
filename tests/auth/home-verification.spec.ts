import { test, expect } from '../../src/fixtures/test-fixtures';
import { getTestCredentials } from '../../src/config/credentials';
import { allure } from 'allure-playwright';

test.describe('Home Page Navigation Verification', () => {
  test.beforeEach(async () => {
    await allure.epic('Authentication');
    await allure.feature('Home Page Verification');
    await allure.story('Post-Login Navigation Validation');
    await allure.owner('QA Team');
    await allure.severity('normal');
    await allure.tag('smoke');
    await allure.tag('navigation');
    await allure.tag('verification');
  });
  test('@home-verification Gmail SSO login and home page verification', async ({ 
    loginPage, 
    googleOAuthPage, 
    homePage,
    page 
  }) => {
    // Set longer timeout for authentication
    test.setTimeout(60000);

    const credentials = getTestCredentials();

    console.log('🏠 Starting Gmail SSO login with home page verification...');

    try {
      // Step 1: Navigate to login page
      console.log('📍 Step 1: Navigate to login page');
      await loginPage.navigateToLogin();
      await loginPage.clickSignInWithSSO();
      await googleOAuthPage.waitForGoogleOAuthPageLoad();
      console.log('✅ Reached Google OAuth page');

      // Step 2: Enter credentials
      console.log('📍 Step 2: Enter email and password');
      await googleOAuthPage.enterEmail(credentials.email);
      await googleOAuthPage.clickNext();
      
      // Wait for password field
      await page.waitForSelector('input[name="Passwd"], input[type="password"]:visible', { 
        timeout: 15000,
        state: 'visible' 
      });
      
      await googleOAuthPage.enterPassword(credentials.password);
      await googleOAuthPage.clickNext();
      console.log('✅ Credentials entered');

      // Step 3: Wait for authentication and redirect
      console.log('📍 Step 3: Waiting for authentication and redirect...');
      
      // Wait for redirect away from Google
      await page.waitForFunction(
        () => !window.location.href.includes('accounts.google.com'),
        {},
        { timeout: 30000 }
      );
      console.log('✅ Redirected away from Google');

      // Step 4: Handle different redirect scenarios
      let currentUrl = page.url();
      console.log('🔍 Current URL after Google auth:', currentUrl);

      if (currentUrl.includes('/auth/callback')) {
        console.log('🔄 On Auth0 callback page, waiting for final redirect to home...');
        
        // Wait for redirect to home page
        await page.waitForURL('**/home', { timeout: 20000 });
        currentUrl = page.url();
        console.log('🏠 Redirected to:', currentUrl);
      }

      // Step 5: Verify we're on the home page
      console.log('📍 Step 5: Verify home page navigation');
      
      // Ensure we're on the correct home page URL
      expect(currentUrl).toContain('ai-knowledge-chat-ui.vercel.app/home');
      console.log('✅ Verified correct home page URL');

      // Verify page title
      const pageTitle = await page.title();
      console.log('📄 Page title:', pageTitle);
      expect(pageTitle).toContain('Universal Knowledge Chatbot');
      console.log('✅ Verified page title');

      // Additional verification using HomePage methods
      const isOnHomePage = await homePage.verifyOnHomePage();
      expect(isOnHomePage).toBe(true);
      console.log('✅ HomePage class verification passed');

      // Verify successful login using HomePage method
      const loginVerified = await homePage.verifySuccessfulLogin();
      expect(loginVerified).toBe(true);
      console.log('✅ Login verification passed');

      // Final success message
      console.log('🎉 SUCCESS: Gmail SSO login completed and home page verified!');
      console.log(`🏠 Final URL: ${currentUrl}`);
      
    } catch (error) {
      console.log('❌ Test failed with error:', error);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `home-verification-error-${Date.now()}.png`, 
        fullPage: true 
      });
      
      console.log('📸 Screenshot saved for debugging');
      throw error;
    }
  });

  test('@home-direct Direct home page access test', async ({ homePage, page }) => {
    console.log('🏠 Testing direct home page access (should redirect to login)...');
    
    // Try to access home page directly without authentication
    await page.goto('https://ai-knowledge-chat-ui.vercel.app/home');
    
    // Should be redirected to login page
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log('🔍 URL after direct home access:', currentUrl);
    
    // Verify redirect to login
    expect(currentUrl).toContain('login');
    console.log('✅ Correctly redirected to login page when accessing home without auth');
  });
});
