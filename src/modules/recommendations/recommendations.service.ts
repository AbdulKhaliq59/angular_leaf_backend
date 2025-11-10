import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
import { Recommendation, RecommendationDocument } from './schemas/recommendation.schema';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly currentPromptVersion = '1.0.0';

  constructor(
    @InjectModel(Recommendation.name)
    private recommendationModel: Model<RecommendationDocument>,
    @Inject('AI_SERVICE') private readonly aiService: any,
  ) {}

  /**
   * Generate a new recommendation based on image classification result
   */
  async generateRecommendation(
    generateRecommendationDto: GenerateRecommendationDto,
  ): Promise<RecommendationGeneratedResponseDto> {
    const startTime = Date.now();
    
    try {
      this.logger.log(
        `Generating recommendation for classification: ${generateRecommendationDto.classification} ` +
        `(session: ${generateRecommendationDto.sessionId})`,
      );

      // Generate recommendation using AI service
      const content = await this.aiService.generateRecommendation({
        classification: generateRecommendationDto.classification,
        confidence: generateRecommendationDto.confidence,
        additionalContext: generateRecommendationDto.additionalContext,
      });

      // Save to database
      const recommendation = new this.recommendationModel({
        sessionId: generateRecommendationDto.sessionId,
        imageClassification: generateRecommendationDto.classification,
        classificationConfidence: generateRecommendationDto.confidence,
        content,
        generatedBy: this.aiService.constructor.name,
        promptVersion: this.currentPromptVersion,
      });

      const savedRecommendation = await recommendation.save();

      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Recommendation generated successfully in ${processingTime}ms ` +
        `(ID: ${savedRecommendation._id})`,
      );

      return {
        success: true,
        message: 'Recommendation generated successfully',
        data: this.transformToResponseDto(savedRecommendation),
        processingTimeMs: processingTime,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error(
        `Failed to generate recommendation: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        message: error.message || 'Failed to generate recommendation',
        processingTimeMs: processingTime,
      };
    }
  }

  /**
   * Get recommendations by various filters
   */
  async getRecommendations(
    getRecommendationsDto: GetRecommendationsDto,
  ): Promise<RecommendationListResponseDto> {
    const {
      sessionId,
      classification,
      limit = 10,
      skip = 0,
    } = getRecommendationsDto;

    try {
      // Build filter query
      const filter: any = {};
      if (sessionId) filter.sessionId = sessionId;
      if (classification) filter.imageClassification = classification;

      // Get total count for pagination
      const total = await this.recommendationModel.countDocuments(filter);

      // Get recommendations with pagination
      const recommendations = await this.recommendationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      return {
        recommendations: recommendations.map(rec => this.transformToResponseDto(rec)),
        pagination: {
          total,
          page: currentPage,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve recommendations: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve recommendations');
    }
  }

  /**
   * Get a specific recommendation by ID
   */
  async getRecommendationById(id: string): Promise<RecommendationResponseDto> {
    try {
      const recommendation = await this.recommendationModel.findById(id).exec();
      
      if (!recommendation) {
        throw new NotFoundException(`Recommendation with ID ${id} not found`);
      }

      return this.transformToResponseDto(recommendation);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Failed to retrieve recommendation ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to retrieve recommendation');
    }
  }

  /**
   * Submit user feedback for a recommendation
   */
  async submitFeedback(feedbackDto: FeedbackDto): Promise<{ success: boolean; message: string }> {
    try {
      const { recommendationId, rating, feedback } = feedbackDto;

      const recommendation = await this.recommendationModel.findById(recommendationId).exec();
      
      if (!recommendation) {
        throw new NotFoundException(`Recommendation with ID ${recommendationId} not found`);
      }

      // Update feedback
      recommendation.userRating = rating;
      if (feedback) {
        recommendation.userFeedback = feedback;
      }
      recommendation.updatedAt = new Date();

      await recommendation.save();

      this.logger.log(
        `Feedback submitted for recommendation ${recommendationId}: ${rating}/5 stars`,
      );

      return {
        success: true,
        message: 'Feedback submitted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(
        `Failed to submit feedback: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to submit feedback');
    }
  }

  /**
   * Get recommendations analytics/statistics
   */
  async getAnalytics(): Promise<any> {
    try {
      const [
        totalRecommendations,
        classificationsStats,
        averageRating,
        severityDistribution,
      ] = await Promise.all([
        this.recommendationModel.countDocuments(),
        this.getClassificationStats(),
        this.getAverageRating(),
        this.getSeverityDistribution(),
      ]);

      return {
        totalRecommendations,
        classificationsStats,
        averageRating,
        severityDistribution,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate analytics: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to generate analytics');
    }
  }

  /**
   * Health check for the recommendations service
   */
  async checkHealth(): Promise<{ status: string; database: boolean; openai: boolean }> {
    try {
      // Check database connection
      const dbHealthy = await this.checkDatabaseHealth();
      
      // Check AI service
      const openaiHealthy = await this.aiService.healthCheck();

      const overallStatus = dbHealthy && openaiHealthy ? 'healthy' : 'degraded';

      return {
        status: overallStatus,
        database: dbHealthy,
        openai: openaiHealthy,
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      return {
        status: 'unhealthy',
        database: false,
        openai: false,
      };
    }
  }

  // Private helper methods

  private transformToResponseDto(recommendation: RecommendationDocument): RecommendationResponseDto {
    return {
      id: recommendation._id.toString(),
      sessionId: recommendation.sessionId,
      imageClassification: recommendation.imageClassification,
      classificationConfidence: recommendation.classificationConfidence,
      content: recommendation.content,
      generatedBy: recommendation.generatedBy,
      userRating: recommendation.userRating,
      userFeedback: recommendation.userFeedback,
      createdAt: recommendation.createdAt,
      updatedAt: recommendation.updatedAt,
    };
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.recommendationModel.findOne().limit(1).exec();
      return true;
    } catch (error) {
      this.logger.warn(`Database health check failed: ${error.message}`);
      return false;
    }
  }

  private async getClassificationStats(): Promise<any[]> {
    return this.recommendationModel.aggregate([
      {
        $group: {
          _id: '$imageClassification',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$classificationConfidence' },
          avgRating: { $avg: '$userRating' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  private async getAverageRating(): Promise<number | null> {
    const result = await this.recommendationModel.aggregate([
      { $match: { userRating: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$userRating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    return result.length > 0 ? result[0].avgRating : null;
  }

  private async getSeverityDistribution(): Promise<any[]> {
    return this.recommendationModel.aggregate([
      {
        $group: {
          _id: '$content.severity',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }
}