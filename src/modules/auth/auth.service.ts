import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/user-role.enum';


@Injectable()
export class AuthService {
    private readonly bcryptSaltRounds: number;
    private readonly jwtExpiresIn: string;

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        this.bcryptSaltRounds = this.configService.get<number>('auth.bcryptSaltRounds', 12);
        this.jwtExpiresIn = this.configService.get<string>('auth.jwtExpiresIn', '1h');
    }


    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        const { name, email, password } = registerDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);

        const newUser = new this.userModel({
            name,
            email,
            password: hashedPassword,
            roles: [UserRole.FARMER],
            isActive: true,
        });

        const savedUser = await newUser.save();

        return this.generateAuthResponse(savedUser);
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const { email, password } = loginDto;


        const user = await this.userModel.findOne({ email }).select('+password');

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        user.lastLoginAt = new Date();
        await user.save();


        return this.generateAuthResponse(user);
    }

    async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('auth.jwtRefreshSecret'),
            });

            const user = await this.userModel.findById(payload.sub).select('+refreshToken');

            if (!user || !user.isActive) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (!user.refreshToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);

            if (!isRefreshTokenValid) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            return this.generateAuthResponse(user);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }


    async logout(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    }


    async validateUser(userId: string): Promise<UserDocument> {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        return user;
    }


    private async generateAuthResponse(user: UserDocument): Promise<AuthResponseDto> {
        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            roles: user.roles,
            cooperativeId: user.cooperativeId,
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshTokenExpiresIn = this.configService.get<string>('auth.jwtRefreshExpiresIn', '7d');
        const refreshToken = this.jwtService.sign(
            { sub: user._id.toString() },
            {
                secret: this.configService.get<string>('auth.jwtRefreshSecret'),
                expiresIn: refreshTokenExpiresIn as any,
            },
        );

        const hashedRefreshToken = await bcrypt.hash(refreshToken, this.bcryptSaltRounds);
        await this.userModel.findByIdAndUpdate(user._id, { refreshToken: hashedRefreshToken });

        const expiresIn = this.parseExpirationToSeconds(this.jwtExpiresIn);

        return {
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                roles: user.roles,
            },
        };
    }


    private parseExpirationToSeconds(expiration: string): number {
        const units: { [key: string]: number } = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };

        const match = expiration.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 3600;
        }

        const [, value, unit] = match;
        return parseInt(value) * units[unit];
    }
}
