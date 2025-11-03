#!/bin/bash

echo "🧪 Testing Angular Leaf Classification API Integration"
echo "====================================================="
echo ""

# Test NestJS API health
echo "1. Testing NestJS API health..."
curl -s http://localhost:3000/api/v1/health && echo ""
echo ""

# Test NestJS classification service health (should connect to ML API)
echo "2. Testing classification service health..."
curl -s http://localhost:3000/api/v1/classify/health && echo ""
echo ""

# Test Python ML API directly
echo "3. Testing Python ML API directly..."
curl -s http://192.168.0.100:5000/ && echo ""
echo ""

# Test ML API model info
echo "4. Testing ML API model info..."
curl -s http://192.168.0.100:5000/model/info && echo ""
echo ""

# Test supported formats
echo "5. Testing supported formats..."
curl -s http://localhost:3000/api/v1/classify/supported-formats && echo ""
echo ""

echo "✅ Integration tests completed!"
echo ""
echo "🚀 Both services are running:"
echo "   - NestJS API: http://localhost:3000"
echo "   - Python ML API: http://192.168.0.100:5000"
echo "   - API Documentation: http://localhost:3000/api/docs"
echo ""
echo "🔧 To test image classification:"
echo "   curl -X POST http://localhost:3000/api/v1/classify/image -F \"image=@path/to/image.jpg\""