import { Module } from '@nestjs/common';
import { ImageClassificationModule } from '../image-classification/image-classification.module';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [ImageClassificationModule, RecommendationsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}