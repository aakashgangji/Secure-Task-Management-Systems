import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  User,
  Organization,
  Role,
  Permission,
  UserRole,
  RolePermission,
  RoleType,
  PermissionAction,
  PermissionResource,
  AuditLog,
  AuditAction,
  AuditResource,
} from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Injectable()
export class DatabaseSeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async seed() {
    // Check if data already exists
    const existingRole = await this.roleRepository.findOne({ where: { name: 'Owner' } });
    if (existingRole) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Create organizations
    const org1 = this.organizationRepository.create({
      name: 'Acme Corp',
      description: 'Main organization',
    });
    const savedOrg1 = await this.organizationRepository.save(org1);

    const org2 = this.organizationRepository.create({
      name: 'Acme Corp - Engineering',
      description: 'Engineering department',
      parentId: savedOrg1.id,
    });
    await this.organizationRepository.save(org2);

    // Create permissions
    const permissions = [
      { action: PermissionAction.CREATE, resource: PermissionResource.TASK },
      { action: PermissionAction.READ, resource: PermissionResource.TASK },
      { action: PermissionAction.UPDATE, resource: PermissionResource.TASK },
      { action: PermissionAction.DELETE, resource: PermissionResource.TASK },
      { action: PermissionAction.CREATE, resource: PermissionResource.USER },
      { action: PermissionAction.READ, resource: PermissionResource.USER },
      { action: PermissionAction.UPDATE, resource: PermissionResource.USER },
      { action: PermissionAction.DELETE, resource: PermissionResource.USER },
      { action: PermissionAction.READ, resource: PermissionResource.AUDIT_LOG },
    ];

    const savedPermissions = [];
    for (const perm of permissions) {
      const permission = this.permissionRepository.create({
        name: `${perm.action}_${perm.resource}`,
        action: perm.action,
        resource: perm.resource,
        description: `Permission to ${perm.action} ${perm.resource}`,
      });
      savedPermissions.push(await this.permissionRepository.save(permission));
    }

    // Create roles
    let savedOwnerRole, savedAdminRole, savedViewerRole;
    
    try {
      const ownerRole = this.roleRepository.create({
        name: 'Owner',
        type: RoleType.OWNER,
        description: 'Organization owner with full access',
      });
      savedOwnerRole = await this.roleRepository.save(ownerRole);
    } catch (error) {
      // Role might already exist, try to find it
      savedOwnerRole = await this.roleRepository.findOne({ where: { name: 'Owner' } });
    }

    try {
      const adminRole = this.roleRepository.create({
        name: 'Admin',
        type: RoleType.ADMIN,
        description: 'Administrator with most permissions',
      });
      savedAdminRole = await this.roleRepository.save(adminRole);
    } catch (error) {
      // Role might already exist, try to find it
      savedAdminRole = await this.roleRepository.findOne({ where: { name: 'Admin' } });
    }

    try {
      const viewerRole = this.roleRepository.create({
        name: 'Viewer',
        type: RoleType.VIEWER,
        description: 'View-only access',
      });
      savedViewerRole = await this.roleRepository.save(viewerRole);
    } catch (error) {
      // Role might already exist, try to find it
      savedViewerRole = await this.roleRepository.findOne({ where: { name: 'Viewer' } });
    }

    // Assign permissions to roles
    // Owner gets all permissions
    for (const permission of savedPermissions) {
      try {
        const rolePermission = this.rolePermissionRepository.create({
          roleId: savedOwnerRole.id,
          permissionId: permission.id,
        });
        await this.rolePermissionRepository.save(rolePermission);
      } catch (error) {
        // Role-permission relationship might already exist, skip
        console.log(`Role-permission relationship already exists for Owner-${permission.name}`);
      }
    }

    // Admin gets most permissions except organization management
    const adminPermissions = savedPermissions.filter(p => p.resource !== PermissionResource.ORGANIZATION);
    for (const permission of adminPermissions) {
      try {
        const rolePermission = this.rolePermissionRepository.create({
          roleId: savedAdminRole.id,
          permissionId: permission.id,
        });
        await this.rolePermissionRepository.save(rolePermission);
      } catch (error) {
        // Role-permission relationship might already exist, skip
        console.log(`Role-permission relationship already exists for Admin-${permission.name}`);
      }
    }

    // Viewer gets read permissions only
    const viewerPermissions = savedPermissions.filter(p => p.action === PermissionAction.READ);
    for (const permission of viewerPermissions) {
      try {
        const rolePermission = this.rolePermissionRepository.create({
          roleId: savedViewerRole.id,
          permissionId: permission.id,
        });
        await this.rolePermissionRepository.save(rolePermission);
      } catch (error) {
        // Role-permission relationship might already exist, skip
        console.log(`Role-permission relationship already exists for Viewer-${permission.name}`);
      }
    }

    // Create users
    let savedOwnerUser, savedAdminUser, savedViewerUser;
    
    try {
      const ownerUser = this.userRepository.create({
        email: 'owner_saniya@turbovets.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Saniya',
        lastName: 'Sharma',
        organizationId: savedOrg1.id,
      });
      savedOwnerUser = await this.userRepository.save(ownerUser);
    } catch (error) {
      // User might already exist, try to find it
      savedOwnerUser = await this.userRepository.findOne({ where: { email: 'owner_saniya@turbovets.com' } });
    }

