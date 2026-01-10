# MCP Quick Start Guide

This guide will help you get started with the Playwright MCP server for AI-assisted testing of Divine Right 3.

## What You'll Get

- Interactive browser automation through AI assistants
- Ability to test the DR3 app conversationally
- Automated test case generation
- Visual regression testing capabilities

## Quick Start (2 Steps)

### Step 1: Start the Preview Server

```bash
npm run preview
```

Wait for the message: `Local: http://localhost:4173/dr3/`

### Step 2: Start the MCP Server (in a new terminal)

```bash
npm run mcp:playwright
```

That's it! The MCP server is now running and ready to interact with your DR3 application.

## Using with AI Assistants

### Supported Clients

The MCP server works with:
- Claude Desktop App
- VS Code with MCP extensions
- Cursor IDE
- Windsurf
- Any MCP-compatible client

### Example Interactions

**Test the hex grid:**
```
You: "Click on the hex at coordinates (10, 5) and verify a unit marker appears"
AI: *Uses MCP to click and verify*
```

**Visual testing:**
```
You: "Take a screenshot of the current game board"
AI: *Captures and returns screenshot via MCP*
```

**Generate tests:**
```
You: "Create a Playwright test for the zoom functionality"
AI: *Interacts with the app via MCP and writes test code*
```

## Configuration

The MCP server is pre-configured for DR3:
- **Browser**: Chromium (matches e2e tests)
- **URL**: http://localhost:4173/dr3/
- **Profile**: Saved in `.mcp/playwright-profile/`

See [.mcp/README.md](.mcp/README.md) for advanced configuration options.

## Troubleshooting

**"Cannot connect to server"**
- Ensure `npm run preview` is running first
- Check that port 4173 is not blocked

**"Browser fails to launch"**
- Delete the profile: `rm -rf .mcp/playwright-profile`
- Restart the MCP server

## Next Steps

1. Explore the [full MCP documentation](.mcp/README.md)
2. Run existing e2e tests: `npm run test:e2e`
3. Check the [main project plan](plan.md)

## Quick Reference

```bash
# Terminal 1: Run the app
npm run preview

# Terminal 2: Run MCP server
npm run mcp:playwright

# Alternative: Run e2e tests (traditional)
npm run test:e2e
```

---

**Need Help?** See the detailed guide in [.mcp/README.md](.mcp/README.md)
