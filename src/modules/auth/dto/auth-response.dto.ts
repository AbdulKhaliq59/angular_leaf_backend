import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT refresh token (if refresh token mechanism is enabled)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: false,
    })
    refreshToken?: string;

    @ApiProperty({
        description: 'Token type',
        example: 'Bearer',
    })
    tokenType: string;

    @ApiProperty({
        description: 'Token expiration time in seconds',
        example: 3600,
    })
    expiresIn: number;

    @ApiProperty({
        description: 'User information',
    })
    user: {
        id: string;
        email: string;
        name: string;
        roles: UserRole[];
    };
}
