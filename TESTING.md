# Testing FULCRUM (Gemini CLI) Locally

This guide shows you how to build and test the FULCRUM application on your local
machine.

## Prerequisites

Before you start, ensure you have:

- **Node.js** version 20 or higher
- **npm** (comes with Node.js)
- **Git** (to clone the repository)

## Quick Start

### 1. Navigate to the Project Directory

```bash
cd /path/to/gemini-cli
```

### 2. Install Dependencies

```bash
npm install
```

This will install all dependencies for all packages in the monorepo.

### 3. Build the Project

```bash
npm run build
```

This compiles TypeScript and prepares all packages.

### 4. Run the Application

```bash
npm start
```

This will start FULCRUM in development mode and you should see the FULCRUM ASCII
art logo!

## Testing Specific Features

### Testing the FULCRUM Branding

Just run the app and you should see:

```bash
npm start
```

You should see:

- ✅ "FULCRUM" ASCII art logo (instead of "GEMINI")
- ✅ Window title showing "FULCRUM - {folder-name}"
- ✅ About dialog showing "About FULCRUM"
- ✅ Tips mentioning "FULCRUM.md" files

### Testing xAI Grok 4 Fast Reasoning

1. **Set up your xAI API key:**

```bash
export XAI_API_KEY="xai-your-api-key-here"
```

2. **Create a test configuration:**

```bash
cat > .gemini-settings.json << EOF
{
  "security": {
    "auth": {
      "selectedType": "xai-api-key"
    }
  },
  "model": {
    "name": "grok-4-fast-reasoning"
  }
}
EOF
```

3. **Run the app:**

```bash
npm start
```

4. **Test commands:**

```
You: Hello, what model are you?
You: Use the bash tool to list files in the current directory
You: What's 2+2? (tests basic interaction)
```

### Testing AWS CCAPI MCP Server

1. **Run the automated setup script:**

```bash
./scripts/setup-aws-ccapi.sh
```

Or manually:

2. **Set AWS credentials:**

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

3. **Copy the configuration:**

```bash
cp .gemini-settings.aws-ccapi.json .gemini-settings.json
```

4. **Run the app:**

```bash
npm start
```

5. **Test AWS commands:**

```
You: List my S3 buckets
You: What AWS account am I using?
You: Show me the schema for AWS::Lambda::Function
```

### Testing All Integrations Together

Create a combined configuration:

```bash
cat > .gemini-settings.json << EOF
{
  "security": {
    "auth": {
      "selectedType": "xai-api-key"
    }
  },
  "model": {
    "name": "grok-4-fast-reasoning"
  },
  "mcpServers": {
    "aws-ccapi": {
      "command": "uvx",
      "args": ["awslabs.ccapi-mcp-server@latest"],
      "env": {
        "AWS_REGION": "us-east-1",
        "SECURITY_SCANNING": "disabled"
      },
      "description": "AWS Cloud Control API server",
      "trust": true
    }
  }
}
EOF
```

Then set all environment variables:

```bash
export XAI_API_KEY="xai-..."
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

Run the app:

```bash
npm start
```

## Development Commands

### Build and Run in One Command

```bash
npm run build-and-start
```

### Run in Debug Mode

```bash
npm run debug
```

Then attach a debugger (VS Code, Chrome DevTools, etc.) to port 9229.

### Watch Mode for Development

```bash
npm run start
```

This runs in development mode with NODE_ENV=development.

### Run Tests

```bash
# Run all tests
npm test

# Run integration tests (no sandbox)
npm run test:integration:sandbox:none

# Run E2E tests
npm run test:e2e
```

### Lint and Format

```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Testing in a Clean Environment

To test as if it's a fresh install:

1. **Create a test directory:**

```bash
mkdir ~/fulcrum-test
cd ~/fulcrum-test
```

2. **Link to your local build:**

```bash
npm link /path/to/gemini-cli/packages/cli
```

3. **Run the CLI:**

```bash
gemini
```

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
npm run build
```

### Port already in use

If testing the A2A server:

```bash
# Kill the process using the port
lsof -ti:41242 | xargs kill -9
```

### TypeScript compilation errors

```bash
# Clean and rebuild
rm -rf packages/*/dist
npm run build
```

### Environment variables not loading

Make sure you're in the project directory where `.env` or
`.gemini-settings.json` exists:

```bash
pwd  # Check current directory
ls -la .gemini-settings.json  # Verify config exists
```

### Testing specific packages

```bash
# Build just the core package
npm run build --workspace @google/gemini-cli-core

# Build just the CLI package
npm run build --workspace @google/gemini-cli

# Test just the core package
npm test --workspace @google/gemini-cli-core
```

## Manual Testing Checklist

- [ ] FULCRUM logo displays correctly on startup
- [ ] Window title shows "FULCRUM - {folder}"
- [ ] About dialog shows "About FULCRUM"
- [ ] Tips mention "FULCRUM.md" instead of "GEMINI.md"
- [ ] xAI Grok responds to queries
- [ ] Tool calling works (file operations, bash commands)
- [ ] AWS CCAPI MCP server connects successfully
- [ ] AWS resource operations work (list, create, etc.)
- [ ] Combined configuration works (Grok + AWS CCAPI)

## Quick Test Script

Run this to quickly test all features:

```bash
#!/bin/bash

echo "=== Building FULCRUM ==="
npm run build

echo ""
echo "=== Starting FULCRUM ==="
echo "Look for FULCRUM ASCII art logo!"
echo ""
echo "Test commands:"
echo "1. Type: Hello"
echo "2. Type: /about"
echo "3. Type: /help"
echo "4. Press Ctrl+C to exit"
echo ""

npm start
```

Save this as `test-fulcrum.sh`, make it executable (`chmod +x test-fulcrum.sh`),
and run it (`./test-fulcrum.sh`).

## Environment Setup Summary

For a complete test with all features:

```bash
# xAI Grok
export XAI_API_KEY="xai-your-key"

# AWS CCAPI
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"

# Build and run
npm run build && npm start
```

## Next Steps

- Once testing is complete and everything works, you can create a production
  build
- Package the application for distribution
- Deploy to npm registry (if desired)
- Create release documentation

Need help with any specific testing scenario? Just ask!
