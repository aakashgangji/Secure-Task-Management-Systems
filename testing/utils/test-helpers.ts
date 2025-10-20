import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { User } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';

// Test helper utilities

export class TestHelpers {
  /**
   * Create a mock execution context for testing guards
   */
  static createMockExecutionContext(user?: User, permissions?: any[]): ExecutionContext {
    const mockRequest = {
      user: user || null,
      headers: {},
      body: {},
      params: {},
      query: {}
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
        getNext: () => jest.fn()
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      getArgs: () => [mockRequest],
      getArgByIndex: (index: number) => (index === 0 ? mockRequest : {}),
      switchToRpc: () => ({}),
      switchToWs: () => ({})
    } as ExecutionContext;

    return mockContext;
  }

  /**
   * Create a mock reflector for testing decorators
   */
  static createMockReflector(permissions?: any[]): Reflector {
    return {
      getAllAndOverride: jest.fn().mockReturnValue(permissions || []),
      getAllAndMerge: jest.fn().mockReturnValue(permissions || []),
      get: jest.fn().mockReturnValue(permissions || []),
      has: jest.fn().mockReturnValue(!!permissions)
    } as any;
  }

  /**
   * Create a testing module with common providers
   */
  static async createTestingModule(providers: any[] = []): Promise<TestingModule> {
    return Test.createTestingModule({
      providers: [
        Reflector,
        ...providers
      ]
    }).compile();
  }

  /**
   * Mock JWT payload
   */
  static createJwtPayload(user: User) {
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
  }

  /**
   * Mock HTTP request with JWT token
   */
  static createMockRequest(user?: User, token?: string) {
    return {
      user: user || null,
      headers: {
        authorization: token ? `Bearer ${token}` : undefined
      },
      body: {},
      params: {},
      query: {}
    };
  }

  /**
   * Mock HTTP response
   */
  static createMockResponse() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    return res;
  }

  /**
   * Wait for async operations to complete
   */
  static async waitFor(ms: number = 0): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a mock database connection
   */
  static createMockDatabase() {
    return {
      getRepository: jest.fn(),
      createQueryBuilder: jest.fn(),
      transaction: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      count: jest.fn()
    };
  }

  /**
   * Mock TypeORM repository
   */
  static createMockRepository() {
    return {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getOne: jest.fn(),
        getCount: jest.fn()
      }))
    };
  }

  /**
   * Mock Angular HTTP client
   */
  static createMockHttpClient() {
    return {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn()
    };
  }

  /**
   * Mock Angular router
   */
  static createMockRouter() {
    return {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
      url: '/test',
      isActive: jest.fn(),
      events: {
        subscribe: jest.fn()
      }
    };
  }

  /**
   * Mock Angular activated route
   */
  static createMockActivatedRoute() {
    return {
      params: { subscribe: jest.fn() },
      queryParams: { subscribe: jest.fn() },
      snapshot: {
        params: {},
        queryParams: {},
        url: []
      }
    };
  }

  /**
   * Mock Angular form control
   */
  static createMockFormControl(value: any = '') {
    return {
      value,
      setValue: jest.fn(),
      patchValue: jest.fn(),
      reset: jest.fn(),
      markAsTouched: jest.fn(),
      markAsUntouched: jest.fn(),
      markAsDirty: jest.fn(),
      markAsPristine: jest.fn(),
      updateValueAndValidity: jest.fn(),
      hasError: jest.fn(),
      getError: jest.fn(),
      valid: true,
      invalid: false,
      touched: false,
      untouched: true,
      dirty: false,
      pristine: true,
      pending: false,
      disabled: false,
      enabled: true,
      errors: null,
      status: 'VALID'
    };
  }

  /**
   * Mock Angular form group
   */
  static createMockFormGroup(controls: any = {}) {
    return {
      controls,
      value: {},
      setValue: jest.fn(),
      patchValue: jest.fn(),
      reset: jest.fn(),
      markAsTouched: jest.fn(),
      markAsUntouched: jest.fn(),
      markAsDirty: jest.fn(),
      markAsPristine: jest.fn(),
      updateValueAndValidity: jest.fn(),
      hasError: jest.fn(),
      getError: jest.fn(),
      get: jest.fn(),
      addControl: jest.fn(),
      removeControl: jest.fn(),
      setControl: jest.fn(),
      contains: jest.fn(),
      valid: true,
      invalid: false,
      touched: false,
      untouched: true,
      dirty: false,
      pristine: true,
      pending: false,
      disabled: false,
      enabled: true,
      errors: null,
      status: 'VALID'
    };
  }

  /**
   * Create a mock observable
   */
  static createMockObservable(data: any) {
    return {
      subscribe: jest.fn((callback) => {
        callback(data);
        return { unsubscribe: jest.fn() };
      }),
      pipe: jest.fn().mockReturnThis(),
      map: jest.fn().mockReturnThis(),
      catchError: jest.fn().mockReturnThis(),
      tap: jest.fn().mockReturnThis(),
      switchMap: jest.fn().mockReturnThis(),
      mergeMap: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      debounceTime: jest.fn().mockReturnThis(),
      distinctUntilChanged: jest.fn().mockReturnThis()
    };
  }

  /**
   * Create a mock promise
   */
  static createMockPromise(data: any, shouldReject: boolean = false) {
    return shouldReject 
      ? Promise.reject(data)
      : Promise.resolve(data);
  }

  /**
   * Mock localStorage
   */
  static mockLocalStorage() {
    const store: { [key: string]: string } = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          Object.keys(store).forEach(key => delete store[key]);
        }),
        length: Object.keys(store).length,
        key: jest.fn((index: number) => Object.keys(store)[index] || null)
      },
      writable: true
    });
  }

  /**
   * Mock sessionStorage
   */
  static mockSessionStorage() {
    const store: { [key: string]: string } = {};
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          Object.keys(store).forEach(key => delete store[key]);
        }),
        length: Object.keys(store).length,
        key: jest.fn((index: number) => Object.keys(store)[index] || null)
      },
      writable: true
    });
  }
}
