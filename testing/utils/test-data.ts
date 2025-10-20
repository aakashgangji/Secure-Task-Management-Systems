import { User } from '../../libs/data/src/lib/user.entity';
import { Task } from '../../libs/data/src/lib/task.entity';
import { Role } from '../../libs/data/src/lib/role.entity';
import { Permission } from '../../libs/data/src/lib/permission.entity';

// Test user data
export const testUsers = {
  owner: {
    id: 'owner-123',
    email: 'owner_saniya@turbovets.com',
    firstName: 'Saniya',
    lastName: 'Owner',
    password: 'password123',
    roles: ['owner']
  } as User,
  
  admin: {
    id: 'admin-123',
    email: 'admin_aakash@turbovets.com',
    firstName: 'Aakash',
    lastName: 'Admin',
    password: 'password123',
    roles: ['admin']
  } as User,
  
  viewer: {
    id: 'viewer-123',
    email: 'viewer_joey@turbovets.com',
    firstName: 'Joey',
    lastName: 'Viewer',
    password: 'password123',
    roles: ['viewer']
  } as User
};

// Test task data
export const testTasks = {
  task1: {
    id: 'task-123',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the project',
    status: 'pending',
    priority: 'high',
    dueDate: new Date('2024-12-31'),
    assignedTo: testUsers.admin.id,
    createdBy: testUsers.owner.id
  } as Task,
  
  task2: {
    id: 'task-456',
    title: 'Review code changes',
    description: 'Review and approve recent code changes',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date('2024-12-15'),
    assignedTo: testUsers.viewer.id,
    createdBy: testUsers.admin.id
  } as Task
};

// Test roles
export const testRoles = {
  owner: {
    id: 'role-owner',
    type: 'owner',
    name: 'Owner',
    description: 'Full system access'
  } as Role,
  
  admin: {
    id: 'role-admin',
    type: 'admin',
    name: 'Administrator',
    description: 'Management access'
  } as Role,
  
  viewer: {
    id: 'role-viewer',
    type: 'viewer',
    name: 'Viewer',
    description: 'Read-only access'
  } as Role
};

// Test permissions
export const testPermissions = {
  taskCreate: {
    id: 'perm-task-create',
    resource: 'task',
    action: 'create',
    description: 'Create tasks'
  } as Permission,
  
  taskRead: {
    id: 'perm-task-read',
    resource: 'task',
    action: 'read',
    description: 'Read tasks'
  } as Permission,
  
  taskUpdate: {
    id: 'perm-task-update',
    resource: 'task',
    action: 'update',
    description: 'Update tasks'
  } as Permission,
  
  taskDelete: {
    id: 'perm-task-delete',
    resource: 'task',
    action: 'delete',
    description: 'Delete tasks'
  } as Permission,
  
  userCreate: {
    id: 'perm-user-create',
    resource: 'user',
    action: 'create',
    description: 'Create users'
  } as Permission,
  
  userRead: {
    id: 'perm-user-read',
    resource: 'user',
    action: 'read',
    description: 'Read users'
  } as Permission,
  
  auditRead: {
    id: 'perm-audit-read',
    resource: 'audit',
    action: 'read',
    description: 'Read audit logs'
  } as Permission,
  
  organizationManage: {
    id: 'perm-org-manage',
    resource: 'organization',
    action: 'manage',
    description: 'Manage organizations'
  } as Permission
};

// JWT test tokens
export const testTokens = {
  owner: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvd25lci0xMjMiLCJlbWFpbCI6Im93bmVyX3Nhbml5YUB0dXJib3ZldHMuY29tIiwicm9sZXMiOlsib3duZXIiXSwiaWF0IjoxNzA0MDk2MDAwLCJleHAiOjE3MDQxODI0MDB9.test-signature',
  
  admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0xMjMiLCJlbWFpbCI6ImFkbWluX2Fha2FzaEB0dXJib3ZldHMuY29tIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNzA0MDk2MDAwLCJleHAiOjE3MDQxODI0MDB9.test-signature',
  
  viewer: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2aWV3ZXItMTIzIiwiZW1haWwiOiJ2aWV3ZXJfam9leUB0dXJib3ZldHMuY29tIiwicm9sZXMiOlsidmlld2VyIl0sImlhdCI6MTcwNDA5NjAwMCwiZXhwIjoxNzA0MTgyNDAwfQ.test-signature'
};

// API response mocks
export const apiResponses = {
  loginSuccess: {
    access_token: testTokens.admin,
    user: testUsers.admin
  },
  
  loginError: {
    message: 'Invalid credentials',
    statusCode: 401
  },
  
  tasksList: [testTasks.task1, testTasks.task2],
  
  usersList: [testUsers.owner, testUsers.admin, testUsers.viewer],
  
  auditLogs: [
    {
      id: 'audit-123',
      action: 'LOGIN',
      resource: 'user',
      resourceId: testUsers.admin.id,
      userId: testUsers.admin.id,
      timestamp: new Date('2024-01-01T10:00:00Z'),
      details: { ip: '127.0.0.1', userAgent: 'test-agent' }
    }
  ]
};
