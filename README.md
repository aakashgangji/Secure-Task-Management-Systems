# Secure Task Management System

A comprehensive task management system built with role-based access control (RBAC) using NX monorepo architecture.

## Setup Instructions

### Prerequisites
- Node.js (v20.17.0 or higher)
- npm (v10.8.2 or higher)

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Database Configuration
DB_TYPE=sqlite
DB_DATABASE=taskmanager.db
DB_SYNCHRONIZE=true
DB_LOGGING=true

# API Configuration
API_PORT=3001
API_HOST=localhost

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

### 3. Start the Backend API

```bash
# Start the NestJS API server
npx nx serve api

# The API will be available at http://localhost:3001
```

### 4. Start the Frontend Dashboard

```bash
# Start the Angular dashboard
npx nx serve dashboard

# The dashboard will be available at http://localhost:4200
```

### 5. Run Tests

```bash
# Run all tests
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### 6. Access the Application

1. Open your browser and navigate to `http://localhost:4200`
2. Use the pre-seeded test accounts to log in:

**Test accounts:**

- **Owner**: `owner_saniya@turbovets.com` / `password123`
- **Admin**: `admin_aakash@turbovets.com` / `password123`
- **Viewer**: `viewer_joey@turbovets.com` / `password123`
- **Viewer**: `test@turbovets.com` / `password123`

## Architecture Overview

### NX Monorepo Layout and Rationale

This project follows a modular NX monorepo structure designed for scalability and maintainability:

```
faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/
├── apps/
│   ├── api/                    # NestJS backend API
│   └── dashboard/             # Angular frontend
├── libs/
│   ├── data/                  # Shared TypeScript interfaces & DTOs
│   └── auth/                  # Reusable RBAC logic and decorators
└── dist/                      # Build outputs (generated)
```

#### Why NX Monorepo?

1. **Code Sharing**: Shared libraries eliminate duplication between frontend and backend
2. **Type Safety**: TypeScript interfaces shared across the entire stack
3. **Consistent Builds**: Single build system for all applications
4. **Dependency Management**: Centralized package management
5. **Developer Experience**: Single repository for full-stack development

### Shared Libraries/Modules

#### `libs/data/` - Data Layer
- **Purpose**: Centralized data models and DTOs
- **Contents**: 
  - TypeORM entities (User, Task, Organization, etc.)
  - DTOs for API requests/responses
  - Enums and interfaces
- **Benefits**: Type safety across frontend and backend

#### `libs/auth/` - Authentication Layer
- **Purpose**: Reusable authentication and authorization logic
- **Contents**:
  - JWT authentication guards
  - RBAC decorators and guards
  - Audit logging service
- **Benefits**: Consistent security implementation

## Data Model Explanation

### Database Schema

The system uses a relational database with the following entities:

#### Core Entities

**Users**
- Primary key: `id` (UUID)
- Authentication: `email`, `password` (hashed)
- Profile: `firstName`, `lastName`, `status`
- Relationships: Many-to-many with Roles, One-to-many with Tasks

**Organizations**
- Primary key: `id` (UUID)
- Hierarchy: Self-referencing with `parentId`
- Relationships: One-to-many with Users

**Roles**
- Primary key: `id` (UUID)
- Types: `owner`, `admin`, `viewer`
- Relationships: Many-to-many with Users and Permissions

**Tasks**
- Primary key: `id` (UUID)
- Content: `title`, `description`, `status`, `priority`, `category`
- Relationships: Many-to-one with Users (creator), Many-to-many with Users (assignments)

**TaskAssignments**
- Junction table for many-to-many relationship between Tasks and Users
- Tracks when users are assigned to tasks

**AuditLogs**
- Security and compliance tracking
- Records all user actions with timestamps and metadata

