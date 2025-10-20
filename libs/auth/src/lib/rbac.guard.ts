import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from './rbac.decorator';
import { User } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    console.log('RBAC Guard - User object keys:', Object.keys(user));
    console.log('RBAC Guard - User userRoles:', user.userRoles);
    console.log('RBAC Guard - User roles:', (user as any).roles);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required permissions
    const hasPermission = await this.checkUserPermissions(user, requiredPermissions);
    
    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private async checkUserPermissions(user: User, requiredPermissions: RequiredPermission[]): Promise<boolean> {
    // Get roles from JWT payload (stored in user object)
    const userRoles = (user as any).roles || [];
    console.log('RBAC Guard - User roles from JWT:', userRoles);
    
    // Check if user is owner (has all permissions)
    if (userRoles.includes('owner')) {
      console.log('RBAC Guard - User is owner, allowing all permissions');
      return true;
    }

    // Check if user is admin (has most permissions except owner-specific ones)
    if (userRoles.includes('admin')) {
      console.log('RBAC Guard - User is admin, checking permissions');
      // Admin can do everything except organization management
      return !requiredPermissions.some(p => p.resource === 'organization');
    }

    // For viewer, only allow read operations
    if (userRoles.includes('viewer')) {
      console.log('RBAC Guard - User is viewer, checking read permissions');
      return requiredPermissions.every(p => p.action === 'read');
    }

    console.log('RBAC Guard - No matching role found');
    return false;
  }

}
