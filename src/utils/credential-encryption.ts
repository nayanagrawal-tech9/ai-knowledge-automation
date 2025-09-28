import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Credential Encryption Utility
 * Provides secure encryption/decryption for sensitive test credentials
 * Using AES-256-CBC with PBKDF2 key derivation
 */
export class CredentialEncryption {
  private static readonly ALGORITHM = 'aes-256-cbc';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  
  /**
   * Generate encryption key from master password using PBKDF2
   */
  private static generateKey(masterPassword: string, salt: string): string {
    const derivedKey = crypto.pbkdf2Sync(masterPassword, salt, 100000, this.KEY_LENGTH, 'sha256');
    return derivedKey.toString('hex').slice(0, 64); // 32 bytes = 64 hex chars
  }
  
  /**
   * Encrypt sensitive data using AES-256-CBC
   */
  static encrypt(data: string, masterPassword: string): string {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(16).toString('hex');
      const iv = crypto.randomBytes(this.IV_LENGTH).toString('hex');
      
      // Generate key from password and salt
      const key = this.generateKey(masterPassword, salt);
      
      // Create cipher using the compatible createCipher method
      const cipher = crypto.createCipher('aes-256-cbc', key);
      
      // Encrypt data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine salt, iv, and encrypted data
      const result = {
        salt: salt,
        iv: iv,
        encrypted: encrypted
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypt sensitive data using AES-256-CBC
   */
  static decrypt(encryptedData: string, masterPassword: string): string {
    try {
      // Parse encrypted data
      const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
      const { salt, iv, encrypted } = data;
      
      // Generate key from password and salt
      const key = this.generateKey(masterPassword, salt);
      
      // Create decipher using the compatible createDecipher method
      const decipher = crypto.createDecipher('aes-256-cbc', key);
      
      // Decrypt data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - check master password');
    }
  }
  
  /**
   * Create encrypted credentials file
   */
  static createEncryptedCredentialsFile(
    credentials: { email: string; password: string },
    masterPassword: string,
    filePath: string = '.credentials.enc'
  ): void {
    try {
      const credentialsJson = JSON.stringify(credentials);
      const encrypted = this.encrypt(credentialsJson, masterPassword);
      
      fs.writeFileSync(path.resolve(filePath), encrypted, 'utf8');
      console.log('✅ Encrypted credentials file created successfully');
    } catch (error) {
      console.error('Failed to create encrypted credentials file:', error);
      throw error;
    }
  }
  
  /**
   * Read encrypted credentials file
   */
  static readEncryptedCredentialsFile(
    masterPassword: string,
    filePath: string = '.credentials.enc'
  ): { email: string; password: string } {
    try {
      const encryptedData = fs.readFileSync(path.resolve(filePath), 'utf8');
      const decryptedJson = this.decrypt(encryptedData, masterPassword);
      return JSON.parse(decryptedJson);
    } catch (error) {
      console.error('Failed to read encrypted credentials file:', error);
      throw error;
    }
  }
  
  /**
   * Generate secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
  
  /**
   * Hash password for verification (one-way)
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
    return salt + ':' + hash.toString('hex');
  }
  
  /**
   * Verify hashed password
   */
  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
    return hash === verifyHash.toString('hex');
  }
}
