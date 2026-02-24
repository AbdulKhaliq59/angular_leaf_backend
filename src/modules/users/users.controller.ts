import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';


@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }


    @Post()
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Create a new user',
        description: 'Create a new user account. Admin only. Allows setting custom roles.',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully created',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email already registered',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }


    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve all users with optional filtering. Admin only.',
    })
    @ApiQuery({
        name: 'role',
        required: false,
        enum: UserRole,
        description: 'Filter by role',
    })
    @ApiQuery({
        name: 'isActive',
        required: false,
        type: Boolean,
        description: 'Filter by active status',
    })
    @ApiQuery({
        name: 'cooperativeId',
        required: false,
        type: String,
        description: 'Filter by cooperative ID',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Users retrieved successfully',
        type: [UserResponseDto],
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async findAll(
        @Query('role') role?: string,
        @Query('isActive') isActive?: boolean,
        @Query('cooperativeId') cooperativeId?: string,
    ): Promise<UserResponseDto[]> {
        return this.usersService.findAll({ role, isActive, cooperativeId });
    }


    @Get('statistics')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get user statistics',
        description: 'Retrieve user statistics for admin dashboard. Admin only.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Statistics retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byRole: { [key: string]: number };
    }> {
        return this.usersService.getStatistics();
    }


    @Get(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Get a user by ID',
        description: 'Retrieve a specific user by ID. Admin only.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User retrieved successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.findOne(id);
    }


    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update a user',
        description: 'Update user information. Admin only. Cannot update password (use separate endpoint).',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User updated successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email already in use',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.usersService.update(id, updateUserDto);
    }


    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Deactivate a user (soft delete)',
        description: 'Deactivate a user account. Admin only. User can be reactivated later.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User deactivated successfully',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        return this.usersService.remove(id);
    }

    @Patch(':id/activate')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Activate a user account',
        description: 'Activate a deactivated user account. Admin only.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User activated successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async activate(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.activate(id);
    }


    @Patch(':id/deactivate')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Deactivate a user account',
        description: 'Deactivate a user account. Admin only.',
    })
    @ApiParam({
        name: 'id',
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User deactivated successfully',
        type: UserResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Admin role required',
    })
    async deactivate(@Param('id') id: string): Promise<UserResponseDto> {
        return this.usersService.deactivate(id);
    }


    @Patch('me/change-password')
    @Roles(UserRole.FARMER, UserRole.MANAGER, UserRole.ADMIN)
    @ApiOperation({
        summary: 'Change own password',
        description: 'Change password for the currently authenticated user.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password changed successfully',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Current password is incorrect',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    async changePassword(
        @CurrentUser('sub') userId: string,
        @Body() changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        return this.usersService.changePassword(userId, changePasswordDto);
    }
}
