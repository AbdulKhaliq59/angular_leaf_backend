import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import * as FormData from 'form-data';

export interface MlPredictionResult {
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  processing_time_ms: number;
  model_version: string;
  timestamp: string;
}

// Python API response format
export interface PythonApiResponse {
  success: boolean;
  prediction?: {
    confidence: number;
    file_size: number;
    filename: string;
    health_status: string;
    interpretation: string;
    result: string;
    status: string;
    threshold: number;
  };
  error?: string;
  message?: string;
}

export interface MlApiResponse {
  success: boolean;
  result?: MlPredictionResult;
  error?: string;
  message?: string;
}

@Injectable()
export class MlModelService {
  private readonly logger = new Logger(MlModelService.name);
  private readonly mlApiUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.mlApiUrl = this.configService.get<string>('ml.apiUrl');
    this.timeout = this.configService.get<number>('ml.timeout');
    this.maxRetries = this.configService.get<number>('ml.maxRetries');
  }

  /**
   * Classify a single image using the ML API
   */
  async classifyImage(
    imagePath: string,
    metadata?: string,
  ): Promise<MlPredictionResult> {
    const startTime = Date.now();
    
    try {
      this.logger.log(`Starting image classification for: ${imagePath}`);
      
      // Create form data
      const formData = new FormData();
      const imageStream = createReadStream(imagePath);
      formData.append('image', imageStream);
      
      if (metadata) {
        formData.append('metadata', metadata);
      }

      // Make request to ML API with retry logic
      const result = await this.makeRequestWithRetry(
        '/predict',
        formData,
        this.maxRetries,
      );

      // Clean up temporary file
      await this.cleanupFile(imagePath);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Image classification completed in ${processingTime}ms for: ${imagePath}`,
      );

      // Update the processing time in the result
      result.processing_time_ms = processingTime;

      return result;
    } catch (error) {
      // Ensure cleanup even on error
      await this.cleanupFile(imagePath);
      
      this.logger.error(
        `Error classifying image ${imagePath}: ${error.message}`,
        error.stack,
      );
      
      throw new HttpException(
        {
          message: 'Failed to classify image',
          details: error.message,
          imagePath,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Classify multiple images in batch
   */
  async classifyImagesBatch(
    imagePaths: string[],
    metadata?: string,
  ): Promise<Array<{ filename: string; result?: MlPredictionResult; error?: string }>> {
    this.logger.log(`Starting batch classification for ${imagePaths.length} images`);
    
    const results = await Promise.allSettled(
      imagePaths.map(async (imagePath, index) => {
        try {
          const result = await this.classifyImage(imagePath, metadata);
          return {
            filename: `image_${index + 1}`,
            result,
          };
        } catch (error) {
          return {
            filename: `image_${index + 1}`,
            error: error.message,
          };
        }
      }),
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          filename: `image_${index + 1}`,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });
  }

  /**
   * Check if ML API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.mlApiUrl}/`, {
          timeout: 5000,
        }),
      );
      
      return response.status === 200;
    } catch (error) {
      this.logger.warn(`ML API health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get ML API status and information
   */
  async getApiInfo(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.mlApiUrl}/model/info`, {
          timeout: 5000,
        }),
      );
      
      return response.data;
    } catch (error) {
      this.logger.warn(`Failed to get ML API info: ${error.message}`);
      throw new HttpException(
        'ML API is not accessible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequestWithRetry(
    endpoint: string,
    formData: FormData,
    retries: number,
  ): Promise<MlPredictionResult> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.mlApiUrl}${endpoint}`, formData, {
            headers: {
              ...formData.getHeaders(),
            },
            timeout: this.timeout,
            maxRedirects: 0,
          }),
        );

        if (response.data.success && response.data.prediction) {
          return this.transformPythonResponse(response.data);
        } else {
          throw new Error(response.data.error || 'Invalid response from ML API');
        }
      } catch (error) {
        this.logger.warn(
          `ML API request attempt ${attempt}/${retries} failed: ${error.message}`,
        );

        if (attempt === retries) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Transform Python API response to our standard format
   */
  private transformPythonResponse(pythonResponse: PythonApiResponse): MlPredictionResult {
    const prediction = pythonResponse.prediction;
    
    // Map status to our class names
    const predicted_class = prediction.status === 'healthy' ? 'healthy' : 'angular_leaf_spot';
    
    // Create probabilities object
    const probabilities: Record<string, number> = {
      healthy: prediction.status === 'healthy' ? prediction.confidence : 1 - prediction.confidence,
      angular_leaf_spot: prediction.status === 'unhealthy' ? prediction.confidence : 1 - prediction.confidence,
    };

    return {
      predicted_class,
      confidence: prediction.confidence,
      probabilities,
      processing_time_ms: 0, // Python API doesn't provide this, we could measure it ourselves
      model_version: '1.0.0', // Static for now
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clean up temporary files
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      this.logger.debug(`Cleaned up temporary file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup file ${filePath}: ${error.message}`);
    }
  }
}