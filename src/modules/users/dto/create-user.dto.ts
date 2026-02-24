import { IsEmail, IsString, IsEnum, IsArray, IsOptional, IsBoolean, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';


export class CreateUserDto {
    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
        example: 'SecurePass123!',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        {
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    )
    password: string;

    @ApiPropertyOptional({
        description: 'User roles',
        enum: UserRole,
        isArray: true,
        example: [UserRole.FARMER],
        default: [UserRole.FARMER],
    })
    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];

    @ApiPropertyOptional({
        description: 'User active status',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Cooperative ID for multi-tenancy (optional)',
        example: '507f1f77bcf86cd799439011',
    })
    @IsOptional()
    @IsString()
    cooperativeId?: string;
}
