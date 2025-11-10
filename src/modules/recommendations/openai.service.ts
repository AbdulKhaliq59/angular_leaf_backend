import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RecommendationContent } from './schemas/recommendation.schema';

interface GenerateRecommendationParams {
  classification: string;
  confidence: number;
  additionalContext?: string;
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    this.openai = new OpenAI({
      apiKey,
    });

    this.model = this.configService.get<string>('openai.model') || 'gpt-4';
    this.maxTokens = this.configService.get<number>('openai.maxTokens') || 1000;
    
    this.logger.log(`OpenAI service initialized with model: ${this.model}`);
  }

  async generateRecommendation(params: GenerateRecommendationParams): Promise<RecommendationContent> {
    const { classification, confidence, additionalContext } = params;
    
    try {
      this.logger.log(`Generating recommendation for classification: ${classification} (confidence: ${confidence})`);
      
      const prompt = this.buildPrompt(classification, confidence, additionalContext);
      
      const startTime = Date.now();
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for more consistent, factual responses
        response_format: { type: 'json_object' },
      });

      const processingTime = Date.now() - startTime;
      this.logger.log(`OpenAI response received in ${processingTime}ms`);

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response received from OpenAI');
      }

      try {
        const parsedContent = JSON.parse(content) as RecommendationContent;
        return this.validateAndEnhanceResponse(parsedContent, classification, confidence);
      } catch (parseError) {
        this.logger.error('Failed to parse OpenAI response as JSON:', parseError);
        throw new BadRequestException('Invalid response format from AI service');
      }
    } catch (error) {
      this.logger.error(`Failed to generate recommendation: ${error.message}`, error.stack);
      
      if (error.response?.status === 429) {
        throw new BadRequestException('AI service temporarily unavailable due to rate limits. Please try again later.');
      } else if (error.response?.status === 401) {
        throw new BadRequestException('AI service authentication failed. Please check configuration.');
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        throw new BadRequestException('Failed to generate recommendation. Please try again.');
      }
    }
  }

  private getSystemPrompt(): string {
    return `You are an expert plant pathologist and agricultural consultant specializing in angular leaf spot disease and plant health management. 

Your task is to provide comprehensive, actionable recommendations based on plant disease classification results.

You must respond with valid JSON that matches this exact structure:
{
  "disease": "string - Disease name in proper format",
  "confidence": number - Your confidence in recommendations (0-1),
  "severity": "mild" | "moderate" | "severe",
  "immediateActions": ["array", "of", "immediate", "actions"],
  "treatmentSteps": [
    {
      "step": 1,
      "action": "Action name",
      "description": "Detailed description",
      "materials": ["optional", "materials", "list"],
      "duration": "optional duration estimate",
      "precautions": ["optional", "safety", "precautions"]
    }
  ],
  "preventionMeasures": [
    {
      "category": "Category name",
      "measure": "Specific measure",
      "description": "Detailed description",
      "frequency": "How often to apply",
      "priority": "high" | "medium" | "low"
    }
  ],
  "additionalNotes": "Important additional information and warnings",
  "sourceReliability": number - Reliability score (0-1),
  "estimatedRecoveryTime": "Time estimate for recovery"
}

Provide practical, evidence-based recommendations that are safe and effective. Consider organic and chemical treatment options when appropriate. Always prioritize plant and human safety.`;
  }

  private buildPrompt(classification: string, confidence: number, additionalContext?: string): string {
    const contextSection = additionalContext ? `\n\nAdditional Context: ${additionalContext}` : '';
    
    const severityIndicator = this.getSeverityFromConfidence(confidence);
    
    return `Plant Disease Analysis Results:
- Classification: ${classification}
- AI Model Confidence: ${confidence.toFixed(3)} (${(confidence * 100).toFixed(1)}%)
- Indicated Severity Level: ${severityIndicator}${contextSection}

Please provide comprehensive treatment and prevention recommendations for this plant condition. Focus on:

1. Immediate actions needed to prevent spread
2. Step-by-step treatment protocol
3. Long-term prevention strategies
4. Environmental management recommendations
5. Monitoring and follow-up guidelines

Consider both organic and conventional treatment options where applicable. Ensure all recommendations are safe for home gardeners and commercially viable.

If this appears to be a healthy plant (classification indicates healthy), focus on preventive care and maintenance recommendations instead of treatment.`;
  }

  private getSeverityFromConfidence(confidence: number): string {
    if (confidence >= 0.9) return 'High confidence detection';
    if (confidence >= 0.7) return 'Moderate confidence detection';
    return 'Low confidence detection - proceed with caution';
  }

  private validateAndEnhanceResponse(
    response: RecommendationContent,
    classification: string,
    confidence: number,
  ): RecommendationContent {
    // Validate required fields
    if (!response.disease || !response.severity || !response.immediateActions) {
      throw new BadRequestException('Incomplete recommendation generated');
    }

    // Ensure arrays exist
    response.immediateActions = response.immediateActions || [];
    response.treatmentSteps = response.treatmentSteps || [];
    response.preventionMeasures = response.preventionMeasures || [];

    // Set confidence based on classification confidence and response quality
    response.confidence = Math.min(confidence, response.confidence || confidence);

    // Ensure source reliability is set
    response.sourceReliability = response.sourceReliability || 0.85;

    // Validate severity
    if (!['mild', 'moderate', 'severe'].includes(response.severity)) {
      response.severity = confidence > 0.8 ? 'moderate' : 'mild';
    }

    // Ensure recovery time is set
    if (!response.estimatedRecoveryTime) {
      response.estimatedRecoveryTime = this.getDefaultRecoveryTime(response.severity);
    }

    return response;
  }

  private getDefaultRecoveryTime(severity: string): string {
    switch (severity) {
      case 'mild':
        return '1-2 weeks with proper care';
      case 'moderate':
        return '2-4 weeks with consistent treatment';
      case 'severe':
        return '4-8 weeks with intensive treatment';
      default:
        return '2-4 weeks with proper treatment';
    }
  }

  /**
   * Check if the OpenAI service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple API test with minimal token usage
      await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: 'Test',
          },
        ],
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      this.logger.warn(`OpenAI health check failed: ${error.message}`);
      return false;
    }
  }
}