    try {
      const adminUser = this.userRepository.create({
        email: 'admin_aakash@turbovets.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Fnu',
        lastName: 'Aakash',
        organizationId: savedOrg1.id,
      });
      savedAdminUser = await this.userRepository.save(adminUser);
    } catch (error) {
      // User might already exist, try to find it
      savedAdminUser = await this.userRepository.findOne({ where: { email: 'admin_aakash@turbovets.com' } });
    }

    try {
      const viewerUser = this.userRepository.create({
        email: 'viewer_joey@turbovets.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Joey',
        lastName: 'Bergs',
        organizationId: savedOrg1.id,
      });
      savedViewerUser = await this.userRepository.save(viewerUser);
    } catch (error) {
      // User might already exist, try to find it
      savedViewerUser = await this.userRepository.findOne({ where: { email: 'viewer_joey@turbovets.com' } });
    }

    // Assign roles to users
    try {
      const ownerUserRole = this.userRoleRepository.create({
        userId: savedOwnerUser.id,
        roleId: savedOwnerRole.id,
      });
      await this.userRoleRepository.save(ownerUserRole);
    } catch (error) {
      console.log('User-role relationship already exists for Owner');
    }

    try {
      const adminUserRole = this.userRoleRepository.create({
        userId: savedAdminUser.id,
        roleId: savedAdminRole.id,
      });
      await this.userRoleRepository.save(adminUserRole);
    } catch (error) {
      console.log('User-role relationship already exists for Admin');
    }

    try {
      const viewerUserRole = this.userRoleRepository.create({
        userId: savedViewerUser.id,
        roleId: savedViewerRole.id,
      });
      await this.userRoleRepository.save(viewerUserRole);
    } catch (error) {
      console.log('User-role relationship already exists for Viewer');
    }

    // Create test user
    let savedTestUser;
    try {
      const testUser = this.userRepository.create({
        email: 'test@turbovets.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        organizationId: savedOrg1.id,
      });
      savedTestUser = await this.userRepository.save(testUser);
    } catch (error) {
      // User might already exist, try to find it
      savedTestUser = await this.userRepository.findOne({ where: { email: 'test@turbovets.com' } });
    }

    // Assign viewer role to test user
    try {
      const testUserRole = this.userRoleRepository.create({
        userId: savedTestUser.id,
        roleId: savedViewerRole.id,
      });
      await this.userRoleRepository.save(testUserRole);
    } catch (error) {
      console.log('User-role relationship already exists for Test User');
    }

    // Create sample audit logs
    await this.createSampleAuditLogs(savedOwnerUser, savedAdminUser, savedViewerUser, savedTestUser);

    console.log('Database seeded successfully!');
    console.log('Test users:');
    console.log('Owner: Saniya Sharma - owner_saniya@turbovets.com / password123');
    console.log('Admin: Fnu Aakash - admin_aakash@turbovets.com / password123');
    console.log('Viewer: Joey Bergs - viewer_joey@turbovets.com / password123');
    console.log('Viewer: Test User - test@turbovets.com / password123');
  }

  private async createSampleAuditLogs(ownerUser: User, adminUser: User, viewerUser: User, testUser: User) {
    const sampleLogs = [
      {
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        userId: ownerUser.id,
        details: 'User logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        action: AuditAction.CREATE,
        resource: AuditResource.TASK,
        resourceId: 'task-001',
        userId: ownerUser.id,
        details: 'Created task: "Implement user authentication"',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 90 minutes ago
      },
      {
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        userId: adminUser.id,
        details: 'User logged in successfully',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      },
      {
        action: AuditAction.UPDATE,
        resource: AuditResource.TASK,
        resourceId: 'task-001',
        userId: adminUser.id,
        details: 'Updated task: "Implement user authentication" - Changed status to in_progress',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      },
      {
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        userId: viewerUser.id,
        details: 'User logged in successfully',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        action: AuditAction.READ,
        resource: AuditResource.TASK,
        userId: viewerUser.id,
        details: 'Viewed task list',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
      },
      {
        action: AuditAction.CREATE,
        resource: AuditResource.TASK,
        resourceId: 'task-002',
        userId: ownerUser.id,
        details: 'Created task: "Add dark mode support"',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
      {
        action: AuditAction.DELETE,
        resource: AuditResource.TASK,
        resourceId: 'task-002',
        userId: ownerUser.id,
        details: 'Deleted task: "Add dark mode support"',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
      {
        action: AuditAction.LOGIN,
        resource: AuditResource.AUTH,
        userId: testUser.id,
        details: 'User logged in successfully',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
      },
      {
        action: AuditAction.READ,
        resource: AuditResource.TASK,
        userId: testUser.id,
        details: 'Viewed task details',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date(Date.now() - 18 * 60 * 1000), // 18 minutes ago
      },
    ];

    for (const logData of sampleLogs) {
      const auditLog = this.auditLogRepository.create(logData);
      await this.auditLogRepository.save(auditLog);
    }

    console.log('Sample audit logs created successfully!');
  }
}
