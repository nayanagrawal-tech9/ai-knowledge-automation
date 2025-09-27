/**
 * Environment configuration utility
 */
export class EnvUtils {
  /**
   * Get environment variable with fallback
   * @param key - Environment variable key
   * @param fallback - Fallback value if env var is not set
   */
  static get(key: string, fallback: string = ''): string {
    return process.env[key] || fallback;
  }

  /**
   * Get required environment variable
   * @param key - Environment variable key
   */
  static getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value;
  }

  /**
   * Check if running in CI environment
   */
  static isCI(): boolean {
    return !!process.env.CI;
  }

  /**
   * Get test environment (dev, staging, prod)
   */
  static getTestEnvironment(): string {
    return this.get('TEST_ENV', 'dev');
  }
}

/**
 * Wait utility functions
 */
export class WaitUtils {
  /**
   * Wait for a specified amount of time
   * @param milliseconds - Time to wait in milliseconds
   */
  static async wait(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Wait with exponential backoff
   * @param retries - Number of retries
   * @param baseDelay - Base delay in milliseconds
   */
  static async waitWithBackoff(retries: number, baseDelay: number = 1000): Promise<void> {
    const delay = baseDelay * Math.pow(2, retries);
    await this.wait(delay);
  }
}

/**
 * String utility functions
 */
export class StringUtils {
  /**
   * Generate random string
   * @param length - Length of the string
   */
  static randomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random email
   * @param domain - Email domain
   */
  static randomEmail(domain: string = 'example.com'): string {
    return `test_${this.randomString(8)}@${domain}`;
  }

  /**
   * Sanitize string for file names
   * @param str - String to sanitize
   */
  static sanitizeForFileName(str: string): string {
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }
}

/**
 * Date utility functions
 */
export class DateUtils {
  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * Get formatted date string
   * @param date - Date object
   */
  static formatDate(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get formatted time string
   * @param date - Date object
   */
  static formatTime(date: Date = new Date()): string {
    return date.toTimeString().split(' ')[0];
  }
}
