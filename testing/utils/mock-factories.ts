import { User } from '../../libs/data/src/lib/user.entity';
import { Task } from '../../libs/data/src/lib/task.entity';
import { Role } from '../../libs/data/src/lib/role.entity';
import { Permission } from '../../libs/data/src/lib/permission.entity';

// Mock factories for creating test data

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      roles: ['viewer'],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createOwner(overrides: Partial<User> = {}): User {
    return this.create({
      email: 'owner@example.com',
      firstName: 'Owner',
      lastName: 'User',
      roles: ['owner'],
      ...overrides
    });
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: ['admin'],
      ...overrides
    });
  }

  static createViewer(overrides: Partial<User> = {}): User {
    return this.create({
      email: 'viewer@example.com',
      firstName: 'Viewer',
      lastName: 'User',
      roles: ['viewer'],
      ...overrides
    });
  }
}

export class TaskFactory {
  static create(overrides: Partial<Task> = {}): Task {
    return {
      id: 'task-' + Math.random().toString(36).substr(2, 9),
      title: 'Test Task',
      description: 'Test task description',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      assignedTo: 'user-123',
      createdBy: 'user-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createHighPriority(overrides: Partial<Task> = {}): Task {
    return this.create({
      title: 'High Priority Task',
      priority: 'high',
      ...overrides
    });
  }

  static createCompleted(overrides: Partial<Task> = {}): Task {
    return this.create({
      title: 'Completed Task',
      status: 'completed',
      ...overrides
    });
  }
}

export class RoleFactory {
  static create(overrides: Partial<Role> = {}): Role {
    return {
      id: 'role-' + Math.random().toString(36).substr(2, 9),
      type: 'viewer',
      name: 'Test Role',
      description: 'Test role description',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createOwner(overrides: Partial<Role> = {}): Role {
    return this.create({
      type: 'owner',
      name: 'Owner',
      description: 'Full system access',
      ...overrides
    });
  }

  static createAdmin(overrides: Partial<Role> = {}): Role {
    return this.create({
      type: 'admin',
      name: 'Administrator',
      description: 'Management access',
      ...overrides
    });
  }

  static createViewer(overrides: Partial<Role> = {}): Role {
    return this.create({
      type: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      ...overrides
    });
  }
}

export class PermissionFactory {
  static create(overrides: Partial<Permission> = {}): Permission {
    return {
      id: 'perm-' + Math.random().toString(36).substr(2, 9),
      resource: 'task',
      action: 'read',
      description: 'Test permission',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }

  static createTaskPermission(action: string, overrides: Partial<Permission> = {}): Permission {
    return this.create({
      resource: 'task',
      action,
      description: `${action} tasks`,
      ...overrides
    });
  }

  static createUserPermission(action: string, overrides: Partial<Permission> = {}): Permission {
    return this.create({
      resource: 'user',
      action,
      description: `${action} users`,
      ...overrides
    });
  }
}

// Mock service factories
export class MockAuthService {
  static create() {
    return {
      validateUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn()
    };
  }
}

export class MockTaskService {
  static create() {
    return {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assignTask: jest.fn(),
      getTasksByUser: jest.fn()
    };
  }
}

export class MockUsersService {
  static create() {
    return {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findByEmail: jest.fn()
    };
  }
}

export class MockAuditService {
  static create() {
    return {
      log: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findByResource: jest.fn(),
      findByAction: jest.fn()
    };
  }
}

// HTTP mock factories
export class MockHttpClient {
  static create() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    };
  }
}

export class MockRouter {
  static create() {
    return {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
      url: '/test',
      isActive: jest.fn()
    };
  }
}

export class MockActivatedRoute {
  static create() {
    return {
      params: { subscribe: jest.fn() },
      queryParams: { subscribe: jest.fn() },
      snapshot: {
        params: {},
        queryParams: {}
      }
    };
  }
}
