/**
 * Centralized test credentials configuration
 * Reads from environment variables with fallback values
 */

export interface TestCredentials {
  email: string;
  password: string;
}

export interface AppUrls {
  baseUrl: string;
  loginUrl: string;
  homeUrl: string;
}

/**
 * Get test credentials from environment variables
 */
export const getTestCredentials = (): TestCredentials => {
  return {
    email: process.env.TEST_EMAIL || 'nayanlnct@gmail.com',
    password: process.env.TEST_PASSWORD || 'Nayan123#'
  };
};

/**
 * Get application URLs
 */
export const getAppUrls = (): AppUrls => {
  return {
    baseUrl: process.env.BASE_URL || 'https://ai-knowledge-chat-ui.vercel.app',
    loginUrl: process.env.LOGIN_URL || 'https://ai-knowledge-chat-ui.vercel.app/login',
    homeUrl: process.env.HOME_URL || 'https://ai-knowledge-chat-ui.vercel.app/home'
  };
};

/**
 * Alternative credentials for testing different scenarios
 */
export const getAlternativeCredentials = (): TestCredentials => {
  return {
    email: process.env.ALT_TEST_EMAIL || 'nayanlnct@gmail.com',
    password: process.env.ALT_TEST_PASSWORD || 'Nayan123#'
  };
};

/**
 * Test configuration
 */
export const getTestConfig = () => {
  return {
    timeout: {
      default: parseInt(process.env.DEFAULT_TIMEOUT || '30000'),
      authentication: parseInt(process.env.AUTHENTICATION_TIMEOUT || '45000'),
      navigation: parseInt(process.env.NAVIGATION_TIMEOUT || '30000')
    },
    browser: {
      headless: process.env.HEADLESS === 'true',
      slowMo: parseInt(process.env.SLOW_MO || '100')
    },
    capture: {
      screenshots: process.env.CAPTURE_SCREENSHOTS === 'true',
      videos: process.env.CAPTURE_VIDEOS === 'true'
    }
  };
};

/**
 * Validation functions
 */
export const validateCredentials = (credentials: TestCredentials): boolean => {
  return !!(credentials.email && 
           credentials.password && 
           credentials.email.includes('@') && 
           credentials.password.length > 0);
};

export const isUsingDefaultCredentials = (credentials: TestCredentials): boolean => {
  return credentials.email === 'nayanlnct@gmail.com' || 
         credentials.password === 'Nayan123#'
};

// Export constants for easy access
export const TEST_CREDENTIALS = getTestCredentials();
export const ALT_CREDENTIALS = getAlternativeCredentials();
export const APP_URLS = getAppUrls();
export const TEST_CONFIG = getTestConfig();
