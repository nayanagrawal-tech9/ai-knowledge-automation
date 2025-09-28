#!/usr/bin/env node

/**
 * Credential Setup Utility
 * Interactive script to securely configure test credentials
 */

// Import the compiled TypeScript module
const path = require('path');
const rootDir = path.resolve(__dirname, '..');

// Simple crypto implementation for the setup script
const crypto = require('crypto');

class SimpleCredentialProtection {
  static encrypt(data, masterPassword) {
    try {
      const salt = crypto.randomBytes(8).toString('hex');
      const key = crypto.pbkdf2Sync(masterPassword, salt, 1000, 32, 'sha256').toString('hex');
      
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        const keyChar = key[i % key.length];
        const encryptedChar = String.fromCharCode(data.charCodeAt(i) ^ keyChar.charCodeAt(0));
        encrypted += encryptedChar;
      }
      
      const result = {
        salt: salt,
        data: Buffer.from(encrypted).toString('base64')
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error) {
      throw new Error('Failed to encrypt data');
    }
  }
  
  static decrypt(encryptedData, masterPassword) {
    try {
      const parsed = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
      const { salt, data } = parsed;
      
      const key = crypto.pbkdf2Sync(masterPassword, salt, 1000, 32, 'sha256').toString('hex');
      const encrypted = Buffer.from(data, 'base64').toString('utf8');
      
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = key[i % key.length];
        const decryptedChar = String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
        decrypted += decryptedChar;
      }
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data - check master password');
    }
  }
  
  static createEncryptedCredentialsFile(credentials, masterPassword, filePath = '.credentials.enc') {
    const credentialsJson = JSON.stringify(credentials);
    const encrypted = this.encrypt(credentialsJson, masterPassword);
    
    const fullPath = path.resolve(filePath);
    require('fs').writeFileSync(fullPath, encrypted, 'utf8');
    console.log(`✅ Encrypted credentials file created: ${fullPath}`);
    
    // Update .gitignore
    const gitignorePath = path.resolve('.gitignore');
    if (require('fs').existsSync(gitignorePath)) {
      const gitignoreContent = require('fs').readFileSync(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.credentials.enc')) {
        require('fs').appendFileSync(gitignorePath, '\n# Encrypted credentials\n.credentials.enc\n');
        console.log('✅ Added .credentials.enc to .gitignore');
      }
    }
  }
  
  static readEncryptedCredentialsFile(masterPassword, filePath = '.credentials.enc') {
    const fullPath = path.resolve(filePath);
    if (!require('fs').existsSync(fullPath)) {
      throw new Error(`Encrypted credentials file not found: ${fullPath}`);
    }
    
    const encryptedData = require('fs').readFileSync(fullPath, 'utf8');
    const decryptedJson = this.decrypt(encryptedData, masterPassword);
    return JSON.parse(decryptedJson);
  }
  
  static hasEncryptedCredentials(filePath = '.credentials.enc') {
    return require('fs').existsSync(path.resolve(filePath));
  }
  
  static generateSecurePassword(length = 16) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
}

const CredentialProtection = SimpleCredentialProtection;
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hide password input
function hideInput(query, callback) {
  const stdin = process.stdin;
  const stdout = process.stdout;
  
  stdout.write(query);
  stdin.resume();
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');
  
  let password = '';
  stdin.on('data', function(char) {
    char = char + '';
    
    switch(char) {
      case '\n':
      case '\r':
      case '\u0004':
        stdin.setRawMode(false);
        stdin.pause();
        callback(password);
        break;
      case '\u0003':
        process.exit();
        break;
      case '\u007f': // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          stdout.write('\b \b');
        }
        break;
      default:
        password += char;
        stdout.write('*');
        break;
    }
  });
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function promptPassword(question) {
  return new Promise((resolve) => {
    hideInput(question, (password) => {
      console.log(''); // New line after hidden input
      resolve(password);
    });
  });
}

