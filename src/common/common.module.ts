import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuditLoggingMiddleware } from './middleware/audit-logging.middleware';

@Module({
  imports: [HttpModule],
  exports: [HttpModule],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuditLoggingMiddleware)
      .forRoutes('*');
  }
}