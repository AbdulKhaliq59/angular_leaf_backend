# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Python ML API running on port 5000
- Git (for cloning)

## 1. Installation

```bash
cd /home/khaliq-ubuntu/Documents/Projects/angular-leaf/nestjs-api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Create upload directory
mkdir -p temp-uploads
```

## 2. Start ML API (Required)

```bash
cd ../model/image_classification
python api_server.py
```

## 3. Start NestJS API

### Option A: Quick Start (Recommended)
```bash
./start-dev.sh
```

### Option B: Manual Start
```bash
npm run start:dev
```

## 4. Test the API

```bash
# Test endpoints
./examples/test-api.sh

# Or test manually
curl http://localhost:3000/api/v1/health
```

## 5. View Documentation

Visit: http://localhost:3000/api/docs

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual image
docker build -t angular-leaf-api .
docker run -p 3000:3000 angular-leaf-api
```

## ⚡ Testing Image Classification

```bash
# Test with an image file
curl -X POST http://localhost:3000/api/v1/classify/image \
  -F "image=@path/to/leaf-image.jpg"
```

## 📊 API Endpoints

- **Health**: `GET /api/v1/health`
- **Classify**: `POST /api/v1/classify/image`
- **Batch**: `POST /api/v1/classify/batch`
- **Docs**: `/api/docs`

## 🔧 Configuration

Edit `.env` file to customize:
- ML_API_URL (default: http://localhost:5000)
- PORT (default: 3000)
- File upload limits
- Rate limiting

## 🆘 Troubleshooting

1. **ML API not found**: Ensure Python API is running on port 5000
2. **File upload errors**: Check temp-uploads directory permissions
3. **CORS issues**: Update CORS_ORIGIN in .env

For detailed documentation, see README.md