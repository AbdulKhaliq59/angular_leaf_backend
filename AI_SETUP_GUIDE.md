# AI Recommendations Setup Guide

## Overview

The Angular Leaf API supports AI-powered plant disease recommendations through multiple approaches, from completely free to production-ready solutions.

## Option 1: Free Mock AI Service (Recommended for Development)

**Cost: FREE** ✅

The mock AI service provides realistic, pre-programmed recommendations without any external API calls.

### Setup:
1. No API keys required
2. No external services needed
3. Works offline

### Configuration:
```bash
# In your .env file
USE_MOCK_AI=true
# Leave OPENAI_API_KEY empty
```

### Features:
- Instant responses (1-3 second simulated delay)
- Realistic recommendations for both healthy plants and angular leaf spot
- Professional treatment steps and prevention measures
- Perfect for development, testing, and demos

---

## Option 2: OpenAI API (Production Ready)

**Cost: Paid** 💳

Uses real OpenAI GPT models for dynamic, contextual recommendations.

### Setup:
1. Create an OpenAI account at [platform.openai.com](https://platform.openai.com)
2. Add billing information (required even for GPT-3.5-turbo)
3. Generate an API key
4. Add credits to your account ($5 minimum)

### Configuration:
```bash
# In your .env file
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo  # Cheaper than GPT-4
USE_MOCK_AI=false
```

### Cost Estimates:
- **GPT-3.5-turbo**: ~$0.001-0.002 per recommendation
- **GPT-4**: ~$0.03-0.06 per recommendation
- 1000 recommendations ≈ $1-2 with GPT-3.5-turbo

---

## Option 3: Local AI Models (Advanced)

**Cost: FREE (after setup)** ✅

Run AI models locally using Ollama or similar tools.

### Setup:
1. Install [Ollama](https://ollama.ai/)
2. Download a model: `ollama pull llama2`
3. Modify the code to use local API endpoints

### Benefits:
- No API costs
- Complete privacy
- No internet required
- Full control

### Drawbacks:
- Requires powerful hardware
- More complex setup
- Model management needed

---

## Quick Start (Free Option)

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd nestjs-api
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and set USE_MOCK_AI=true
   ```

3. **Start MongoDB (optional for full functionality):**
   ```bash
   # Option A: Docker
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   
   # Option B: Local installation
   sudo systemctl start mongod
   ```

4. **Start the application:**
   ```bash
   pnpm run start:dev
   ```

5. **Test the API:**
   ```bash
   curl -X POST http://localhost:3000/recommendations/generate \
     -H "Content-Type: application/json" \
     -d '{
       "classification": "angular_leaf_spot",
       "confidence": 0.85,
       "sessionId": "test_session_123"
     }'
   ```

---

## API Endpoints

### Generate Recommendation
```http
POST /recommendations/generate
Content-Type: application/json

{
  "classification": "angular_leaf_spot",
  "confidence": 0.85,
  "sessionId": "unique_session_id",
  "additionalContext": "Plant is in greenhouse, recently watered"
}
```

### Get Recommendations
```http
GET /recommendations?sessionId=unique_session_id&limit=10
```

### Submit Feedback
```http
PATCH /recommendations/{id}/feedback
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Very helpful recommendations!"
}
```

### Classify Image with Recommendations
```http
POST /image-classification/classify-with-recommendations
Content-Type: multipart/form-data

file: [image file]
additionalContext: "Optional context about the plant"
```

---

## Switching Between Services

The application automatically detects which AI service to use:

1. **Mock Service**: Used when `USE_MOCK_AI=true` or `OPENAI_API_KEY` is empty
2. **OpenAI Service**: Used when `OPENAI_API_KEY` is provided and `USE_MOCK_AI=false`

You can switch at any time by updating your environment variables and restarting the application.

---

## Database Requirements

- **Recommendations storage**: Requires MongoDB
- **Basic functionality**: Works without MongoDB (recommendations won't be saved)

### MongoDB Setup Options:

1. **Docker (Easiest)**:
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

2. **Local Installation**:
   ```bash
   # Ubuntu/Debian
   sudo apt install mongodb
   sudo systemctl start mongod
   
   # macOS
   brew install mongodb/brew/mongodb-community
   brew services start mongodb/brew/mongodb-community
   ```

3. **MongoDB Atlas (Cloud)**:
   - Create free account at mongodb.com
   - Get connection string
   - Update `MONGODB_URI` in .env

---

## Troubleshooting

### OpenAI Error: "Model does not exist"
- Switch to `gpt-3.5-turbo` in your .env file
- Ensure your OpenAI account has billing set up
- Check if your API key has the correct permissions

### MongoDB Connection Error
- Ensure MongoDB is running: `docker ps` or `systemctl status mongod`
- Check connection string in .env file
- For development, you can disable database features temporarily

### Mock Service Not Working
- Ensure `USE_MOCK_AI=true` in your .env file
- Restart the application after changing environment variables
- Check logs for any startup errors

---

## Production Deployment

For production deployment:

1. Use OpenAI API for best results
2. Set up MongoDB Atlas or managed MongoDB
3. Configure proper environment variables
4. Set up monitoring and logging
5. Consider rate limiting and caching

### Example Production .env:
```bash
NODE_ENV=production
OPENAI_API_KEY=sk-prod-key-here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/angular-leaf-prod
USE_MOCK_AI=false
```