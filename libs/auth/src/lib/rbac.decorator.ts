import { SetMetadata } from '@nestjs/common';
import { PermissionAction, PermissionResource } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  action: PermissionAction;
  resource: PermissionResource;
}

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
