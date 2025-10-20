import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, Role, UserRole, Task, AuditLog } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, Task, AuditLog])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
