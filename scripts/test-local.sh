#!/bin/bash

# Quick local testing script for FULCRUM

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         FULCRUM Local Testing Script                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "→ Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required (found: $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "→ Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Build the project
echo "→ Building project..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    npm run build
    exit 1
fi
echo ""

# Check for environment variables
echo "→ Checking environment configuration..."
HAS_XAI=false
HAS_AWS=false

if [ -n "$XAI_API_KEY" ]; then
    echo "✅ XAI_API_KEY is set"
    HAS_XAI=true
else
    echo "⚠️  XAI_API_KEY not set (xAI Grok won't work)"
fi

if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "✅ AWS credentials are set"
    HAS_AWS=true
else
    echo "⚠️  AWS credentials not set (AWS CCAPI won't work)"
fi

if [ ! -f ".gemini-settings.json" ]; then
    echo "⚠️  .gemini-settings.json not found"
else
    echo "✅ .gemini-settings.json exists"
fi

echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         Ready to Test                                    ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "FULCRUM is ready to run!"
echo ""
echo "Features available:"
echo "  ✅ FULCRUM branding (always available)"
if [ "$HAS_XAI" = true ]; then
    echo "  ✅ xAI Grok 4 Fast Reasoning"
else
    echo "  ⚠️  xAI Grok (set XAI_API_KEY to enable)"
fi
if [ "$HAS_AWS" = true ]; then
    echo "  ✅ AWS CCAPI MCP Server"
else
    echo "  ⚠️  AWS CCAPI (set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY to enable)"
fi
echo ""
echo "Starting FULCRUM..."
echo "→ Look for the FULCRUM ASCII logo!"
echo "→ Try commands like '/about', '/help', or just ask a question"
echo "→ Press Ctrl+C to exit"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""

# Start the application
npm start
