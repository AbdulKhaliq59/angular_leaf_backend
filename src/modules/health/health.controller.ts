import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('health')
@Controller('health')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Check application health',
    description: 'Returns the health status of the application. Admin only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', format: 'date-time' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
  async getHealth() {
    return this.healthService.getHealth();
  }
}