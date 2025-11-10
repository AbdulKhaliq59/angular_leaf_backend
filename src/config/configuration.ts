export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/angular-leaf-api',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 1000,
    useMock: process.env.USE_MOCK_AI === 'true' || !process.env.OPENAI_API_KEY,
  },
  ml: {
    apiUrl: process.env.ML_API_URL || 'http://localhost:5000',
    timeout: parseInt(process.env.ML_API_TIMEOUT, 10) || 30000,
    maxRetries: parseInt(process.env.ML_API_MAX_RETRIES, 10) || 3,
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 16 * 1024 * 1024, // 16MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
    ],
    tempDir: process.env.TEMP_UPLOAD_DIR || './temp-uploads',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
});