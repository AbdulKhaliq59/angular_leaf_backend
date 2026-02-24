import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User, UserSchema } from '../users/schemas/user.schema';


@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),

        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const expiresIn = configService.get<string>('auth.jwtExpiresIn') || '1h';
                return {
                    secret: configService.get<string>('auth.jwtSecret'),
                    signOptions: {
                        expiresIn: expiresIn as any,
                    },
                };
            },
            inject: [ConfigService],
        }),

        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }
