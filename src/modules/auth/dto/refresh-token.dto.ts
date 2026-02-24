import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for refresh token request
 */
export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  refreshToken: string;
}
