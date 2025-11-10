import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { MockOpenaiService } from './mock-openai.service';
import { OpenaiService } from './openai.service';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { Recommendation, RecommendationSchema } from './schemas/recommendation.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    {
      provide: 'AI_SERVICE',
      useFactory: (configService: ConfigService) => {
        const openaiApiKey = configService.get<string>('openai.apiKey');
        const useMockAI = configService.get<boolean>('openai.useMock') || !openaiApiKey;
        
        if (useMockAI) {
          console.log('🤖 Using Mock AI Service for recommendations (Free)');
          return new MockOpenaiService();
        } else {
          console.log('🚀 Using OpenAI Service for recommendations');
          return new OpenaiService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}