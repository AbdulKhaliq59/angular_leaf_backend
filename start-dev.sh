#!/bin/bash

# Start script for development
echo "🚀 Starting Angular Leaf Classification API in development mode..."

# Check if Python ML API is running
echo "📡 Checking ML API connection..."
if curl -f http://localhost:5000/health &> /dev/null; then
    echo "✅ ML API is running"
else
    echo "⚠️  ML API is not running. Starting ML API first..."
    cd ../model/image_classification
    python api_server.py &
    cd ../../nestjs-api
    echo "⏳ Waiting for ML API to start..."
    sleep 5
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create upload directory
mkdir -p temp-uploads

# Start the NestJS API
echo "🌟 Starting NestJS API..."
npm run start:dev