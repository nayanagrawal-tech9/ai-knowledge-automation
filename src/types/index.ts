/**
 * User credentials interface for authentication
 */
export interface UserCredentials {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Test data interface
 */
export interface TestData {
  validUser: UserCredentials;
  invalidUser: UserCredentials;
}

/**
 * Application URLs
 */
export interface AppUrls {
  baseUrl: string;
  loginUrl: string;
  homeUrl: string;
  logoutUrl?: string;
}

/**
 * Browser configuration
 */
export interface BrowserConfig {
  headless: boolean;
  slowMo: number;
  timeout: number;
}

/**
 * Test environment configuration
 */
export interface TestConfig {
  browser: BrowserConfig;
  urls: AppUrls;
  credentials: UserCredentials;
}
