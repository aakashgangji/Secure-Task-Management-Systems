import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLog } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';
import { AuditLoggerService } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/auth';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  controllers: [AuditController],
  providers: [AuditService, AuditLoggerService],
  exports: [AuditService, AuditLoggerService],
})
export class AuditModule {}
