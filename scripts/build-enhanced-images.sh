#!/bin/bash
set -e

echo "🚀 Building Armstrong AI Enhanced Docker Images..."

# Controlla se Docker è disponibile
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Build enhanced Python
echo "📦 Building Python Enhanced..."
docker build -f lib/docker/containers/Dockerfile.python-enhanced \
    -t armstrong/python-enhanced:latest . || {
    echo "❌ Failed to build Python enhanced image"
    exit 1
}

# Build enhanced Node.js
echo "📦 Building Node.js Enhanced..."
docker build -f lib/docker/containers/Dockerfile.node-enhanced \
    -t armstrong/node-enhanced:latest . || {
    echo "❌ Failed to build Node.js enhanced image"
    exit 1
}

echo "✅ Enhanced images built successfully!"
echo ""
echo "📋 Available Armstrong images:"
docker images | grep armstrong || echo "No Armstrong images found"

echo ""
echo "🧪 Test the enhanced images:"
echo "docker run --rm armstrong/python-enhanced:latest python3 -c \"import numpy; print('Python Enhanced Ready with NumPy:', numpy.__version__)\""
echo "docker run --rm armstrong/node-enhanced:latest node -e \"const lodash = require('lodash'); console.log('Node Enhanced Ready with Lodash:', lodash.VERSION)\""