async function setupCredentials() {
  console.log('🔐 Credential Setup Utility');
  console.log('==========================');
  console.log('This tool helps you securely configure test credentials.\n');
  
  try {
    // Choose setup method
    console.log('Choose setup method:');
    console.log('1. Environment variables (.env file)');
    console.log('2. Encrypted credentials file');
    console.log('3. Both (recommended)');
    
    const method = await promptUser('Enter your choice (1-3): ');
    
    if (!['1', '2', '3'].includes(method)) {
      console.log('❌ Invalid choice. Exiting.');
      process.exit(1);
    }
    
    // Get credentials
    const email = await promptUser('Enter your Gmail address: ');
    const password = await promptPassword('Enter your Gmail password/app password: ');
    
    if (!email || !password) {
      console.log('❌ Email and password are required. Exiting.');
      process.exit(1);
    }
    
    // Method 1 or 3: Environment variables
    if (method === '1' || method === '3') {
      const envPath = path.resolve('.env');
      let envContent = '';
      
      // Read existing .env file
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Update or add credentials
      const lines = envContent.split('\n');
      let emailFound = false;
      let passwordFound = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('TEST_EMAIL=')) {
          lines[i] = `TEST_EMAIL=${email}`;
          emailFound = true;
        } else if (lines[i].startsWith('TEST_PASSWORD=')) {
          lines[i] = `TEST_PASSWORD=${password}`;
          passwordFound = true;
        }
      }
      
      if (!emailFound) lines.push(`TEST_EMAIL=${email}`);
      if (!passwordFound) lines.push(`TEST_PASSWORD=${password}`);
      
      fs.writeFileSync(envPath, lines.join('\n'));
      console.log('✅ Updated .env file with credentials');
    }
    
    // Method 2 or 3: Encrypted file
    if (method === '2' || method === '3') {
      const masterPassword = await promptPassword('Enter master password for encryption: ');
      
      if (!masterPassword) {
        console.log('❌ Master password is required for encryption. Exiting.');
        process.exit(1);
      }
      
      const credentials = { email, password };
      CredentialProtection.createEncryptedCredentialsFile(credentials, masterPassword);
      
      // Update .env with master password
      const envPath = path.resolve('.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      const lines = envContent.split('\n');
      let masterFound = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('MASTER_PASSWORD=')) {
          lines[i] = `MASTER_PASSWORD=${masterPassword}`;
          masterFound = true;
          break;
        }
      }
      
      if (!masterFound) {
        lines.push(`MASTER_PASSWORD=${masterPassword}`);
      }
      
      fs.writeFileSync(envPath, lines.join('\n'));
      console.log('✅ Created encrypted credentials file and updated .env with master password');
    }
    
    // Security recommendations
    console.log('\n🔒 Security Recommendations:');
    console.log('• Add .env and .credentials.enc to .gitignore');
    console.log('• Use Gmail App Passwords instead of main password');
    console.log('• Set strong master password for encryption');
    console.log('• Keep backup of credentials in secure location');
    
    // Update .gitignore
    const gitignorePath = path.resolve('.gitignore');
    if (fs.existsSync(gitignorePath)) {
      let gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
      
      if (!gitignoreContent.includes('.env')) {
        fs.appendFileSync(gitignorePath, '\n# Environment variables\n.env\n');
      }
      if (!gitignoreContent.includes('.credentials.enc')) {
        fs.appendFileSync(gitignorePath, '\n# Encrypted credentials\n.credentials.enc\n');
      }
      console.log('✅ Updated .gitignore with security entries');
    }
    
    console.log('\n🎉 Credential setup completed successfully!');
    console.log('\n🧪 Test your setup:');
    console.log('npm run test:allure:headed');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Additional utility functions
async function viewCredentials() {
  console.log('🔍 View Current Credentials');
  console.log('==========================');
  
  try {
    const masterPassword = await promptPassword('Enter master password: ');
    const credentials = CredentialProtection.readEncryptedCredentialsFile(masterPassword);
    
    console.log('\n📧 Current credentials:');
    console.log(`Email: ${credentials.email}`);
    console.log(`Password: ${'*'.repeat(credentials.password.length)}`);
  } catch (error) {
    console.error('❌ Failed to read credentials:', error.message);
  }
}

async function generatePassword() {
  console.log('🎲 Generate Secure Password');
  console.log('===========================');
  
  const length = await promptUser('Enter password length (default 16): ');
  const passwordLength = parseInt(length) || 16;
  
  const password = CredentialProtection.generateSecurePassword(passwordLength);
  console.log(`\n🔑 Generated password: ${password}`);
  console.log('💡 Copy this password and use it as your master password or app password');
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'setup':
      await setupCredentials();
      break;
    case 'view':
      await viewCredentials();
      break;
    case 'generate-password':
      await generatePassword();
      break;
    case 'help':
    default:
      console.log('🔐 Credential Setup Utility');
      console.log('===========================');
      console.log('Usage: node scripts/setup-credentials.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  setup             Interactive credential setup');
      console.log('  view              View encrypted credentials');
      console.log('  generate-password Generate secure password');
      console.log('  help              Show this help');
      break;
  }
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupCredentials, viewCredentials, generatePassword };
