import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';

import {
    FeedbackDto,
    GenerateRecommendationDto,
    GetRecommendationsDto,
} from './dto/request.dto';
import {
    RecommendationGeneratedResponseDto,
    RecommendationListResponseDto,
    RecommendationResponseDto,
} from './dto/response.dto';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('recommendations')
@Controller('recommendations')
@UseGuards(ThrottlerGuard, JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('generate')
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Generate AI-powered recommendations',
    description: 'Generate comprehensive treatment and prevention recommendations based on plant disease classification results using OpenAI. Accessible by farmers, managers, and admins.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recommendation generated successfully',
    type: RecommendationGeneratedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data or AI service error',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during recommendation generation',
  })
  async generateRecommendation(
    @Body(ValidationPipe) generateRecommendationDto: GenerateRecommendationDto,
  ): Promise<RecommendationGeneratedResponseDto> {
    return this.recommendationsService.generateRecommendation(generateRecommendationDto);
  }

  @Get()
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recommendations',
    description: 'Retrieve recommendations with optional filtering by session ID or classification type. Accessible by farmers, managers, and admins.',
  })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Filter by session ID',
  })
  @ApiQuery({
    name: 'classification',
    required: false,
    description: 'Filter by classification type',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recommendations to return (default: 10, max: 100)',
    type: Number,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Number of recommendations to skip for pagination (default: 0)',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recommendations retrieved successfully',
    type: RecommendationListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
  })
  async getRecommendations(
    @Query(ValidationPipe) getRecommendationsDto: GetRecommendationsDto,
  ): Promise<RecommendationListResponseDto> {
    return this.recommendationsService.getRecommendations(getRecommendationsDto);
  }

  @Get('analytics')
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recommendations analytics',
    description: 'Retrieve analytics and statistics about generated recommendations. Accessible by managers and admins.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Analytics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - manager or admin role required',
  })
  async getAnalytics() {
    return this.recommendationsService.getAnalytics();
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Check recommendations service health',
    description: 'Check the health status of the recommendations service including database and AI service connectivity. Public endpoint.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Health status retrieved successfully',
  })
  async checkHealth() {
    return this.recommendationsService.checkHealth();
  }

  @Get(':id')
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get recommendation by ID',
    description: 'Retrieve a specific recommendation by its unique identifier. Accessible by farmers, managers, and admins.',
  })
  @ApiParam({
    name: 'id',
    description: 'Recommendation unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recommendation retrieved successfully',
    type: RecommendationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Recommendation not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid recommendation ID format',
  })
  async getRecommendationById(
    @Param('id') id: string,
  ): Promise<RecommendationResponseDto> {
    return this.recommendationsService.getRecommendationById(id);
  }

  @Patch(':id/feedback')
  @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Submit user feedback',
    description: 'Submit user rating and feedback for a specific recommendation. Accessible by farmers, managers, and admins.',
  })
  @ApiParam({
    name: 'id',
    description: 'Recommendation unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiNotFoundResponse({
    description: 'Recommendation not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid feedback data or recommendation ID format',
  })
  async submitFeedback(
    @Param('id') id: string,
    @Body(ValidationPipe) feedbackDto: Omit<FeedbackDto, 'recommendationId'>,
  ) {
    const fullFeedbackDto: FeedbackDto = {
      recommendationId: id,
      ...feedbackDto,
    };
    
    return this.recommendationsService.submitFeedback(fullFeedbackDto);
  }
}