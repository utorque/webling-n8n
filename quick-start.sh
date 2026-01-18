#!/bin/bash

# Webling n8n Node - Quick Start Script

echo "============================================"
echo "  Webling n8n Node - Quick Start"
echo "============================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the n8n-nodes-webling directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo ""
echo "🔨 Building the node..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "============================================"
echo "  Next Steps:"
echo "============================================"
echo ""
echo "Option 1 - Link to local n8n:"
echo "  cd ~/.n8n/custom"
echo "  npm link $(pwd)"
echo "  n8n start"
echo ""
echo "Option 2 - Install in n8n custom folder:"
echo "  cp -r dist ~/.n8n/custom/n8n-nodes-webling"
echo "  n8n start"
echo ""
echo "Option 3 - Docker volume mount:"
echo "  Add this to docker-compose.yml volumes:"
echo "  - $(pwd)/dist:/home/node/.n8n/custom/node_modules/n8n-nodes-webling"
echo ""
echo "============================================"
echo ""
echo "📖 Read README.md for detailed documentation"
echo "🔧 Read DEVELOPMENT.md for extending the node"
echo "💡 Check EXAMPLES.md for workflow examples"
echo ""
