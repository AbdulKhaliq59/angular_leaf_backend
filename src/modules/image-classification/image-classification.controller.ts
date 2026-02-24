import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import { BatchClassifyImagesDto, ClassifyImageDto } from './dto/request.dto';
import {
  BatchClassificationResponseDto,
  ClassificationResponseDto,
  PredictionResultDto,
} from './dto/response.dto';
import { ImageClassificationService } from './image-classification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('image-classification')
@Controller('classify')
@UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ImageClassificationController {
  constructor(
    private readonly imageClassificationService: ImageClassificationService,
  ) {}

  @Post('image')
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Classify a single image for angular leaf spot detection',
    description: 'Upload an image to detect if it shows signs of angular leaf spot disease. Accessible by farmers, managers, and admins.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and optional metadata',
    type: ClassifyImageDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Image classification completed successfully',
    type: ClassificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or parameters',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - ML service unavailable',
  })
  async classifyImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { metadata?: string },
  ): Promise<PredictionResultDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return await this.imageClassificationService.classifyImage(
      file,
      body.metadata,
    );
  }

  @Post('image/with-recommendations')
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Classify image and generate AI recommendations',
    description: 'Upload an image to detect angular leaf spot and receive comprehensive AI-powered treatment recommendations. Accessible by farmers, managers, and admins.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and optional metadata for classification with recommendations',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to classify (JPEG, PNG, GIF, BMP, TIFF, WebP)',
        },
        metadata: {
          type: 'string',
          description: 'Optional metadata about the image or plant condition',
        },
        additionalContext: {
          type: 'string',
          description: 'Additional context about the plant, environment, or situation',
        },
      },
      required: ['image'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Image classified successfully with recommendations generated',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            classification: { 
              $ref: '#/components/schemas/PredictionResultDto' 
            },
            recommendation: {
              type: 'object',
              description: 'Generated AI recommendation'
            },
            sessionId: { 
              type: 'string',
              description: 'Session ID for tracking this classification and recommendation'
            }
          }
        },
        processingTimeMs: { type: 'number' }
      }
    }
  })
  async classifyImageWithRecommendations(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ClassifyImageDto & { additionalContext?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const result = await this.imageClassificationService.classifyImageWithRecommendations(
      file,
      body.metadata,
      body.additionalContext,
    );

    return {
      success: true,
      message: 'Image classified and recommendations generated successfully',
      data: result,
      processingTimeMs: Date.now(), // This would be calculated properly in a real implementation
    };
  }

  @Post('batch')
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  @ApiOperation({
    summary: 'Classify multiple images in batch',
    description: 'Upload multiple images to detect angular leaf spot disease in batch. Accessible by farmers, managers, and admins.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Array of image files and optional metadata',
    type: BatchClassifyImagesDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Batch classification completed',
    type: BatchClassificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid files or parameters',
  })
  @ApiResponse({
    status: 413,
    description: 'One or more files too large',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests',
  })
  async classifyImagesBatch(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { metadata?: string },
  ): Promise<{
    results: any[];
    summary: { total: number; successful: number; failed: number };
  }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed per batch');
    }

    return await this.imageClassificationService.classifyImagesBatch(
      files,
      body.metadata,
    );
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Check service health',
    description: 'Check the health status of the image classification service. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'healthy',
          enum: ['healthy', 'degraded', 'unhealthy'],
        },
        mlApi: {
          type: 'boolean',
          example: true,
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
        },
      },
    },
  })
  async checkHealth(): Promise<{
    status: string;
    mlApi: boolean;
    timestamp: string;
  }> {
    const health = await this.imageClassificationService.checkHealth();
    return {
      ...health,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @Public()
  @ApiOperation({
    summary: 'Get classification statistics',
    description: 'Get statistics and information about the ML model. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Classification statistics and model information',
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - ML API not accessible',
  })
  async getStats(): Promise<any> {
    return await this.imageClassificationService.getClassificationStats();
  }

  @Get('supported-formats')
  @Public()
  @ApiOperation({
    summary: 'Get supported image formats',
    description: 'Get list of supported image formats and upload limits. Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'Supported formats and limits',
    schema: {
      type: 'object',
      properties: {
        supportedFormats: {
          type: 'array',
          items: { type: 'string' },
          example: ['image/jpeg', 'image/png', 'image/gif'],
        },
        maxFileSize: {
          type: 'string',
          example: '16MB',
        },
        maxBatchSize: {
          type: 'number',
          example: 10,
        },
      },
    },
  })
  getSupportedFormats(): any {
    return {
      supportedFormats: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/webp',
      ],
      maxFileSize: '16MB',
      maxBatchSize: 10,
      description: 'Angular leaf spot detection supports common image formats up to 16MB per file',
    };
  }
}