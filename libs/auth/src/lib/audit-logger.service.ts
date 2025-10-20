import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditResource, AuditLog } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Injectable()
export class AuditLoggerService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    action: AuditAction,
    resource: AuditResource,
    details?: string,
    resourceId?: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        resource,
        resourceId,
        details,
        userId,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await this.auditLogRepository.save(auditLog);
      
      // Log to console for debugging
      console.log('AUDIT LOG SAVED:', JSON.stringify({
        action,
        resource,
        resourceId,
        details,
        userId,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      }, null, 2));
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  }
}
