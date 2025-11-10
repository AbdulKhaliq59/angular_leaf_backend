#!/bin/bash

# Test script for the recommendations API
# Make sure the API is running on http://localhost:3000

echo "🧪 Testing Angular Leaf API with Recommendations"
echo "=================================================="

API_BASE="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "\n${YELLOW}Testing: $description${NC}"
    echo "Method: $method"
    echo "Endpoint: $API_BASE$endpoint"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE$endpoint")
    else
        response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method "$API_BASE$endpoint")
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
}

# Wait for API to be ready
echo "Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s "$API_BASE/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ API not responding after 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

# Test health endpoint
test_endpoint "GET" "/health" "" "Overall health check"

# Test recommendations health
test_endpoint "GET" "/recommendations/health" "" "Recommendations service health"

# Test recommendation generation
recommendation_data='{
  "classification": "angular_leaf_spot",
  "confidence": 0.95,
  "sessionId": "test-session-123",
  "additionalContext": "Plant showing brown spots on leaves, grown indoors under LED lights, watered 2 days ago"
}'

test_endpoint "POST" "/recommendations/generate" "$recommendation_data" "Generate AI recommendation"

# Test getting recommendations
test_endpoint "GET" "/recommendations?limit=5" "" "Get recent recommendations"

# Test analytics
test_endpoint "GET" "/recommendations/analytics" "" "Get recommendations analytics"

echo -e "\n${YELLOW}🎯 Testing Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Set up your OpenAI API key in .env file"
echo "2. Start MongoDB (if not running): mongod"
echo "3. Test the combined image classification + recommendations endpoint:"
echo "   curl -X POST -F 'image=@path/to/your/image.jpg' \\"
echo "        -F 'additionalContext=Test context' \\"
echo "        http://localhost:3000/classify/image/with-recommendations"
echo ""
echo "📚 Documentation: See RECOMMENDATIONS.md for detailed usage"