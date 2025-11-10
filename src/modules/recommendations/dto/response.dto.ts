import { ApiProperty } from '@nestjs/swagger';

export class TreatmentStepDto {
  @ApiProperty({
    description: 'Step number in the treatment process',
    example: 1,
  })
  step: number;

  @ApiProperty({
    description: 'Action to be taken',
    example: 'Remove affected leaves',
  })
  action: string;

  @ApiProperty({
    description: 'Detailed description of the action',
    example: 'Carefully remove all leaves showing signs of angular leaf spot using sterilized pruning shears',
  })
  description: string;

  @ApiProperty({
    description: 'Materials needed for this step',
    example: ['Sterilized pruning shears', 'Garbage bag', 'Disinfectant'],
    required: false,
  })
  materials?: string[];

  @ApiProperty({
    description: 'Expected duration for this step',
    example: '15-30 minutes',
    required: false,
  })
  duration?: string;

  @ApiProperty({
    description: 'Safety precautions to take',
    example: ['Wear gloves', 'Disinfect tools between cuts'],
    required: false,
  })
  precautions?: string[];
}

export class PreventionMeasureDto {
  @ApiProperty({
    description: 'Category of prevention measure',
    example: 'Environmental Control',
  })
  category: string;

  @ApiProperty({
    description: 'Specific prevention measure',
    example: 'Improve air circulation',
  })
  measure: string;

  @ApiProperty({
    description: 'Detailed description of the prevention measure',
    example: 'Ensure adequate spacing between plants and use fans if necessary to improve air circulation around the foliage',
  })
  description: string;

  @ApiProperty({
    description: 'How often to apply this measure',
    example: 'Daily monitoring, weekly adjustments',
  })
  frequency: string;

  @ApiProperty({
    description: 'Priority level of this prevention measure',
    example: 'high',
    enum: ['high', 'medium', 'low'],
  })
  priority: 'high' | 'medium' | 'low';
}

export class RecommendationContentDto {
  @ApiProperty({
    description: 'Identified disease',
    example: 'Angular Leaf Spot',
  })
  disease: string;

  @ApiProperty({
    description: 'Confidence in the recommendation (0-1)',
    example: 0.95,
  })
  confidence: number;

  @ApiProperty({
    description: 'Severity assessment of the condition',
    example: 'moderate',
    enum: ['mild', 'moderate', 'severe'],
  })
  severity: 'mild' | 'moderate' | 'severe';

  @ApiProperty({
    description: 'Immediate actions to take',
    example: [
      'Isolate affected plants',
      'Stop overhead watering',
      'Increase ventilation'
    ],
  })
  immediateActions: string[];

  @ApiProperty({
    description: 'Step-by-step treatment plan',
    type: [TreatmentStepDto],
  })
  treatmentSteps: TreatmentStepDto[];

  @ApiProperty({
    description: 'Prevention measures to avoid future occurrences',
    type: [PreventionMeasureDto],
  })
  preventionMeasures: PreventionMeasureDto[];

  @ApiProperty({
    description: 'Additional notes and considerations',
    example: 'Monitor progress weekly. If symptoms persist after 2 weeks of treatment, consider consulting a plant pathologist.',
  })
  additionalNotes: string;

  @ApiProperty({
    description: 'Reliability score of the source information (0-1)',
    example: 0.9,
  })
  sourceReliability: number;

  @ApiProperty({
    description: 'Estimated time for recovery',
    example: '2-4 weeks with proper treatment',
  })
  estimatedRecoveryTime: string;
}

export class RecommendationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the recommendation',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Session identifier',
    example: 'sess_123456789',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Original image classification',
    example: 'angular_leaf_spot',
  })
  imageClassification: string;

  @ApiProperty({
    description: 'Classification confidence',
    example: 0.95,
  })
  classificationConfidence: number;

  @ApiProperty({
    description: 'Detailed recommendation content',
    type: RecommendationContentDto,
  })
  content: RecommendationContentDto;

  @ApiProperty({
    description: 'AI model that generated the recommendation',
    example: 'openai-gpt-4',
  })
  generatedBy: string;

  @ApiProperty({
    description: 'User rating for this recommendation (1-5)',
    example: 4,
    required: false,
  })
  userRating?: number;

  @ApiProperty({
    description: 'User feedback text',
    required: false,
  })
  userFeedback?: string;

  @ApiProperty({
    description: 'When the recommendation was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the recommendation was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}

export class RecommendationListResponseDto {
  @ApiProperty({
    description: 'List of recommendations',
    type: [RecommendationResponseDto],
  })
  recommendations: RecommendationResponseDto[];

  @ApiProperty({
    description: 'Pagination information',
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class RecommendationGeneratedResponseDto {
  @ApiProperty({
    description: 'Whether the generation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success or error message',
    example: 'Recommendation generated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Generated recommendation data',
    type: RecommendationResponseDto,
    required: false,
  })
  data?: RecommendationResponseDto;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 2500,
  })
  processingTimeMs: number;
}