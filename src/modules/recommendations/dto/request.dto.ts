import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GenerateRecommendationDto {
  @ApiProperty({
    description: 'Disease classification result',
    example: 'angular_leaf_spot',
  })
  @IsString()
  classification: string;

  @ApiProperty({
    description: 'Classification confidence score (0-1)',
    example: 0.95,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;

  @ApiProperty({
    description: 'Session identifier for tracking',
    example: 'sess_123456789',
  })
  @IsString()
  sessionId: string;

  @ApiProperty({
    description: 'Additional context about the plant or situation',
    example: 'Plant is in greenhouse, 2 years old, recently watered',
    required: false,
  })
  @IsOptional()
  @IsString()
  additionalContext?: string;
}

export class FeedbackDto {
  @ApiProperty({
    description: 'Recommendation ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  recommendationId: string;

  @ApiProperty({
    description: 'User rating (1-5 stars)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Optional feedback text',
    example: 'Very helpful recommendations, followed the treatment plan successfully',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class GetRecommendationsDto {
  @ApiProperty({
    description: 'Session ID to filter recommendations',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({
    description: 'Classification type to filter by',
    required: false,
  })
  @IsOptional()
  @IsString()
  classification?: string;

  @ApiProperty({
    description: 'Number of recommendations to return',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Number of recommendations to skip',
    example: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  skip?: number;
}