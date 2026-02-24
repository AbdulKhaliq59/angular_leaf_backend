import {
    Controller,
    Post,
    Body,
    UseGuards,
    Get,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Register a new user',
        description: 'Create a new user account. Users are assigned the FARMER role by default.',
    })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully registered',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email already registered',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }


    @Public()
    @UseGuards(ThrottlerGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'User login',
        description: 'Authenticate user and receive JWT tokens. Rate-limited to prevent brute force attacks.',
    })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully authenticated',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid credentials or account deactivated',
    })
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: 'Too many login attempts',
    })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }


    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Refresh access token',
        description: 'Generate new access token using refresh token.',
    })
    @ApiBody({ type: RefreshTokenDto })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Token successfully refreshed',
        type: AuthResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid or expired refresh token',
    })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
        return this.authService.refreshToken(refreshTokenDto.refreshToken);
    }


    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Logout user',
        description: 'Invalidate refresh token and logout user.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User successfully logged out',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    async logout(@CurrentUser('sub') userId: string): Promise<{ message: string }> {
        await this.authService.logout(userId);
        return { message: 'Successfully logged out' };
    }


    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Returns authenticated user information from JWT token.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User profile retrieved successfully',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Authentication required',
    })
    async getProfile(@CurrentUser() user: JwtPayload): Promise<JwtPayload> {
        return user;
    }
}
