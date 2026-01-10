# MCP (Model Context Protocol) Configuration for DR3

This directory contains the MCP server configuration for the Divine Right 3 project, specifically set up to enable AI-assisted end-to-end testing with Playwright.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables seamless integration between AI assistants and external tools/data sources. In this project, we use the Playwright MCP server to provide AI assistants with the ability to interact with and test the DR3 web application.

## Setup

The MCP server is configured and ready to use. No additional installation is required beyond Node.js 18+.

### Configuration Files

- **`.mcp/config.json`**: Main MCP server configuration
- **`.mcp/.gitignore`**: Prevents committing temporary files and browser profiles
- **`.mcp/playwright-profile/`**: Browser profile directory (auto-created, git-ignored)

## Usage

### Starting the MCP Server

There are two ways to start the Playwright MCP server:

#### Option 1: Using npm script (Recommended)

```bash
npm run mcp:playwright
```

#### Option 2: Direct npx command

```bash
npx @playwright/mcp@latest --browser chromium --init-page http://localhost:4173/dr3/ --allow-unrestricted-file-access --user-data-dir .mcp/playwright-profile
```

### Prerequisites

Before starting the MCP server, ensure the DR3 application is running:

```bash
# In one terminal, start the preview server
npm run preview

# In another terminal, start the MCP server
npm run mcp:playwright
```

## MCP Server Configuration

The server is configured with the following settings:

| Setting | Value | Purpose |
|---------|-------|---------|
| **Browser** | chromium | Matches the existing Playwright test configuration |
| **Init Page** | `http://localhost:4173/dr3/` | Automatically navigates to the DR3 app on startup |
| **File Access** | Unrestricted | Allows reading test fixtures and assets |
| **User Data Dir** | `.mcp/playwright-profile` | Persists browser state between sessions |

## Integration with Existing Tests

The MCP server complements your existing Playwright e2e test suite:

- **Existing Tests**: Located in `/e2e/app.spec.ts`, run via `npm run test:e2e`
- **MCP Server**: Provides interactive, AI-assisted testing capabilities
- **Shared Config**: Both use the same base URL and Chromium browser

## Capabilities

With the Playwright MCP server running, AI assistants can:

1. **Navigate and Interact**: Click elements, fill forms, navigate pages
2. **Visual Testing**: Take screenshots, compare visual states
3. **DOM Inspection**: Query elements, check accessibility
4. **Network Monitoring**: Intercept requests, mock responses
5. **Test Generation**: Create new test cases based on manual exploration
6. **Debugging**: Pause execution, inspect state, step through interactions

## Security Considerations

- The `--allow-unrestricted-file-access` flag is enabled for development convenience
- The MCP server should only be run in trusted development environments
- Browser profile data is stored locally in `.mcp/playwright-profile/` and excluded from git

## Example Use Cases

### 1. Interactive Test Development
Start the MCP server and use an AI assistant to explore the application and generate test cases:

```
Assistant: "Navigate to the hex grid and click on hex at position (5, 10)"
MCP Server: *Performs action and returns result*
Assistant: "The unit marker appeared correctly. Let me create a test for this..."
```

### 2. Visual Regression Testing
Ask the AI to take screenshots and compare them:

```
Assistant: "Take a screenshot of the current game state"
MCP Server: *Captures screenshot*
Assistant: "Compare this with the expected baseline..."
```

### 3. Debugging Test Failures
When e2e tests fail, use the MCP server to investigate:

```
Assistant: "Navigate to the scenario that's failing in test:e2e"
MCP Server: *Reproduces the scenario*
Assistant: "I see the issue - the unit marker is rendering 2px off..."
```

## Troubleshooting

### MCP Server Won't Start

**Issue**: Server fails to start or times out

**Solution**: Ensure the preview server is running first:
```bash
npm run preview
```

### Browser Profile Corruption

**Issue**: Unexpected browser behavior or crashes

**Solution**: Delete the profile directory:
```bash
rm -rf .mcp/playwright-profile
```

### Port Conflicts

**Issue**: Port 4173 is already in use

**Solution**: Kill the existing process or update the preview server port in `vite.config.ts`

## Advanced Configuration

### Custom Browser Options

Edit `.mcp/config.json` to customize browser settings:

```json
{
  "mcpServers": {
    "playwright": {
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chromium",
        "--headless",                    // Run in headless mode
        "--viewport-size", "1920x1080",  // Custom viewport
        "--device", "iPhone 15",         // Emulate mobile device
        "--timeout-action", "10000"      // Increase timeout
      ]
    }
  }
}
```

### Multiple Server Configurations

You can set up multiple MCP server profiles for different testing scenarios:

```json
{
  "mcpServers": {
    "playwright-desktop": { ... },
    "playwright-mobile": { ... },
    "playwright-headless": { ... }
  }
}
```

## Integration with CI/CD

The MCP server is designed for local development and interactive testing. For CI/CD, continue using the standard Playwright tests:

```bash
npm run test:e2e  # CI/CD pipeline
npm run mcp:playwright  # Local development only
```

## Further Reading

- [Playwright MCP Documentation](https://github.com/microsoft/playwright-mcp)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Divine Right 3 Testing Guide](/e2e/README.md) *(if exists)*
- [DR3 Project Plan](/plan.md)

## Support

For issues specific to:
- **MCP Server**: https://github.com/microsoft/playwright-mcp/issues
- **DR3 Project**: https://github.com/jmmL/dr3/issues
- **Playwright**: https://github.com/microsoft/playwright/issues

---

**Last Updated**: 2026-01-10
**MCP Server Version**: @playwright/mcp@latest (0.0.55+)
