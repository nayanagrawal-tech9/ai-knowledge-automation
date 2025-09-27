import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Weather Query Test After Login', () => {
  test('@weather-query User login and ask weather question', async ({ 
    loginPage, 
    googleOAuthPage, 
    page 
  }) => {
    // Set longer timeout for this comprehensive test
    test.setTimeout(120000); // 2 minutes

    const testEmail = 'nayanlnct@gmail.com';
    const testPassword = 'nayan@5555';
    const weatherQuery = 'what is the weather in Delhi';

    console.log('🚀 Starting comprehensive test: Login + Weather Query');

    // Step 1: Complete Login Flow
    console.log('📍 PHASE 1: Complete Gmail SSO Login');
    console.log('📍 Step 1: Navigate to login page');
    await loginPage.navigateToLogin();
    await loginPage.clickSignInWithSSO();
    await googleOAuthPage.waitForGoogleOAuthPageLoad();
    console.log('✅ Reached Google OAuth page');

    // Login process
    console.log('📍 Step 2: Enter credentials');
    await googleOAuthPage.enterEmail(testEmail);
    await googleOAuthPage.clickNext();
    
    await page.waitForTimeout(3000);
    await page.waitForSelector('input[name="Passwd"], input[type="password"]:visible', { 
      timeout: 15000,
      state: 'visible' 
    });
    
    await googleOAuthPage.enterPassword(testPassword);
    
    // Click Next button after password
    const nextButtonAfterPassword = page.getByRole('button', { name: 'Next' }).first();
    await nextButtonAfterPassword.waitFor({ state: 'visible', timeout: 10000 });
    await nextButtonAfterPassword.click();
    console.log('✅ Login credentials submitted');

    // Wait for redirect to home page
    console.log('📍 Step 3: Waiting for home page...');
    await page.waitForFunction(
      () => {
        const url = window.location.href;
        return url.includes('/home') || url.includes('/auth/callback');
      },
      {},
      { timeout: 45000 }
    );

    // Handle callback redirect to home
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/callback')) {
      console.log('🔄 On callback page, waiting for redirect to home...');
      await page.waitForURL('**/home', { timeout: 30000 });
    }

    const homeUrl = page.url();
    expect(homeUrl).toContain('/home');
    console.log('✅ Successfully logged in and reached home page');
    console.log('🏠 Home page URL:', homeUrl);

    // Step 2: Weather Query Flow
    console.log('\n📍 PHASE 2: Weather Query Interaction');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Find the input field
    console.log('📍 Step 4: Looking for input field...');
    const inputField = page.locator('input[placeholder="Ask about weather or upload a file for analysis..."]');
    
    try {
      await inputField.waitFor({ state: 'visible', timeout: 15000 });
      console.log('✅ Input field found');
    } catch (error) {
      console.log('❌ Input field not found, checking page content...');
      await page.screenshot({ path: 'debug-home-page.png', fullPage: true });
      
      // Try to find any input fields on the page
      const allInputs = await page.locator('input').count();
      console.log(`🔍 Found ${allInputs} input fields on page`);
      
      if (allInputs > 0) {
        for (let i = 0; i < allInputs; i++) {
          const input = page.locator('input').nth(i);
          const placeholder = await input.getAttribute('placeholder').catch(() => 'no placeholder');
          const type = await input.getAttribute('type').catch(() => 'no type');
          console.log(`Input ${i}: placeholder="${placeholder}", type="${type}"`);
        }
      }
      throw error;
    }

    // Enter the weather query
    console.log('📍 Step 5: Enter weather query');
    await inputField.fill(weatherQuery);
    console.log(`✅ Entered query: "${weatherQuery}"`);

    // Find and click send button
    console.log('📍 Step 6: Looking for send button...');
    const sendButton = page.locator('.lucide.lucide-send.w-4.h-4');
    
    try {
      await sendButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Send button found');
      await sendButton.click();
      console.log('✅ Send button clicked');
    } catch (error) {
      console.log('❌ Send button not found with provided selector, trying alternatives...');
      
      // Try alternative selectors for send button
      const alternativeSelectors = [
        'button[type="submit"]',
        'button:has-text("Send")',
        'button svg.lucide-send',
        '[data-testid="send-button"]',
        'button.send-button'
      ];

      let buttonFound = false;
      for (const selector of alternativeSelectors) {
        try {
          const altButton = page.locator(selector);
          if (await altButton.isVisible({ timeout: 3000 })) {
            await altButton.click();
            console.log(`✅ Send button clicked using alternative selector: ${selector}`);
            buttonFound = true;
            break;
          }
        } catch (e) {
          console.log(`❌ Alternative selector failed: ${selector}`);
        }
      }

      if (!buttonFound) {
        // Try pressing Enter as fallback
        console.log('🔄 Trying Enter key as fallback...');
        await inputField.press('Enter');
        console.log('✅ Enter key pressed');
      }
    }

    // Wait for response
    console.log('📍 Step 7: Waiting for weather response...');
    const responseArea = page.locator('.space-y-2.text-gray-800');
    
    try {
      await responseArea.waitFor({ state: 'visible', timeout: 30000 });
      console.log('✅ Response area found');
      
      // Wait a bit for the response to be fully loaded
      await page.waitForTimeout(3000);
      
      // Get the response text
      const responseText = await responseArea.textContent();
      console.log('📝 Weather response received:', responseText?.trim());
      
      // Verify response is not empty
      expect(responseText?.trim().length).toBeGreaterThan(0);
      console.log('✅ Response validation passed');
      
      // Print the response prominently
      console.log('\n🌤️  ========================');
      console.log('🌤️  WEATHER RESPONSE');
      console.log('🌤️  ========================');
      console.log(responseText?.trim());
      console.log('🌤️  ========================\n');
      
    } catch (error) {
      console.log('❌ Response area not found, checking for alternatives...');
      
      // Try alternative selectors for response
      const alternativeResponseSelectors = [
        '.response-text',
        '.chat-response',
        '.message-content',
        '[data-testid="response"]',
        '.space-y-2',
        '.text-gray-800'
      ];

      let responseFound = false;
      for (const selector of alternativeResponseSelectors) {
        try {
          const altResponse = page.locator(selector);
          if (await altResponse.isVisible({ timeout: 5000 })) {
            const text = await altResponse.textContent();
            if (text && text.trim().length > 0) {
              console.log(`✅ Response found using selector: ${selector}`);
              console.log('📝 Response:', text.trim());
              responseFound = true;
              break;
            }
          }
        } catch (e) {
          console.log(`❌ Alternative response selector failed: ${selector}`);
        }
      }

      if (!responseFound) {
        console.log('❌ No response found, taking screenshot for debugging...');
        await page.screenshot({ path: 'debug-no-response.png', fullPage: true });
        throw new Error('Weather response not found');
      }
    }

    console.log('🎉 Weather query test completed successfully!');
    console.log('✅ Complete flow: Login → Home → Weather Query → Response ✅');
  });

  test('@weather-direct Direct weather query (assuming already logged in)', async ({ page }) => {
    // This test assumes user is already logged in or can bypass login
    test.setTimeout(60000);

    const weatherQuery = 'what is the weather in Delhi';

    console.log('🚀 Starting direct weather query test');
    
    // Navigate directly to home page
    console.log('📍 Step 1: Navigate to home page');
    await page.goto('https://ai-knowledge-chat-ui.vercel.app/home');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login (not authenticated)
    if (page.url().includes('/login')) {
      console.log('⚠️  Not authenticated, redirected to login');
      console.log('❌ This test requires authentication - use the full login test instead');
      test.skip();
      return;
    }

    console.log('✅ On home page, proceeding with weather query');

    // Find input field and enter query
    const inputField = page.locator('input[placeholder="Ask about weather or upload a file for analysis..."]');
    await inputField.waitFor({ state: 'visible', timeout: 15000 });
    await inputField.fill(weatherQuery);
    console.log(`✅ Entered query: "${weatherQuery}"`);

    // Click send button
    const sendButton = page.locator('.lucide.lucide-send.w-4.h-4');
    await sendButton.click();
    console.log('✅ Send button clicked');

    // Get response
    const responseArea = page.locator('.space-y-2.text-gray-800');
    await responseArea.waitFor({ state: 'visible', timeout: 30000 });
    
    const responseText = await responseArea.textContent();
    console.log('\n🌤️  WEATHER RESPONSE:');
    console.log(responseText?.trim());
    
    expect(responseText?.trim().length).toBeGreaterThan(0);
    console.log('🎉 Direct weather query test completed!');
  });
});
