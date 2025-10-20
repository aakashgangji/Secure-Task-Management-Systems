import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/auth';
import { PermissionAction, PermissionResource } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Controller('audit-log')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.AUDIT_LOG })
  async getLogs(@Query('userId') userId?: string, @Query('resource') resource?: string) {
    return await this.auditService.getLogs(userId, resource);
  }
}
