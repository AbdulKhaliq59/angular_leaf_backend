import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { User, UserDocument } from '../../users/schemas/user.schema';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('auth.jwtSecret'),
        });
    }


    async validate(payload: JwtPayload): Promise<JwtPayload> {
        const { sub, email, roles } = payload;

        const user = await this.userModel.findById(sub);

        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }
        return {
            sub,
            email,
            roles,
            cooperativeId: user.cooperativeId,
        };
    }
}
