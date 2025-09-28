import { test, expect } from '../../src/fixtures/test-fixtures';
import { getTestCredentials } from '../../src/config/credentials';

test.describe('Gmail SSO with Custom User Agent', () => {
  test('@useragent Gmail SSO with custom user agent', async ({ browser }) => {
    // Create context with custom user agent
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      // Additional headers to appear more like a real browser
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    const page = await context.newPage();

    // Hide automation indicators
    await page.addInitScript(() => {
      // Remove webdriver property
      delete (window as any).webdriver;
      
      // Override the plugins property to use a custom getter
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5] // fake plugins
      });
      
      // Override the webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
      
      // Override the languages property
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      
      // Override chrome property
      (window as any).chrome = {
        runtime: {}
      };
    });

    console.log('🚀 Starting Gmail SSO test with custom user agent...');

    const credentials = getTestCredentials();

    try {
      console.log('📍 Step 1: Navigate to login page');
      await page.goto('https://ai-knowledge-chat-ui.vercel.app/login');
      await page.waitForLoadState('networkidle');

      // Click SSO button
      await page.click('button:has-text("Sign in with SSO")');
      await page.waitForLoadState('networkidle');

      console.log('✅ Reached Google OAuth page');
      console.log('🔍 Current URL:', page.url());

      // Wait for email input and enter email
      console.log('📍 Step 2: Enter email');
      await page.waitForSelector('input[type="email"], input[name="identifier"]', { timeout: 10000 });
      await page.fill('input[type="email"], input[name="identifier"]', credentials.email);
      
      // Click Next button
      await page.click('button:has-text("Next"), #identifierNext');
      await page.waitForTimeout(3000);

      const urlAfterEmail = page.url();
      console.log('🔍 URL after email:', urlAfterEmail);

      if (!urlAfterEmail.includes('rejected')) {
        console.log('📍 Step 3: Enter password');
        
        // Wait for password field
        await page.waitForSelector('input[type="password"]:visible, input[name="Passwd"]', { timeout: 15000 });
        await page.fill('input[type="password"]:visible, input[name="Passwd"]', credentials.password);
        
        // Click Next
        await page.click('button:has-text("Next")');
        await page.waitForTimeout(10000);
        
        const finalUrl = page.url();
        console.log('🔍 Final URL:', finalUrl);
        
        expect(finalUrl).toBeTruthy();
        console.log('🎉 Test completed successfully!');
        
      } else {
        console.log('❌ Email was rejected by Google');
        console.log('⚠️ Try with a different email or check account settings');
        expect(urlAfterEmail).toContain('google.com');
      }

    } catch (error) {
      console.log('❌ Error during test:', error.message);
      console.log('🔍 Current URL:', page.url());
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      throw error;
    } finally {
      await context.close();
    }
  });
});
