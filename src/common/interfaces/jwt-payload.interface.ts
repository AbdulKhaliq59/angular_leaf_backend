import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
    sub: string;
    email: string;
    roles: UserRole[];
    cooperativeId?: string;
    iat?: number;
    exp?: number;
}
