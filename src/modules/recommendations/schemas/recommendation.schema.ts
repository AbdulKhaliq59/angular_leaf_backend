import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecommendationDocument = HydratedDocument<Recommendation>;

export interface TreatmentStep {
  step: number;
  action: string;
  description: string;
  materials?: string[];
  duration?: string;
  precautions?: string[];
}

export interface PreventionMeasure {
  category: string;
  measure: string;
  description: string;
  frequency: string;
  priority: 'high' | 'medium' | 'low';
}

export interface RecommendationContent {
  disease: string;
  confidence: number;
  severity: 'mild' | 'moderate' | 'severe';
  immediateActions: string[];
  treatmentSteps: TreatmentStep[];
  preventionMeasures: PreventionMeasure[];
  additionalNotes: string;
  sourceReliability: number;
  estimatedRecoveryTime: string;
}

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  imageClassification: string;

  @Prop({ required: true, min: 0, max: 1 })
  classificationConfidence: number;

  @Prop({ required: true, type: Object })
  content: RecommendationContent;

  @Prop({ required: true })
  generatedBy: string; // 'openai-gpt-4' etc.

  @Prop({ required: true })
  promptVersion: string;

  @Prop({ default: 0 })
  userRating?: number;

  @Prop()
  userFeedback?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);

// Index for faster queries
RecommendationSchema.index({ sessionId: 1 });
RecommendationSchema.index({ imageClassification: 1 });
RecommendationSchema.index({ createdAt: -1 });