import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO for updating an existing user
 * 
 * Omits password field - use separate endpoint for password changes
 * All fields are optional (partial update)
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
