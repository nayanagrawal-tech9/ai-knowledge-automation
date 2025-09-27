# Quick Start Guide - Gmail SSO Test Automation

## 🚀 Running Tests Immediately

### Basic Tests (No Gmail credentials required)
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Run UI and navigation tests
npm run test:auth
```

### Full SSO Tests (Requires Gmail credentials)
```bash
# Create .env file
cp .env.example .env

# Edit .env file with your Gmail credentials
TEST_EMAIL=your-test-email@gmail.com
TEST_PASSWORD=your-test-password

# Run all tests including full login flow
npm run test:auth:headed
```

## 📋 Test Scenarios Covered

### ✅ Working Tests
1. **Login Page Display** - Verifies all UI elements
2. **SSO Redirect** - Tests redirect to Google OAuth
3. **Access Control** - Verifies protected routes
4. **Navigation** - Tests browser back/forward
5. **Responsive Design** - Tests different screen sizes
6. **Visual Elements** - Tests styling and layout
7. **Keyboard Navigation** - Tests accessibility

### ⚠️ Conditional Tests
1. **Full Gmail Login** - Requires valid Gmail credentials
2. **Error States** - May vary based on Google's current UI

## 🎯 Sample Test Commands

```bash
# Run specific test
npx playwright test -g "should display login page elements correctly"

# Run with visible browser
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Generate report
npm run report
```

## 📊 Expected Results

- **13-15 tests total**
- **10+ tests should pass** without Gmail credentials
- **All tests pass** with valid Gmail credentials
- **2-3 tests may be flaky** (error state validation)

## 🔧 Troubleshooting

### Common Issues
1. **Browser Installation**: Run `npm run test:install`
2. **Timeout Issues**: Increase timeouts in `playwright.config.ts`
3. **Google OAuth Changes**: Update selectors in `GoogleOAuthPage.ts`

### Debug Failed Tests
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 📝 Test Reports

After running tests, open the HTML report:
```bash
npm run report
```

The report includes:
- Test execution status
- Screenshots of failures
- Performance metrics
- Detailed error logs
