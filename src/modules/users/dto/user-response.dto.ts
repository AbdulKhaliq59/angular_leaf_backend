import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';


export class UserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    _id: string;

    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
    })
    name: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    email: string;

    @ApiProperty({
        description: 'User roles',
        enum: UserRole,
        isArray: true,
        example: [UserRole.FARMER],
    })
    roles: UserRole[];

    @ApiProperty({
        description: 'User active status',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Cooperative ID',
        example: '507f1f77bcf86cd799439011',
        required: false,
    })
    cooperativeId?: string;

    @ApiProperty({
        description: 'Last login timestamp',
        example: '2026-02-24T10:30:00.000Z',
        required: false,
    })
    lastLoginAt?: Date;

    @ApiProperty({
        description: 'Account creation timestamp',
        example: '2026-01-01T00:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2026-02-24T10:30:00.000Z',
    })
    updatedAt: Date;
}
