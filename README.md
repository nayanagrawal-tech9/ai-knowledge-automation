# AI Knowledge Chat UI - E2E Test Automation

This project contains end-to-end test automation for the AI Knowledge Chat UI application, with a focus on Gmail SSO authentication testing using Playwright and TypeScript.

## 🏗️ Project Structure

```
ai-knowledge-automation/
├── src/
│   ├── pages/                    # Page Object Models
│   │   ├── BasePage.ts          # Base page with common functionality
│   │   ├── LoginPage.ts         # Login page objects and methods
│   │   ├── GoogleOAuthPage.ts   # Google OAuth page objects and methods
│   │   ├── HomePage.ts          # Home page objects and methods
│   │   └── index.ts             # Page objects exports
│   ├── fixtures/                # Custom test fixtures
│   │   └── test-fixtures.ts     # Page object fixtures
│   ├── utils/                   # Utility functions and configurations
│   │   ├── index.ts             # Utility functions
│   │   ├── test-config.ts       # Test configuration and data
│   │   └── global-setup.ts      # Global test setup
│   └── types/                   # TypeScript type definitions
│       └── index.ts             # Type definitions
├── tests/
│   └── auth/                    # Authentication tests
│       └── login.spec.ts        # Login functionality tests
├── playwright.config.ts         # Playwright configuration
├── package.json                 # Project dependencies and scripts
├── .env.example                 # Environment variables example
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npm run test:install
```

3. Install system dependencies (if needed):
```bash
npm run test:install-deps
```

### Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your test credentials:
```env
# Gmail credentials for SSO testing
TEST_EMAIL=your-test-email@gmail.com
TEST_PASSWORD=your-test-password

# Application URLs (default values work for production)
BASE_URL=https://ai-knowledge-chat-ui.vercel.app
LOGIN_URL=https://ai-knowledge-chat-ui.vercel.app/login
HOME_URL=https://ai-knowledge-chat-ui.vercel.app/home

# Test configuration
TEST_ENV=dev
HEADLESS=false
SLOW_MO=100
```

⚠️ **Security Note**: Never commit real credentials to version control. The `.env` file should be added to `.gitignore`.

## 🧪 Running Tests

### All Tests
```bash
npm test                    # Run all tests (headless)
npm run test:headed         # Run all tests (headed - visible browser)
npm run test:ui             # Run tests with Playwright UI
```

### Authentication Tests Only
```bash
npm run test:auth           # Run auth tests (headless)
npm run test:auth:headed    # Run auth tests (headed)
```

### Debug Mode
```bash
npm run test:debug          # Run tests in debug mode with browser dev tools
```

### Generate Test Report
```bash
npm run report              # Open HTML test report
```

## 📋 Test Cases

### Authentication Tests (`tests/auth/login.spec.ts`)

1. **Login Page Display**
   - Verifies login page elements are displayed correctly
   - Checks logo, header text, SSO button, and other UI elements
   - Validates page title and metadata

2. **SSO Redirect**
   - Tests clicking "Sign in with SSO" button
   - Verifies redirect to Google OAuth page
   - Validates Google OAuth page elements

3. **Invalid Email Handling**
   - Tests behavior with invalid email addresses
   - Verifies error handling on Google OAuth page

4. **Full Login Flow** (Requires valid Gmail credentials)
   - Complete Gmail SSO authentication flow
   - Verifies successful redirect to home page
   - Validates user authentication state

5. **Access Control**
   - Tests accessing home page without authentication
   - Verifies redirect to login page

6. **Navigation Testing**
   - Tests browser back/forward navigation
   - Verifies correct page states after navigation

7. **Responsive Design**
   - Tests login page on different screen sizes
   - Validates mobile, tablet, and desktop viewports

## 🏛️ Page Object Model Architecture

The framework follows the Page Object Model (POM) design pattern:

### BasePage
- Contains common functionality used across all pages
- Provides utility methods for waiting, clicking, filling forms
- Handles screenshots, navigation, and element interactions

### LoginPage
- Encapsulates all login page elements and actions
- Provides methods for interacting with SSO button
- Validates login page elements and content

### GoogleOAuthPage
- Handles Google OAuth authentication flow
- Provides methods for entering credentials
- Manages OAuth page interactions and validations

### HomePage
- Represents the authenticated user's home page
- Provides methods for post-login interactions
- Validates successful authentication state

## 🔧 Configuration Options

### Playwright Config (`playwright.config.ts`)
- Browser settings (Chrome optimized for OAuth)
- Timeout configurations
- Screenshot and video capture settings
- Test parallelization options

### Environment Variables
- `TEST_EMAIL`: Gmail address for testing
- `TEST_PASSWORD`: Gmail password for testing
- `HEADLESS`: Run tests in headless mode
- `SLOW_MO`: Slow down test execution (ms)
- `PARALLEL_WORKERS`: Number of parallel test workers

## 📊 Test Reports

After running tests, view the HTML report:
```bash
npm run report
```

The report includes:
- Test execution results
- Screenshots of failures
- Performance metrics
- Test traces for debugging

## 🐛 Debugging

### Debug Individual Test
```bash
npx playwright test tests/auth/login.spec.ts --debug
```

### Run Specific Test
```bash
npx playwright test -g "should display login page elements correctly"
```

### Trace Viewer
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 🔒 Security Considerations

1. **Credentials Management**
   - Use environment variables for sensitive data
   - Never commit real credentials to version control
   - Consider using secret management tools in CI/CD

2. **Test Data**
   - Use dedicated test accounts
   - Implement data cleanup after tests
   - Avoid using production data

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm test
      env:
        TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
        TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## 📝 Best Practices

1. **Page Objects**
   - Keep page objects focused and cohesive
   - Use descriptive method names
   - Implement proper waiting strategies

2. **Test Organization**
   - Group related tests in describe blocks
   - Use meaningful test descriptions
   - Keep tests independent and atomic

3. **Error Handling**
   - Implement proper timeout handling
   - Add meaningful assertions
   - Use custom error messages

4. **Maintenance**
   - Regularly update selectors
   - Keep dependencies up to date
   - Monitor test reliability

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass before submitting

## 📋 Troubleshooting

### Common Issues

1. **Browser Installation**
   ```bash
   npx playwright install chromium
   ```

2. **Timeout Issues**
   - Increase timeout values in config
   - Check network connectivity
   - Verify application availability

3. **Element Not Found**
   - Update selectors if UI changed
   - Add proper wait conditions
   - Check for dynamic content loading

4. **OAuth Flow Issues**
   - Verify Gmail credentials
   - Check for 2FA requirements
   - Ensure test account permissions

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Playwright documentation
3. Open an issue in the project repository
