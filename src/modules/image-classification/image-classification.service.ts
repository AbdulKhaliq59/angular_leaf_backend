import { Injectable, Logger, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';

import { MlModelService, MlPredictionResult } from './ml-model.service';
import { PredictionResultDto, BatchPredictionResultDto } from './dto/response.dto';

@Injectable()
export class ImageClassificationService {
  private readonly logger = new Logger(ImageClassificationService.name);
  private readonly allowedMimeTypes: string[];
  private readonly maxFileSize: number;

  constructor(
    private readonly mlModelService: MlModelService,
    private readonly configService: ConfigService,
  ) {
    this.allowedMimeTypes = this.configService.get<string[]>('upload.allowedMimeTypes');
    this.maxFileSize = this.configService.get<number>('upload.maxFileSize');
  }

  /**
   * Classify a single image
   */
  async classifyImage(
    file: Express.Multer.File,
    metadata?: string,
  ): Promise<PredictionResultDto> {
    this.logger.log(`Processing image classification for: ${file.originalname}`);
    
    // Validate file
    this.validateFile(file);

    try {
      // Call ML service
      const result = await this.mlModelService.classifyImage(file.path, metadata);
      
      // Transform result
      return this.transformPredictionResult(result);
    } catch (error) {
      this.logger.error(
        `Failed to classify image ${file.originalname}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Classify multiple images in batch
   */
  async classifyImagesBatch(
    files: Express.Multer.File[],
    metadata?: string,
  ): Promise<{
    results: BatchPredictionResultDto[];
    summary: { total: number; successful: number; failed: number };
  }> {
    this.logger.log(`Processing batch classification for ${files.length} images`);

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided for batch processing');
    }

    // Validate all files first
    files.forEach(file => this.validateFile(file));

    try {
      // Get file paths
      const filePaths = files.map(file => file.path);
      
      // Call ML service for batch processing
      const mlResults = await this.mlModelService.classifyImagesBatch(filePaths, metadata);
      
      // Transform results
      const results: BatchPredictionResultDto[] = mlResults.map((mlResult, index) => ({
        filename: files[index].originalname,
        result: mlResult.result ? this.transformPredictionResult(mlResult.result) : undefined,
        error: mlResult.error,
      }));

      // Calculate summary
      const successful = results.filter(r => r.result && !r.error).length;
      const failed = results.length - successful;

      const summary = {
        total: results.length,
        successful,
        failed,
      };

      this.logger.log(
        `Batch processing completed: ${successful}/${results.length} successful`,
      );

      return { results, summary };
    } catch (error) {
      this.logger.error(
        `Failed to process batch classification: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get classification statistics
   */
  async getClassificationStats(): Promise<any> {
    try {
      return await this.mlModelService.getApiInfo();
    } catch (error) {
      throw new HttpException(
        'Unable to retrieve classification statistics',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Check if the ML service is healthy
   */
  async checkHealth(): Promise<{ status: string; mlApi: boolean }> {
    const mlApiHealthy = await this.mlModelService.healthCheck();
    
    return {
      status: mlApiHealthy ? 'healthy' : 'degraded',
      mlApi: mlApiHealthy,
    };
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${Math.round(this.maxFileSize / 1024 / 1024)}MB`,
      );
    }

    // Additional validation: check if file exists
    if (!file.path) {
      throw new BadRequestException('File upload failed');
    }
  }

  /**
   * Transform ML prediction result to DTO
   */
  private transformPredictionResult(mlResult: MlPredictionResult): PredictionResultDto {
    return {
      predicted_class: mlResult.predicted_class,
      confidence: mlResult.confidence,
      probabilities: mlResult.probabilities,
      processing_time_ms: mlResult.processing_time_ms,
      model_version: mlResult.model_version,
      timestamp: mlResult.timestamp,
    };
  }

  /**
   * Clean up temporary files (utility method)
   */
  async cleanupTempFiles(directory: string): Promise<void> {
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          this.logger.debug(`Cleaned up old temp file: ${filePath}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp files: ${error.message}`);
    }
  }
}