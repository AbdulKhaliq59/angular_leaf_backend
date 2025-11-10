import { Injectable } from '@nestjs/common';
import { ImageClassificationService } from '../image-classification/image-classification.service';
import { RecommendationsService } from '../recommendations/recommendations.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly imageClassificationService: ImageClassificationService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async getHealth() {
    const [mlHealth, recommendationsHealth] = await Promise.all([
      this.imageClassificationService.checkHealth().catch(() => ({ status: 'unhealthy', mlApi: false })),
      this.recommendationsService.checkHealth().catch(() => ({ status: 'unhealthy', database: false, openai: false })),
    ]);

    const overallStatus = 
      mlHealth.status === 'healthy' && recommendationsHealth.status === 'healthy'
        ? 'healthy'
        : mlHealth.status === 'degraded' || recommendationsHealth.status === 'degraded'
        ? 'degraded'
        : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        mlApi: {
          status: mlHealth.status,
          available: mlHealth.mlApi,
        },
        recommendations: {
          status: recommendationsHealth.status,
          database: recommendationsHealth.database,
          openai: recommendationsHealth.openai,
        },
      },
    };
  }
}