### Entity Relationship Diagram

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Users     │    │ UserRoles    │    │    Roles    │
│             │◄───┤              ├───►│             │
│ - id        │    │ - userId     │    │ - id        │
│ - email     │    │ - roleId     │    │ - type      │
│ - password  │    │ - assignedAt │    │ - name      │
│ - firstName │    └──────────────┘    │ - desc      │
│ - lastName  │                        └─────────────┘
│ - status    │
└─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐    ┌───────────────┐    ┌─────────────┐
│   Tasks     │    │TaskAssignments│    │   Users     │
│             │◄───┤               ├───►│             │
│ - id        │    │ - taskId      │    │ - id        │
│ - title     │    │ - userId      │    │ - email     │
│ - desc      │    │ - assignedAt  │    │ - firstName │
│ - status    │    └───────────────┘    │ - lastName  │
│ - priority  │                         └─────────────┘
│ - category  │
│ - createdBy │
└─────────────┘
```

## Access Control Implementation

### Role Hierarchy

The system implements a three-tier role hierarchy:

#### 1. Owner Role (Highest Authority)
- **Permissions**: Full system access
- **Capabilities**:
  - Manage organizations and users
  - View all tasks and audit logs
  - Perform all CRUD operations
  - System administration

#### 2. Admin Role (Management Authority)
- **Permissions**: Most system operations
- **Capabilities**:
  - Manage tasks and users
  - View audit logs
  - Create and assign tasks to multiple users
  - Cannot manage organizations

#### 3. Viewer Role (Read-Only)
- **Permissions**: Limited read access
- **Capabilities**:
  - View tasks assigned to them
  - Read-only access to their profile
  - Cannot create, update, or delete resources

### Permission Matrix

| Resource | Action | Owner | Admin | Viewer |
|----------|--------|-------|-------|--------|
|   Tasks  | Create |  ✅   |  ✅    |   ❌   |
|   Tasks  |  Read  |  ✅   |  ✅    |   ✅   |
|   Tasks  | Update |  ✅   |  ✅    |   ❌   |
|   Tasks  | Delete |  ✅   |  ✅    |   ❌   |
|   Users  | Create |  ✅   |  ✅    |   ❌   |
|   Users  |  Read  |  ✅   |  ✅    |   ❌   |
|   Users  | Update |  ✅   |  ✅    |   ❌   |
|   Users  | Delete |  ✅   |  ✅    |   ❌   |
|Audit Logs|  Read  |  ✅   |  ✅    |   ❌   |
|Organizations|Manage| ✅   |  ❌    |   ❌   |

### JWT Authentication Integration

#### Token Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["admin"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

#### Authentication Flow
1. **Login**: User provides credentials
2. **Validation**: Backend validates with bcrypt
3. **Token Generation**: JWT created with user info and roles
4. **Token Storage**: Frontend stores in localStorage
5. **Request Authorization**: Token sent in Authorization header
6. **Permission Check**: RBAC guard validates permissions

#### Security Features
- **Password Hashing**: bcrypt with salt rounds of 10
- **Token Expiration**: 24-hour token lifetime
- **Role-based Access**: Permissions checked on every request
- **Audit Logging**: All authentication events tracked

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "admin_aakash@turbovets.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "admin_aakash@turbovets.com",
    "firstName": "Fnu",
    "lastName": "Aakash",
    "roles": ["admin"]
  }
}
```

#### POST /api/auth/logout
**Description**: Logout user and log the event

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/profile
**Description**: Get current user profile

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "id": "user-id",
  "email": "admin_aakash@turbovets.com",
  "firstName": "Fnu",
  "lastName": "Aakash",
  "roles": ["admin"],
  "userRoles": [...]
}
```

### Task Management Endpoints

#### GET /api/tasks
**Description**: Get tasks (scoped by user role)

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
[
  {
    "id": "task-id",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "in_progress",
    "priority": "high",
    "category": "work",
    "dueDate": "2025-10-18T16:00:00.000Z",
    "createdBy": {
      "id": "creator-id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "assignedTo": {
      "id": "assignee-id",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "assignments": [
      {
        "id": "assignment-id",
        "user": {
          "id": "user-id",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    ]
  }
]
```

