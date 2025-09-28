#!/usr/bin/env node

/**
 * Single File Allure Report Generator
 * Generates a single index.html file with all content embedded
 * Perfect for GitHub Actions artifacts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Generating Single-File Allure Report...');

// Configuration
const ALLURE_RESULTS_DIR = 'allure-results';
const ALLURE_REPORT_DIR = 'allure-report';
const SINGLE_FILE_REPORT = 'allure-single-report.html';

/**
 * Generate standard Allure report first
 */
function generateStandardReport() {
  console.log('📊 Generating standard Allure report...');
  try {
    execSync(`allure generate ${ALLURE_RESULTS_DIR} --clean -o ${ALLURE_REPORT_DIR}`, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✅ Standard Allure report generated');
  } catch (error) {
    console.error('❌ Failed to generate standard Allure report:', error.message);
    process.exit(1);
  }
}

/**
 * Read and encode file as base64 data URL
 */
function encodeFileAsDataUrl(filePath, mimeType) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const base64Content = fileContent.toString('base64');
    return `data:${mimeType};base64,${base64Content}`;
  } catch (error) {
    console.warn(`⚠️  Could not encode file: ${filePath}`);
    return null;
  }
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Process HTML and embed all resources
 */
function createSingleFileReport() {
  console.log('🔗 Creating single-file report...');
  
  const indexPath = path.join(ALLURE_REPORT_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in allure-report directory');
    process.exit(1);
  }

  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // Embed CSS files
  console.log('📝 Embedding CSS files...');
  const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
  let cssMatch;
  while ((cssMatch = cssRegex.exec(htmlContent)) !== null) {
    const cssPath = path.join(ALLURE_REPORT_DIR, cssMatch[1]);
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      const styleTag = `<style type="text/css">\n${cssContent}\n</style>`;
      htmlContent = htmlContent.replace(cssMatch[0], styleTag);
      console.log(`  ✅ Embedded: ${cssMatch[1]}`);
    }
  }

  // Embed JavaScript files
  console.log('📝 Embedding JavaScript files...');
  const jsRegex = /<script[^>]*src=["']([^"']+)["'][^>]*><\/script>/g;
  let jsMatch;
  while ((jsMatch = jsRegex.exec(htmlContent)) !== null) {
    const jsPath = path.join(ALLURE_REPORT_DIR, jsMatch[1]);
    if (fs.existsSync(jsPath)) {
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      const scriptTag = `<script type="text/javascript">\n${jsContent}\n</script>`;
      htmlContent = htmlContent.replace(jsMatch[0], scriptTag);
      console.log(`  ✅ Embedded: ${jsMatch[1]}`);
    }
  }

  // Embed images and other assets as data URLs
  console.log('🖼️  Embedding images and assets...');
  const assetRegex = /(src|href)=["']([^"']+\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))["']/g;
  let assetMatch;
  while ((assetMatch = assetRegex.exec(htmlContent)) !== null) {
    const assetPath = path.join(ALLURE_REPORT_DIR, assetMatch[2]);
    if (fs.existsSync(assetPath)) {
      const mimeType = getMimeType(assetPath);
      const dataUrl = encodeFileAsDataUrl(assetPath, mimeType);
      if (dataUrl) {
        htmlContent = htmlContent.replace(assetMatch[0], `${assetMatch[1]}="${dataUrl}"`);
        console.log(`  ✅ Embedded: ${assetMatch[2]}`);
      }
    }
  }

  // Embed JSON data files
  console.log('📊 Embedding JSON data files...');
  const dataDir = path.join(ALLURE_REPORT_DIR, 'data');
  if (fs.existsSync(dataDir)) {
    const jsonFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    
    // Create a script to inject the data
    let dataScript = '<script type="text/javascript">\n';
    dataScript += '// Embedded Allure Data\n';
    dataScript += 'window.allureData = {};\n';
    
    jsonFiles.forEach(jsonFile => {
      const jsonPath = path.join(dataDir, jsonFile);
      const jsonContent = fs.readFileSync(jsonPath, 'utf8');
      const dataKey = path.basename(jsonFile, '.json');
      dataScript += `window.allureData['${dataKey}'] = ${jsonContent};\n`;
      console.log(`  ✅ Embedded data: ${jsonFile}`);
    });
    
    dataScript += '</script>\n';
    
    // Insert the data script before the closing </head> tag
    htmlContent = htmlContent.replace('</head>', `${dataScript}</head>`);
  }

  // Add metadata and title
  const metadata = `
<!-- 
  Single-File Allure Report
  Generated: ${new Date().toISOString()}
  Contains all embedded assets, styles, scripts, and data
  Perfect for GitHub Actions artifacts and sharing
-->
`;
  htmlContent = htmlContent.replace('<html', `${metadata}<html`);

  // Update title to indicate it's a single-file report
  htmlContent = htmlContent.replace(/<title>[^<]*<\/title>/, 
    '<title>Allure Report - Single File (Complete)</title>');

  // Write the single file report
  fs.writeFileSync(SINGLE_FILE_REPORT, htmlContent, 'utf8');
  console.log(`✅ Single-file report created: ${SINGLE_FILE_REPORT}`);
  
  // Get file size
  const stats = fs.statSync(SINGLE_FILE_REPORT);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 File size: ${fileSizeMB} MB`);
}

/**
 * Clean up temporary files
 */
function cleanup() {
  console.log('🧹 Cleaning up temporary files...');
  if (fs.existsSync(ALLURE_REPORT_DIR)) {
    fs.rmSync(ALLURE_REPORT_DIR, { recursive: true, force: true });
    console.log('✅ Cleaned up temporary allure-report directory');
  }
}

/**
 * Main execution
 */
function main() {
  try {
    // Check if allure is installed
    execSync('allure --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Allure CLI not found. Please install it first:');
    console.error('   npm install -g allure-commandline');
    process.exit(1);
  }

  // Check if results exist
  if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
    console.error(`❌ Allure results directory not found: ${ALLURE_RESULTS_DIR}`);
    console.error('   Run tests first to generate results');
    process.exit(1);
  }

  console.log('🚀 Starting single-file Allure report generation...');
  
  generateStandardReport();
  createSingleFileReport();
  cleanup();
  
  console.log('🎉 Single-file Allure report generation complete!');
  console.log(`📄 Report file: ${SINGLE_FILE_REPORT}`);
  console.log('🔗 This file contains everything needed and can be opened directly in any browser');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
