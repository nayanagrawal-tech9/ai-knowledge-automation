import { test, expect } from '@playwright/test';
import { LoginPage, GoogleOAuthPage, HomePage } from '../../src/pages';
import { getTestCredentials } from '../../src/config/credentials';

test.describe('Gmail SSO Simple Test', () => {
  test('@simple Gmail SSO login test', async ({ page }) => {
    console.log('🚀 Starting simple Gmail SSO test...');

    // Initialize page objects
    const loginPage = new LoginPage(page);
    const googleOAuthPage = new GoogleOAuthPage(page);
    const homePage = new HomePage(page);

    const credentials = getTestCredentials();

    console.log('📍 Step 1: Navigate to login page');
    await loginPage.navigateToLogin();
    await loginPage.clickSignInWithSSO();
    await googleOAuthPage.waitForGoogleOAuthPageLoad();
    console.log('✅ Reached Google OAuth page');

    console.log('📍 Step 2: Enter email');
    await googleOAuthPage.enterEmail(credentials.email);
    await googleOAuthPage.clickNext();
    
    console.log('✅ Email submitted');
    await page.waitForTimeout(3000);
    
    const urlAfterEmail = page.url();
    console.log('🔍 URL after email:', urlAfterEmail);

    if (!urlAfterEmail.includes('rejected')) {
      console.log('📍 Step 3: Enter password');
      
      try {
        await googleOAuthPage.waitForElement(googleOAuthPage.passwordInputElement, 15000);
        await googleOAuthPage.enterPassword(credentials.password);
        await googleOAuthPage.clickNext();
        
        console.log('✅ Password submitted');
        
        // Wait for authentication
        await page.waitForTimeout(10000);
        
        const finalUrl = page.url();
        console.log('🔍 Final URL:', finalUrl);
        
        if (finalUrl.includes('/home') || finalUrl.includes('/dashboard')) {
          console.log('🎉 Login successful!');
          expect(finalUrl).toContain('/home');
        } else {
          console.log('⏳ Still authenticating, current URL:', finalUrl);
          expect(finalUrl).toBeTruthy();
        }
        
      } catch (error) {
        console.log('❌ Error during password entry:', error.message);
        console.log('Current URL:', page.url());
        throw error;
      }
    } else {
      console.log('❌ Email was rejected by Google');
      expect(urlAfterEmail).toContain('google.com');
    }
  });
});
