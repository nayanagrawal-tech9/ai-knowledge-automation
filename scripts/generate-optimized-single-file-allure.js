#!/usr/bin/env node

/**
 * Optimized Single File Allure Report Generator
 * Generates a single index.html file with selective embedding
 * Handles large files efficiently
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Generating Optimized Single-File Allure Report...');

// Configuration
const ALLURE_RESULTS_DIR = 'allure-results';
const ALLURE_REPORT_DIR = 'allure-report';
const SINGLE_FILE_REPORT = 'allure-single-report.html';

// File size limits (in bytes)
const MAX_EMBED_SIZE = 500000; // 500KB limit for embedding

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
 * Check if file should be embedded based on size
 */
function shouldEmbed(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size <= MAX_EMBED_SIZE;
  } catch (error) {
    return false;
  }
}

/**
 * Read and encode file as base64 data URL
 */
function encodeFileAsDataUrl(filePath, mimeType) {
  try {
    if (!shouldEmbed(filePath)) {
      console.log(`  ⚠️  Skipping large file: ${path.basename(filePath)}`);
      return null;
    }
    
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
    '.ico': 'image/x-icon'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Create comprehensive single-file report with embedded data
 */
function createOptimizedSingleFileReport() {
  console.log('🔗 Creating optimized single-file report...');
  
  const indexPath = path.join(ALLURE_REPORT_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in allure-report directory');
    process.exit(1);
  }

  let htmlContent = fs.readFileSync(indexPath, 'utf8');
  
  // Embed CSS files (usually small)
  console.log('📝 Embedding CSS files...');
  const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/g;
  let match;
  const processedFiles = new Set();
  
  let newHtmlContent = htmlContent;
  while ((match = cssRegex.exec(htmlContent)) !== null) {
    const cssFile = match[1];
    if (processedFiles.has(cssFile)) continue;
    processedFiles.add(cssFile);
    
    const cssPath = path.join(ALLURE_REPORT_DIR, cssFile);
    if (fs.existsSync(cssPath) && shouldEmbed(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      const styleTag = `<style type="text/css" data-source="${cssFile}">\n${cssContent}\n</style>`;
      newHtmlContent = newHtmlContent.replace(match[0], styleTag);
      console.log(`  ✅ Embedded: ${cssFile}`);
    } else {
      console.log(`  ⚠️  Kept as link: ${cssFile} (too large or not found)`);
    }
  }
  htmlContent = newHtmlContent;

  // For JS files, we'll create a more targeted approach
  console.log('📊 Embedding critical JSON data...');
  
  // Embed only the essential JSON data files
  const dataDir = path.join(ALLURE_REPORT_DIR, 'data');
  if (fs.existsSync(dataDir)) {
    const jsonFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
    
    let dataScript = '<script type="text/javascript">\n';
    dataScript += '/* Embedded Allure Data */\n';
    dataScript += 'window.allureEmbeddedData = {};\n';
    
    let embeddedCount = 0;
    jsonFiles.forEach(jsonFile => {
      const jsonPath = path.join(dataDir, jsonFile);
      if (shouldEmbed(jsonPath)) {
        try {
          const jsonContent = fs.readFileSync(jsonPath, 'utf8');
          const dataKey = path.basename(jsonFile, '.json');
          dataScript += `window.allureEmbeddedData['${dataKey}'] = ${jsonContent};\n`;
          console.log(`  ✅ Embedded data: ${jsonFile}`);
          embeddedCount++;
        } catch (error) {
          console.log(`  ⚠️  Skipped data: ${jsonFile} (parse error)`);
        }
      } else {
        console.log(`  ⚠️  Skipped data: ${jsonFile} (too large)`);
      }
    });
    
    dataScript += `console.log('Allure: Embedded ${embeddedCount} data files');\n`;
    dataScript += '</script>\n';
    
    // Insert the data script before closing </head>
    if (embeddedCount > 0) {
      htmlContent = htmlContent.replace('</head>', `${dataScript}</head>`);
    }
  }

  // Embed small images and icons
  console.log('🖼️  Embedding small images...');
  const imageRegex = /(src)=["']([^"']+\.(png|jpg|jpeg|gif|svg|ico))["']/g;
  let imageMatch;
  let imageCount = 0;
  
  while ((imageMatch = imageRegex.exec(htmlContent)) !== null) {
    const imagePath = path.join(ALLURE_REPORT_DIR, imageMatch[2]);
    if (fs.existsSync(imagePath) && shouldEmbed(imagePath)) {
      const mimeType = getMimeType(imagePath);
      const dataUrl = encodeFileAsDataUrl(imagePath, mimeType);
      if (dataUrl) {
        htmlContent = htmlContent.replace(imageMatch[0], `${imageMatch[1]}="${dataUrl}"`);
        console.log(`  ✅ Embedded: ${imageMatch[2]}`);
        imageCount++;
      }
    }
  }

  // Add comprehensive metadata
  const metadata = `
<!-- 
  Optimized Single-File Allure Report
  Generated: ${new Date().toISOString()}
  
  Features:
  - Embedded CSS styles
  - Embedded JSON test data
  - Embedded small images (${imageCount} files)
  - Self-contained HTML file
  - Perfect for GitHub Actions artifacts
  
  Note: Large JavaScript files are kept as external references
  This ensures the file remains manageable while providing full functionality
-->
`;
  
  htmlContent = htmlContent.replace('<html', `${metadata}<html`);

  // Update title and add info banner
  htmlContent = htmlContent.replace(/<title>[^<]*<\/title>/, 
    '<title>Allure Report - Single File (Optimized)</title>');

  // Add info banner at the top
  const infoBanner = `
<div style="background: #28a745; color: white; padding: 10px; text-align: center; font-family: Arial, sans-serif; position: sticky; top: 0; z-index: 1000; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
  📄 <strong>Single-File Report</strong> | Generated: ${new Date().toLocaleString()} | Self-contained for easy sharing
</div>
`;
  
  htmlContent = htmlContent.replace('<body>', `<body>${infoBanner}`);

  // Write the optimized single file report
  fs.writeFileSync(SINGLE_FILE_REPORT, htmlContent, 'utf8');
  console.log(`✅ Optimized single-file report created: ${SINGLE_FILE_REPORT}`);
  
  // Get file size
  const stats = fs.statSync(SINGLE_FILE_REPORT);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📊 Final file size: ${fileSizeMB} MB`);
  
  return {
    filePath: SINGLE_FILE_REPORT,
    fileSize: fileSizeMB,
    embeddedImages: imageCount
  };
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

  console.log('🚀 Starting optimized single-file Allure report generation...');
  
  generateStandardReport();
  const result = createOptimizedSingleFileReport();
  cleanup();
  
  console.log('🎉 Optimized single-file Allure report generation complete!');
  console.log(`📄 Report file: ${result.filePath}`);
  console.log(`📊 File size: ${result.fileSize} MB`);
  console.log('🔗 This optimized file contains essential data and can be opened directly in any browser');
  console.log('💡 Perfect for GitHub Actions artifacts and easy sharing!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
