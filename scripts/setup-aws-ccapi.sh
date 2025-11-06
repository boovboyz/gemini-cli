#!/bin/bash

# AWS CCAPI MCP Server Setup Script for Gemini CLI
# This script helps configure AWS CCAPI MCP server with environment variable authentication
# and disabled Checkov security scanning

set -e

echo "========================================"
echo "AWS CCAPI MCP Server Setup for Gemini CLI"
echo "========================================"
echo ""

# Check if .gemini-settings.json already exists
if [ -f ".gemini-settings.json" ]; then
    echo "⚠️  .gemini-settings.json already exists!"
    read -p "Do you want to merge AWS CCAPI configuration into it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. You can manually add the configuration from .gemini-settings.aws-ccapi.json"
        exit 0
    fi
    MERGE_MODE=true
else
    MERGE_MODE=false
fi

# Get AWS credentials
echo "Please provide your AWS credentials:"
echo "(Press Enter to skip if already set in environment)"
echo ""

read -p "AWS Access Key ID [$AWS_ACCESS_KEY_ID]: " input_key_id
AWS_ACCESS_KEY_ID="${input_key_id:-$AWS_ACCESS_KEY_ID}"

if [ -z "$AWS_ACCESS_KEY_ID" ]; then
    echo "❌ AWS_ACCESS_KEY_ID is required"
    exit 1
fi

read -sp "AWS Secret Access Key: " input_secret_key
echo ""
AWS_SECRET_ACCESS_KEY="${input_secret_key:-$AWS_SECRET_ACCESS_KEY}"

if [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ AWS_SECRET_ACCESS_KEY is required"
    exit 1
fi

read -p "AWS Region [us-east-1]: " input_region
AWS_REGION="${input_region:-us-east-1}"

echo ""
echo "Configuration:"
echo "  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID:0:8}..."
echo "  AWS_REGION: $AWS_REGION"
echo "  SECURITY_SCANNING: disabled"
echo ""

# Ask about XAI key
read -p "Do you want to configure xAI Grok 4 Fast Reasoning? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "xAI API Key [$XAI_API_KEY]: " input_xai_key
    XAI_API_KEY="${input_xai_key:-$XAI_API_KEY}"
    USE_XAI=true
else
    USE_XAI=false
fi

# Create or update configuration
if [ "$MERGE_MODE" = false ]; then
    # Create new configuration
    cat > .gemini-settings.json <<EOF
{
  "security": {
    "auth": {
      "selectedType": "${USE_XAI:+xai-api-key}"
    }
  },
  "model": {
    "name": "${USE_XAI:+grok-4-fast-reasoning}"
  },
  "mcpServers": {
    "aws-ccapi": {
      "command": "uvx",
      "args": ["awslabs.ccapi-mcp-server@latest"],
      "env": {
        "AWS_REGION": "$AWS_REGION",
        "SECURITY_SCANNING": "disabled"
      },
      "description": "AWS Cloud Control API server for managing AWS resources",
      "trust": true
    }
  }
}
EOF
    echo "✅ Created .gemini-settings.json"
else
    echo "⚠️  Merge mode not implemented yet. Please manually add from .gemini-settings.aws-ccapi.json"
fi

# Create .env file for credentials
cat > .env <<EOF
# AWS Credentials for CCAPI MCP Server
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_REGION=$AWS_REGION
EOF

if [ "$USE_XAI" = true ] && [ -n "$XAI_API_KEY" ]; then
    cat >> .env <<EOF

# xAI API Key for Grok 4 Fast Reasoning
XAI_API_KEY=$XAI_API_KEY
EOF
fi

echo "✅ Created .env file with credentials"

# Add .env to .gitignore if it exists
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.env$" .gitignore; then
        echo ".env" >> .gitignore
        echo "✅ Added .env to .gitignore"
    fi
else
    echo ".env" > .gitignore
    echo "✅ Created .gitignore with .env"
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Load environment variables: source .env"
echo "2. Verify AWS credentials: aws sts get-caller-identity"
if [ "$USE_XAI" = true ]; then
    echo "3. Run Gemini CLI with Grok: gemini --model grok-4-fast-reasoning"
else
    echo "3. Run Gemini CLI: gemini"
fi
echo ""
echo "Example commands:"
echo "  gemini 'List all my EC2 instances'"
echo "  gemini 'Create an S3 bucket called my-test-bucket'"
echo "  gemini 'Show me the schema for AWS::Lambda::Function'"
echo ""
echo "⚠️  Security Note: Checkov scanning is DISABLED"
echo "    Use with caution and review all generated infrastructure code"
echo ""