#### POST /api/tasks
**Description**: Create a new task

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "category": "work",
  "dueDate": "2025-10-18T16:00:00.000Z",
  "assignedToEmails": ["user1@example.com", "user2@example.com"]
}
```

**Response**: Created task object

#### PATCH /api/tasks/:id
**Description**: Update an existing task

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "Updated Task Title",
  "status": "completed",
  "assignedToEmails": ["user1@example.com"]
}
```

**Response**: Updated task object

#### DELETE /api/tasks/:id
**Description**: Delete a task

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

### User Management Endpoints

#### GET /api/users
**Description**: Get all users (Admin/Owner only)

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
[
  {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "userRoles": [
      {
        "role": {
          "type": "admin",
          "name": "Administrator"
        }
      }
    ]
  }
]
```

#### POST /api/users
**Description**: Create a new user (Admin/Owner only)

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "firstName": "New",
  "lastName": "User",
  "roles": ["viewer"]
}
```

**Response**: Created user object (without password)

#### DELETE /api/users/:id
**Description**: Delete a user (Admin/Owner only)

**Headers**: `Authorization: Bearer <token>`

**Response**: `204 No Content`

### Audit Log Endpoints

#### GET /api/audit-log
**Description**: Get audit logs (Admin/Owner only)

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `action`: Filter by action type
- `resource`: Filter by resource type

**Response**:
```json
[
  {
    "id": "log-id",
    "action": "login",
    "resource": "auth",
    "resourceId": "user-id",
    "details": "User admin@example.com logged in",
    "timestamp": "2025-10-18T16:00:00.000Z",
    "userId": "user-id",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
]
```

## Future Considerations

### Advanced Role Delegation
- **Temporary Permissions**: Time-limited role assignments
- **Delegation Chains**: Hierarchical permission delegation
- **Context-Aware Roles**: Role permissions based on organizational context
- **Dynamic Role Assignment**: Runtime role modifications

### Production-Ready Security Enhancements

#### JWT Refresh Tokens
```typescript
// Implementation example
interface TokenPair {
  accessToken: string;    // Short-lived (15 minutes)
  refreshToken: string;    // Long-lived (7 days)
}

// Refresh token rotation for enhanced security
async refreshAccessToken(refreshToken: string): Promise<TokenPair>
```

#### CSRF Protection
```typescript
// CSRF token implementation
@UseGuards(CsrfGuard)
@Post('/api/tasks')
async createTask(@Body() taskData: CreateTaskDto) {
  // CSRF token validated automatically
}
```

#### RBAC Caching
```typescript
// Redis-based permission caching
@Injectable()
export class CachedRbacGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const cacheKey = `permissions:${userId}:${resource}:${action}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const hasPermission = await this.checkPermissions(user, resource, action);
    await this.redis.setex(cacheKey, 300, hasPermission); // 5-minute cache
    
    return hasPermission;
  }
}
```

### Scaling Permission Checks Efficiently

#### Database Optimization
```sql
-- Indexed permission queries
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
```

#### Microservice Architecture
```typescript
// Permission service separation
@Injectable()
export class PermissionService {
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    // Dedicated permission service with optimized queries
  }
}
```

#### Caching Strategy
```typescript
// Multi-level caching
interface CacheStrategy {
  L1: Map<string, boolean>;           // In-memory cache
  L2: Redis;                          // Distributed cache
  L3: Database;                       // Persistent storage
}
```

## Technology Stack

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeORM**: Object-Relational Mapping
- **SQLite**: Lightweight database
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **class-validator**: DTO validation

### Frontend
- **Angular**: Modern web framework
- **TailwindCSS**: Utility-first CSS framework
- **RxJS**: Reactive programming
- **Angular Router**: Client-side routing
- **Angular Forms**: Form handling and validation

## Deployment

### Backend Deployment
```bash
# Build the API
nx build api

# Start production server
node dist/apps/api/main.js
```

### Frontend Deployment
```bash
# Build the dashboard
nx build dashboard

# Serve static files
npx serve dist/apps/dashboard
```

---

**Note**: This is a demonstration project showcasing secure task management with RBAC implementation. In production, consider additional security measures like rate limiting, input sanitization, and comprehensive error handling.