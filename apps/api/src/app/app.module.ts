import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { DatabaseSeederService } from './database-seeder.service';
import {
  User,
  Organization,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Task,
  TaskAssignment,
  AuditLog,
} from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'taskmanager.db',
      entities: [
        User,
        Organization,
        Role,
        Permission,
        UserRole,
        RolePermission,
        Task,
        TaskAssignment,
        AuditLog,
      ],
      synchronize: true, // Only for development
      logging: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Organization,
      Role,
      Permission,
      UserRole,
      RolePermission,
      Task,
      TaskAssignment,
      AuditLog,
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    TasksModule,
    UsersModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeederService],
})
export class AppModule {
  constructor(private seeder: DatabaseSeederService) {}

  async onModuleInit() {
    // Seed the database on startup
    await this.seeder.seed();
  }
}
