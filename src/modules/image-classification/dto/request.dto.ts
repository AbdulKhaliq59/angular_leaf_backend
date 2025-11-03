import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ImageFormat {
  JPEG = 'jpeg',
  PNG = 'png',
  GIF = 'gif',
  BMP = 'bmp',
  TIFF = 'tiff',
  WEBP = 'webp',
}

export class ClassifyImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to classify',
  })
  image: any;

  @ApiProperty({
    description: 'Optional metadata for the prediction',
    required: false,
    example: 'Sample from field A',
  })
  @IsOptional()
  @IsString()
  metadata?: string;

  @ApiProperty({
    description: 'Expected image format (optional, will be auto-detected)',
    enum: ImageFormat,
    required: false,
  })
  @IsOptional()
  @IsEnum(ImageFormat)
  format?: ImageFormat;
}

export class BatchClassifyImagesDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Array of image files to classify',
  })
  images: any[];

  @ApiProperty({
    description: 'Optional metadata for the batch',
    required: false,
    example: 'Batch from field survey',
  })
  @IsOptional()
  @IsString()
  metadata?: string;
}