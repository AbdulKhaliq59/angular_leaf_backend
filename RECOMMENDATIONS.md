# AI-Powered Plant Disease Recommendations

## Overview

The recommendations system provides comprehensive, AI-powered treatment and prevention recommendations based on plant disease classification results. It uses OpenAI's GPT-4 model to generate evidence-based recommendations that include immediate actions, step-by-step treatment plans, and prevention measures.

## Features

### Core Functionality
- **AI-Generated Recommendations**: Uses OpenAI GPT-4 to generate comprehensive treatment recommendations
- **MongoDB Integration**: Stores recommendations for tracking and analytics
- **Session Management**: Links classifications to recommendations for better user experience
- **User Feedback**: Collects user ratings and feedback to improve recommendations quality
- **Analytics**: Provides insights into recommendation effectiveness and usage patterns

### Professional Architecture
- **Modular Design**: Follows NestJS best practices with separate modules, services, and controllers
- **Type Safety**: Comprehensive DTOs with validation and Swagger documentation
- **Error Handling**: Professional error handling with appropriate HTTP status codes
- **Health Checks**: Monitors OpenAI service and database connectivity
- **Rate Limiting**: Protects against abuse while ensuring service availability

## API Endpoints

### Generate Recommendations
```http
POST /recommendations/generate
Content-Type: application/json

{
  "classification": "angular_leaf_spot",
  "confidence": 0.95,
  "sessionId": "sess_123456789",
  "additionalContext": "Plant is in greenhouse, 2 years old, recently watered"
}
```

### Classify Image with Recommendations (Combined Endpoint)
```http
POST /classify/image/with-recommendations
Content-Type: multipart/form-data

{
  "image": <file>,
  "metadata": "Optional image metadata",
  "additionalContext": "Additional context about plant condition"
}
```

### Get Recommendations
```http
GET /recommendations?sessionId=sess_123456789&limit=10&skip=0
```

### Submit Feedback
```http
PATCH /recommendations/{id}/feedback
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Very helpful recommendations, treatment was successful"
}
```

### Analytics
```http
GET /recommendations/analytics
```

## Recommendation Structure

Each recommendation includes:

### Disease Information
- Disease name and classification confidence
- Severity assessment (mild, moderate, severe)
- Source reliability score

### Immediate Actions
- List of urgent steps to take immediately
- Priority-ordered actions to prevent spread

### Treatment Steps
- Step-by-step treatment protocol
- Required materials and tools
- Duration estimates and safety precautions
- Detailed descriptions for each step

### Prevention Measures
- Categorized prevention strategies
- Frequency and priority levels
- Long-term management recommendations

### Recovery Information
- Estimated recovery timeline
- Monitoring guidelines
- Additional notes and considerations

## Configuration

### Environment Variables

```bash
# MongoDB (required)
MONGODB_URI=mongodb://localhost:27017/angular-leaf-api

# OpenAI (required)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
```

### MongoDB Setup

1. Install MongoDB:
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS with Homebrew
brew install mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

2. Create database (automatically created on first connection)

### OpenAI Setup

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to environment variables
3. Ensure sufficient API credits for usage

## Usage Examples

### Basic Classification with Recommendations

```typescript
// Upload image and get both classification and recommendations
const formData = new FormData();
formData.append('image', imageFile);
formData.append('additionalContext', 'Plant showing yellowing leaves, indoor growing');

const response = await fetch('/classify/image/with-recommendations', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Classification:', result.data.classification);
console.log('Recommendations:', result.data.recommendation);
console.log('Session ID:', result.data.sessionId);
```

### Generate Recommendations from Existing Classification

```typescript
const response = await fetch('/recommendations/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    classification: 'angular_leaf_spot',
    confidence: 0.92,
    sessionId: 'user-session-123',
    additionalContext: 'Greenhouse environment, high humidity'
  })
});

const recommendation = await response.json();
```

### Submit User Feedback

```typescript
const response = await fetch(`/recommendations/${recommendationId}/feedback`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rating: 5,
    feedback: 'Followed treatment plan, plant recovered in 3 weeks'
  })
});
```

## Data Models

### Recommendation Schema

```typescript
interface RecommendationContent {
  disease: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  immediateActions: string[];
  treatmentSteps: TreatmentStep[];
  preventionMeasures: PreventionMeasure[];
  additionalNotes: string;
  sourceReliability: number;
  estimatedRecoveryTime: string;
}

interface TreatmentStep {
  step: number;
  action: string;
  description: string;
  materials?: string[];
  duration?: string;
  precautions?: string[];
}

interface PreventionMeasure {
  category: string;
  measure: string;
  description: string;
  frequency: string;
  priority: 'high' | 'medium' | 'low';
}
```

## Monitoring and Analytics

### Health Checks
- Database connectivity monitoring
- OpenAI service availability checking
- Integrated with main application health endpoint

### Analytics Data
- Total recommendations generated
- Classification type distribution
- Average user ratings
- Severity distribution
- Success rates and trends

### Logging
- Comprehensive request/response logging
- Error tracking with stack traces
- Performance monitoring
- User feedback tracking

## Security Considerations

### API Security
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure MongoDB connection
- OpenAI API key protection

### Data Privacy
- No personal information stored
- Session IDs for tracking (anonymized)
- User feedback optional and anonymized
- Configurable data retention policies

## Error Handling

### Common Error Scenarios
- **OpenAI API Failures**: Graceful degradation with error messages
- **Database Connection Issues**: Health checks and retry logic
- **Invalid Classifications**: Validation and error responses
- **Rate Limiting**: Clear error messages with retry guidance

### Error Response Format
```json
{
  "success": false,
  "message": "Specific error description",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Performance Considerations

### Optimization Strategies
- Database indexing for fast queries
- Connection pooling for MongoDB
- Response caching for repeated queries
- Efficient OpenAI prompt design

### Scalability
- Horizontal scaling support
- Database sharding capabilities
- Load balancer compatibility
- Microservice architecture ready

## Development and Testing

### Running Locally
```bash
# Install dependencies
pnpm install

# Start MongoDB (if local)
mongod

# Set environment variables
cp .env.example .env
# Edit .env with your OpenAI API key

# Start development server
pnpm run start:dev
```

### Testing Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Test recommendation generation
curl -X POST http://localhost:3000/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{"classification":"angular_leaf_spot","confidence":0.9,"sessionId":"test-123"}'
```

## Integration Examples

### Frontend Integration
```javascript
// React/Angular example
const classifyWithRecommendations = async (imageFile, context) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('additionalContext', context);

  try {
    const response = await api.post('/classify/image/with-recommendations', formData);
    return response.data;
  } catch (error) {
    console.error('Classification failed:', error);
    throw error;
  }
};
```

### Backend Integration
```typescript
// Service integration
@Injectable()
export class PlantDiseaseService {
  constructor(private httpService: HttpService) {}

  async getRecommendations(classification: string, confidence: number) {
    const response = await this.httpService.post('/recommendations/generate', {
      classification,
      confidence,
      sessionId: uuidv4(),
    });
    return response.data;
  }
}
```

## Troubleshooting

### Common Issues
1. **OpenAI API Key Not Working**: Verify key is correct and has credits
2. **MongoDB Connection Fails**: Check connection string and MongoDB status
3. **Slow Response Times**: Monitor OpenAI API latency and database performance
4. **Rate Limiting**: Implement request queuing or user limits

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug pnpm run start:dev
```

### Health Check Diagnostics
```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:3000/recommendations/health
```