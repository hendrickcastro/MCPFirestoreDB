#!/bin/bash

# MCP FirestoreDB - Installation and Build Script

echo "🔥 MCP FirestoreDB - Installation and Build"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed, but build is complete"
else
    echo "✅ All tests passed"
fi

echo ""
echo "🎉 MCP FirestoreDB is ready to use!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your Firestore credentials"
echo "2. Configure your MCP client using the example config files"
echo "3. Start using the MCP server with: npm start"
echo ""