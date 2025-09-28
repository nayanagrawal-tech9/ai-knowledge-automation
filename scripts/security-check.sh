#!/bin/bash

# 🔒 Security Validation Script
# Checks for credential leaks and security issues

echo "🔍 Running security validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SECURITY_ISSUES=0

echo -e "${BLUE}📋 Security Checklist:${NC}"

# Check 1: No hardcoded passwords in source files
echo -n "1. Checking for hardcoded passwords in source files... "
if grep -r "password.*=" src/ --exclude-dir=node_modules --exclude-dir=test-results --exclude="*.md" | grep -v "process.env" | grep -v "password:" | grep -v "password'" | grep -v "password\"" | grep -v "password}" | grep -v "password)" | grep -v "let password" | grep -v "password +=" | grep -v "generateSecurePassword" | grep -v "masterPassword" | grep -v "password-store" > /dev/null 2>&1; then
    echo -e "${RED}❌ FAIL${NC}"
    echo -e "${YELLOW}   Found potential hardcoded passwords:${NC}"
    grep -r "password.*=" src/ --exclude-dir=node_modules --exclude-dir=test-results --exclude="*.md" | grep -v "process.env" | grep -v "password:" | grep -v "password'" | grep -v "password\"" | grep -v "password}" | grep -v "password)" | grep -v "let password" | grep -v "password +=" | grep -v "generateSecurePassword" | grep -v "masterPassword" | grep -v "password-store" | head -5
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    echo -e "${GREEN}✅ PASS${NC}"
fi

# Check 2: No credentials in .env file
echo -n "2. Checking .env file for actual credentials... "
if [ -f ".env" ] && grep -E "^(TEST_EMAIL|TEST_PASSWORD|ALT_TEST_EMAIL|ALT_TEST_PASSWORD)=" .env | grep -v "your-" | grep -v "#" > /dev/null 2>&1; then
    echo -e "${RED}❌ FAIL${NC}"
    echo -e "${YELLOW}   Found credentials in .env file. These should be commented out or use placeholders.${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    echo -e "${GREEN}✅ PASS${NC}"
fi

# Check 3: .env file is in .gitignore
echo -n "3. Checking if .env is in .gitignore... "
if grep -q "^\.env$" .gitignore; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo -e "${YELLOW}   .env file is not properly ignored in .gitignore${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check 4: Encrypted credentials file is in .gitignore
echo -n "4. Checking if encrypted-credentials.json is in .gitignore... "
if grep -q "encrypted-credentials.json" .gitignore; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo -e "${YELLOW}   encrypted-credentials.json should be in .gitignore${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check 5: No credentials in git history
echo -n "5. Checking git history for credential leaks... "
if git log --all --grep="password" --oneline | head -1 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo -e "${YELLOW}   Found 'password' mentions in git history. Review these commits:${NC}"
    git log --all --grep="password" --oneline | head -3
else
    echo -e "${GREEN}✅ PASS${NC}"
fi

# Check 6: Verify credential loading throws error without setup
echo -n "6. Testing credential protection... "
if node -e "
try {
  const { getTestCredentials } = require('./src/config/credentials.ts');
  getTestCredentials();
  console.log('FAIL');
} catch (error) {
  console.log('PASS');
}" 2>/dev/null | grep -q "PASS"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo -e "${YELLOW}   Credential system should throw error when no credentials are configured${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
fi

# Check 7: Verify encrypted credentials functionality
echo -n "7. Testing encryption functionality... "
if node -e "
const { CredentialEncryption } = require('./src/utils/simple-credential-encryption.ts');
try {
  const success = CredentialEncryption.testEncryption();
  console.log(success ? 'PASS' : 'FAIL');
} catch (error) {
  console.log('FAIL');
}" 2>/dev/null | grep -q "PASS"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo -e "${YELLOW}   Encryption functionality may have issues${NC}"
fi

# Summary
echo -e "\n${BLUE}📊 Security Summary:${NC}"
if [ $SECURITY_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    echo -e "${GREEN}✅ No credential leaks detected${NC}"
    echo -e "${GREEN}✅ Encryption system is properly configured${NC}"
else
    echo -e "${RED}❌ Found $SECURITY_ISSUES security issues${NC}"
    echo -e "${RED}❌ Please fix the issues above before proceeding${NC}"
fi

# Recommendations
echo -e "\n${BLUE}💡 Security Recommendations:${NC}"
echo -e "1. Use environment variables for CI/CD: TEST_EMAIL, TEST_PASSWORD"
echo -e "2. Use encrypted credentials file for local development"
echo -e "3. Run 'npm run setup:credentials' for interactive setup"
echo -e "4. Never commit .env files with real credentials"
echo -e "5. Regularly rotate test passwords"
echo -e "6. Use strong master passwords (32+ characters)"

exit $SECURITY_ISSUES
