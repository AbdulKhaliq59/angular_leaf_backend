import { Injectable, Logger } from '@nestjs/common';
import { RecommendationContent } from './schemas/recommendation.schema';

interface GenerateRecommendationParams {
  classification: string;
  confidence: number;
  additionalContext?: string;
}

@Injectable()
export class MockOpenaiService {
  private readonly logger = new Logger(MockOpenaiService.name);

  async generateRecommendation(params: GenerateRecommendationParams): Promise<RecommendationContent> {
    const { classification, confidence, additionalContext } = params;
    
    this.logger.log(`Generating mock recommendation for classification: ${classification} (confidence: ${confidence})`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return this.generateMockRecommendation(classification, confidence, additionalContext);
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock service is always available
  }

  private generateMockRecommendation(
    classification: string, 
    confidence: number, 
    additionalContext?: string
  ): RecommendationContent {
    
    const isHealthy = classification.toLowerCase().includes('healthy');
    
    if (isHealthy) {
      return {
        disease: 'Healthy Plant',
        confidence: Math.min(confidence + 0.05, 1.0),
        severity: 'mild',
        immediateActions: [
          'Continue current care routine',
          'Monitor plant regularly',
          'Maintain proper watering schedule'
        ],
        treatmentSteps: [
          {
            step: 1,
            action: 'Maintain Current Care',
            description: 'Continue with your current plant care routine as the plant appears healthy.',
            materials: ['Regular watering tools', 'Fertilizer (if scheduled)'],
            duration: 'Ongoing',
            precautions: ['Avoid overwatering', 'Monitor for any changes']
          }
        ],
        preventionMeasures: [
          {
            category: 'General Care',
            measure: 'Regular monitoring',
            description: 'Check plant weekly for any signs of disease or stress',
            frequency: 'Weekly',
            priority: 'high'
          },
          {
            category: 'Environmental Control',
            measure: 'Maintain optimal conditions',
            description: 'Ensure proper light, temperature, and humidity levels',
            frequency: 'Daily',
            priority: 'high'
          },
          {
            category: 'Nutrition',
            measure: 'Balanced fertilization',
            description: 'Apply appropriate fertilizer according to plant needs and season',
            frequency: 'Monthly',
            priority: 'medium'
          }
        ],
        additionalNotes: 'Your plant appears to be in good health. Continue with preventive care to maintain its condition.',
        sourceReliability: 0.9,
        estimatedRecoveryTime: 'Plant is already healthy'
      };
    }

    // For disease cases (like angular leaf spot)
    const severity = confidence > 0.8 ? 'moderate' : confidence > 0.6 ? 'mild' : 'severe';
    
    return {
      disease: 'Angular Leaf Spot',
      confidence: Math.min(confidence + 0.1, 1.0),
      severity: severity as 'mild' | 'moderate' | 'severe',
      immediateActions: [
        'Isolate affected plants immediately',
        'Remove all infected leaves using sterilized tools',
        'Improve air circulation around the plant',
        'Stop overhead watering immediately',
        'Dispose of infected plant material properly'
      ],
      treatmentSteps: [
        {
          step: 1,
          action: 'Remove infected foliage',
          description: 'Carefully remove all leaves showing signs of angular leaf spot using sterilized pruning shears. Cut back to healthy tissue.',
          materials: ['Sterilized pruning shears', 'Rubbing alcohol', 'Disposal bags'],
          duration: '30-45 minutes',
          precautions: ['Wear gloves', 'Disinfect tools between cuts', 'Do not compost infected material']
        },
        {
          step: 2,
          action: 'Apply copper-based fungicide',
          description: 'Spray remaining healthy foliage with copper-based fungicide according to manufacturer instructions.',
          materials: ['Copper fungicide', 'Spray bottle or garden sprayer', 'Protective equipment'],
          duration: '15-20 minutes',
          precautions: ['Apply in evening to avoid leaf burn', 'Wear protective clothing', 'Follow label instructions']
        },
        {
          step: 3,
          action: 'Improve growing conditions',
          description: 'Increase spacing between plants, ensure proper drainage, and improve air circulation.',
          materials: ['Fan (if indoor)', 'Mulch', 'Drainage materials'],
          duration: '1-2 hours',
          precautions: ['Avoid overcrowding', 'Ensure good drainage']
        },
        {
          step: 4,
          action: 'Monitor and reapply treatment',
          description: 'Monitor plant weekly and reapply fungicide every 7-14 days as needed.',
          materials: ['Same as step 2'],
          duration: '15 minutes per application',
          precautions: ['Do not over-apply', 'Rotate fungicide types if needed']
        }
      ],
      preventionMeasures: [
        {
          category: 'Environmental Control',
          measure: 'Improve air circulation',
          description: 'Ensure adequate spacing between plants and use fans if necessary to improve airflow',
          frequency: 'Maintain continuously',
          priority: 'high'
        },
        {
          category: 'Watering Management',
          measure: 'Avoid overhead watering',
          description: 'Water at soil level to keep leaves dry and reduce disease spread',
          frequency: 'Every watering session',
          priority: 'high'
        },
        {
          category: 'Sanitation',
          measure: 'Clean growing area',
          description: 'Remove fallen leaves and debris regularly to reduce disease pressure',
          frequency: 'Weekly',
          priority: 'medium'
        },
        {
          category: 'Plant Health',
          measure: 'Avoid plant stress',
          description: 'Maintain consistent watering and proper nutrition to keep plants strong',
          frequency: 'Ongoing',
          priority: 'medium'
        },
        {
          category: 'Preventive Treatment',
          measure: 'Seasonal fungicide application',
          description: 'Apply preventive fungicide treatments during high-risk periods',
          frequency: 'Seasonally',
          priority: 'low'
        }
      ],
      additionalNotes: `Angular leaf spot is a bacterial disease that thrives in warm, humid conditions. ${additionalContext ? `Additional context: ${additionalContext}. ` : ''}Early detection and treatment are crucial for successful management. Consider consulting a plant pathologist if symptoms persist after 3-4 weeks of treatment. Avoid working with wet plants to prevent spread.`,
      sourceReliability: 0.85,
      estimatedRecoveryTime: this.getEstimatedRecoveryTime(severity)
    };
  }

  private getEstimatedRecoveryTime(severity: string): string {
    switch (severity) {
      case 'mild':
        return '1-3 weeks with proper treatment';
      case 'moderate':
        return '3-6 weeks with consistent treatment';
      case 'severe':
        return '6-12 weeks with intensive treatment and possible plant replacement';
      default:
        return '3-6 weeks with proper treatment';
    }
  }
}