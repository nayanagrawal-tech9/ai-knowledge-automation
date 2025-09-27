import { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting AI Knowledge Chat UI E2E Tests');
  console.log('🌐 Base URL:', process.env.BASE_URL || 'https://ai-knowledge-chat-ui.vercel.app');
  console.log('👥 Workers:', config.workers);
  
  // Create directories for test artifacts
  const directories = [
    'test-results',
    'playwright-report',
    'screenshots'
  ];

  directories.forEach(dir => {
    const dirPath = path.resolve(dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  });

  // Log environment configuration
  console.log('⚙️  Environment Configuration:');
  console.log('   - TEST_ENV:', process.env.TEST_ENV || 'dev');
  console.log('   - HEADLESS:', process.env.HEADLESS || 'default');
  console.log('   - Email configured:', !!process.env.TEST_EMAIL && process.env.TEST_EMAIL !== 'your-test-email@gmail.com');
  
  if (!process.env.TEST_EMAIL || process.env.TEST_EMAIL === 'your-test-email@gmail.com') {
    console.log('⚠️  Warning: TEST_EMAIL not configured. Full login tests will be skipped.');
    console.log('   To run full tests, set TEST_EMAIL and TEST_PASSWORD environment variables.');
  }

  console.log('✅ Global setup completed\n');
}

export default globalSetup;
