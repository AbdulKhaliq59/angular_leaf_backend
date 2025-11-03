import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { ImageClassificationController } from './image-classification.controller';
import { ImageClassificationService } from './image-classification.service';
import { MlModelService } from './ml-model.service';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get('upload.tempDir'),
          filename: (req, file, callback) => {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: configService.get('upload.maxFileSize'),
        },
        fileFilter: (req, file, callback) => {
          const allowedMimeTypes = configService.get('upload.allowedMimeTypes');
          if (allowedMimeTypes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(
              new Error(
                `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
              ),
              false,
            );
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ImageClassificationController],
  providers: [ImageClassificationService, MlModelService],
  exports: [ImageClassificationService],
})
export class ImageClassificationModule {}