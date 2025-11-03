import { ApiProperty } from '@nestjs/swagger';

export class PredictionResultDto {
  @ApiProperty({
    description: 'Predicted class for the image',
    example: 'angular_leaf_spot',
    enum: ['angular_leaf_spot', 'healthy'],
  })
  predicted_class: string;

  @ApiProperty({
    description: 'Confidence level of the prediction (0-1)',
    example: 0.95,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;

  @ApiProperty({
    description: 'All class probabilities',
    example: {
      angular_leaf_spot: 0.95,
      healthy: 0.05,
    },
  })
  probabilities: Record<string, number>;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 1250,
  })
  processing_time_ms: number;

  @ApiProperty({
    description: 'Model version used for prediction',
    example: '1.0.0',
  })
  model_version: string;

  @ApiProperty({
    description: 'Timestamp of the prediction',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

export class ClassificationResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Prediction results',
    type: PredictionResultDto,
  })
  data: PredictionResultDto;

  @ApiProperty({
    description: 'Optional message',
    example: 'Image classified successfully',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

export class BatchPredictionResultDto {
  @ApiProperty({
    description: 'Original filename',
    example: 'leaf1.jpg',
  })
  filename: string;

  @ApiProperty({
    description: 'Prediction result for this image',
    type: PredictionResultDto,
  })
  result: PredictionResultDto;

  @ApiProperty({
    description: 'Any error that occurred processing this image',
    required: false,
  })
  error?: string;
}

export class BatchClassificationResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Batch prediction results',
    type: [BatchPredictionResultDto],
  })
  data: BatchPredictionResultDto[];

  @ApiProperty({
    description: 'Summary of the batch processing',
    example: {
      total: 5,
      successful: 4,
      failed: 1,
    },
  })
  summary: {
    total: number;
    successful: number;
    failed: number;
  };

  @ApiProperty({
    description: 'Request timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}