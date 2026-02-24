import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';


export interface RequestWithUser extends Request {
    user: {
        sub: string;
        email: string;
        roles: UserRole[];
        cooperativeId?: string;
    };
}
