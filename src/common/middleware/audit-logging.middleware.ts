import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '../interfaces/request-with-user.interface';


@Injectable()
export class AuditLoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('AuditLog');

    use(req: RequestWithUser, res: Response, next: NextFunction) {
        const startTime = Date.now();
        const { method, originalUrl, ip, headers } = req;
        const userAgent = headers['user-agent'] || 'unknown';

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;

            const logData: Record<string, any> = {
                timestamp: new Date().toISOString(),
                method,
                path: originalUrl,
                statusCode,
                duration: `${duration}ms`,
                ip,
                userAgent,
            };

            if (req.user) {
                logData.userId = req.user.sub;
                logData.email = req.user.email;
                logData.roles = req.user.roles;
                logData.cooperativeId = req.user.cooperativeId;
            }

            if (statusCode >= 500) {
                this.logger.error(JSON.stringify(logData));
            } else if (statusCode >= 400) {
                this.logger.warn(JSON.stringify(logData));
            } else {
                this.logger.log(JSON.stringify(logData));
            }

            // TODO: persist in DB if required
            // await this.auditLogRepository.create(logData);
        });

        next();
    }
}
