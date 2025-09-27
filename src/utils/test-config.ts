import { TestData, AppUrls, TestConfig } from '../types';
import { EnvUtils } from '../utils';

/**
 * Test data configuration
 */
export const testData: TestData = {
  validUser: {
    email: EnvUtils.get('TEST_EMAIL', 'your-test-email@gmail.com'),
    password: EnvUtils.get('TEST_PASSWORD', 'your-test-password'),
    displayName: 'Test User'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
    displayName: 'Invalid User'
  }
};

/**
 * Application URLs configuration
 */
export const appUrls: AppUrls = {
  baseUrl: 'https://ai-knowledge-chat-ui.vercel.app',
  loginUrl: 'https://ai-knowledge-chat-ui.vercel.app/login',
  homeUrl: 'https://ai-knowledge-chat-ui.vercel.app/home'
};

/**
 * Test configuration
 */
export const testConfig: TestConfig = {
  browser: {
    headless: EnvUtils.isCI(),
    slowMo: EnvUtils.isCI() ? 0 : 100,
    timeout: 30000
  },
  urls: appUrls,
  credentials: testData.validUser
};

/**
 * Test timeouts
 */
export const timeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  navigation: 30000,
  authentication: 45000
};
