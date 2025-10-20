import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  async getLogs(userId?: string, resource?: string) {
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.timestamp', 'DESC');

    if (userId) {
      query.andWhere('auditLog.userId = :userId', { userId });
    }

    if (resource) {
      query.andWhere('auditLog.resource = :resource', { resource });
    }

    return await query.getMany();
  }
}
