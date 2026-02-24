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

            if (req.user) {
                const logData = {
                    timestamp: new Date().toISOString(),
                    userId: req.user.sub,
                    email: req.user.email,
                    roles: req.user.roles,
                    method,
                    path: originalUrl,
                    statusCode,
                    duration: `${duration}ms`,
                    ip,
                    userAgent,
                    cooperativeId: req.user.cooperativeId,
                };

                if (statusCode >= 500) {
                    this.logger.error(`Server Error: ${JSON.stringify(logData)}`);
                } else if (statusCode >= 400) {
                    this.logger.warn(`Client Error: ${JSON.stringify(logData)}`);
                } else {
                    this.logger.log(`Request: ${JSON.stringify(logData)}`);
                }

                // TODO: Store in database for persistent audit trail
                // await this.auditLogRepository.create(logData);
            }
        });

        next();
    }
}
