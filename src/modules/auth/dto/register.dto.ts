import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class RegisterDto {
    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @MinLength(2)
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
}
