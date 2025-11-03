# Angular Leaf Classification NestJS API

A professional, scalable, maintainable, and testable NestJS API for Angular Leaf Spot Detection using Machine Learning.

## 🚀 Features

- **Image Classification**: Single and batch image classification for angular leaf spot detection
- **File Upload**: Secure file upload with validation and size limits
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Health Checks**: Comprehensive health monitoring for API and ML service
- **Error Handling**: Global exception filters with detailed error responses
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit and integration tests
- **Configuration**: Environment-based configuration management
- **Security**: Helmet for security headers, CORS configuration
- **Logging**: Structured logging with request/response tracking

## 🏗️ Architecture

```
├── src/
│   ├── common/                 # Shared utilities
│   │   ├── filters/           # Global exception filters
│   │   └── interceptors/      # Request/response interceptors
│   ├── config/                # Configuration management
│   ├── modules/
│   │   ├── image-classification/  # Core ML integration module
│   │   │   ├── dto/          # Data transfer objects
│   │   │   ├── *.controller.ts
│   │   │   ├── *.service.ts
│   │   │   └── *.module.ts
│   │   └── health/           # Health check module
│   ├── app.module.ts         # Root application module
│   └── main.ts              # Application bootstrap
├── test/                     # Test files
├── uploads/                 # Temporary file storage
└── docs/                   # Additional documentation
```

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Python Flask API (ML model) running on port 5000

## 🛠️ Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /home/khaliq-ubuntu/Documents/Projects/angular-leaf/nestjs-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Create upload directory:**
   ```bash
   mkdir -p temp-uploads
   ```

5. **Start the Python ML API:**
   ```bash
   cd ../model/image_classification
   python api_server.py
   ```

## 🚀 Quick Start

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📚 API Documentation

Once the application is running, visit:
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:4200` |
| `ML_API_URL` | Python ML API URL | `http://localhost:5000` |
| `ML_API_TIMEOUT` | ML API request timeout (ms) | `30000` |
| `ML_API_MAX_RETRIES` | ML API retry attempts | `3` |
| `MAX_FILE_SIZE` | Maximum file size (bytes) | `16777216` (16MB) |
| `TEMP_UPLOAD_DIR` | Temporary upload directory | `./temp-uploads` |
| `THROTTLE_TTL` | Rate limit window (ms) | `60000` |
| `THROTTLE_LIMIT` | Requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

## 📡 API Endpoints

### Image Classification

#### Single Image Classification
```http
POST /api/v1/classify/image
Content-Type: multipart/form-data

Parameters:
- image: Image file (required)
- metadata: Optional metadata string
```

#### Batch Image Classification
```http
POST /api/v1/classify/batch
Content-Type: multipart/form-data

Parameters:
- images: Array of image files (max 10)
- metadata: Optional metadata string
```

#### Get Classification Stats
```http
GET /api/v1/classify/stats
```

#### Check Service Health
```http
GET /api/v1/classify/health
```

#### Get Supported Formats
```http
GET /api/v1/classify/supported-formats
```

### Health

#### Application Health
```http
GET /api/v1/health
```

## 🧪 Testing Examples

### Using curl

**Single Image Classification:**
```bash
curl -X POST http://localhost:3000/api/v1/classify/image \
  -F "image=@path/to/leaf-image.jpg" \
  -F "metadata=Test sample"
```

**Health Check:**
```bash
curl http://localhost:3000/api/v1/health
```

### Using TypeScript/JavaScript

```typescript
// Single image classification
const formData = new FormData();
formData.append('image', imageFile);
formData.append('metadata', 'Sample metadata');

const response = await fetch('http://localhost:3000/api/v1/classify/image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

## 🔒 Security Features

- **Helmet**: Security headers middleware
- **Rate Limiting**: Configurable request rate limiting
- **File Validation**: MIME type and size validation
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: DTO validation with class-validator
- **Error Sanitization**: Safe error responses without sensitive data

## 📊 Monitoring & Logging

- **Request Logging**: All requests logged with timing and response codes
- **Error Tracking**: Comprehensive error logging with stack traces
- **Health Monitoring**: Multiple health check endpoints
- **Performance Metrics**: Processing time tracking

## 🚀 Deployment

### Docker Deployment (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### PM2 Deployment
```bash
npm install -g pm2
npm run build
pm2 start dist/main.js --name "angular-leaf-api"
```

## 🧰 Development

### Code Style
```bash
npm run lint
npm run format
```

### Adding New Features

1. Create feature module in `src/modules/`
2. Add module to `app.module.ts`
3. Create DTOs for request/response
4. Implement service layer
5. Create controller with OpenAPI documentation
6. Add comprehensive tests
7. Update documentation

## 🤝 Integration with Frontend

### Angular Integration Example

```typescript
// angular service
@Injectable({
  providedIn: 'root'
})
export class ImageClassificationService {
  private readonly apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) {}

  classifyImage(imageFile: File, metadata?: string): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (metadata) {
      formData.append('metadata', metadata);
    }

    return this.http.post(`${this.apiUrl}/classify/image`, formData);
  }

  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/classify/health`);
  }
}
```

## 📈 Performance Considerations

- **File Size Limits**: Configurable upload limits
- **Rate Limiting**: Prevents API abuse
- **Connection Pooling**: HTTP client connection reuse
- **Retry Logic**: Automatic retry for ML API failures
- **Compression**: Response compression enabled
- **Caching**: Consider Redis for production deployments

## 🐛 Troubleshooting

### Common Issues

1. **ML API Connection Failed**
   - Ensure Python Flask API is running on port 5000
   - Check `ML_API_URL` in environment variables

2. **File Upload Errors**
   - Verify `temp-uploads` directory exists and is writable
   - Check file size limits in configuration

3. **Rate Limiting Issues**
   - Adjust `THROTTLE_LIMIT` and `THROTTLE_TTL` as needed

4. **CORS Issues**
   - Update `CORS_ORIGIN` in environment variables

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation
6. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/api/docs`
- Check application logs
- Verify ML API connectivity