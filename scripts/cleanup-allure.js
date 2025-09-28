#!/usr/bin/env node
/**
 * Allure Cleanup Utility
 * Cleans up previous Allure results and reports before running new tests
 */

const fs = require('fs');
const path = require('path');

function cleanupAllureData() {
  console.log('🧹 Allure Cleanup Utility');
  console.log('========================');
  
  const allureDirectories = [
    'allure-results',
    'allure-report'
  ];
  
  let cleanedCount = 0;
  
  allureDirectories.forEach(dir => {
    const dirPath = path.resolve(dir);
    
    if (fs.existsSync(dirPath)) {
      try {
        // Get directory stats before deletion
        const stats = fs.statSync(dirPath);
        const files = fs.readdirSync(dirPath).length;
        
        // Remove directory
        fs.rmSync(dirPath, { recursive: true, force: true });
        
        console.log(`✅ Cleaned: ${dir}/ (${files} files removed)`);
        cleanedCount++;
      } catch (error) {
        console.log(`❌ Failed to clean: ${dir}/`, error.message);
      }
    } else {
      console.log(`ℹ️  Already clean: ${dir}/ (directory doesn't exist)`);
    }
  });
  
  // Recreate allure-results directory for new results
  const allureResultsPath = path.resolve('allure-results');
  if (!fs.existsSync(allureResultsPath)) {
    fs.mkdirSync(allureResultsPath, { recursive: true });
    console.log('📁 Created fresh: allure-results/');
  }
  
  console.log('========================');
  if (cleanedCount > 0) {
    console.log(`🎉 Cleanup complete! ${cleanedCount} directories cleaned.`);
  } else {
    console.log('✨ All directories were already clean!');
  }
  console.log('Ready for fresh Allure test execution.\n');
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupAllureData();
}

module.exports = { cleanupAllureData };
