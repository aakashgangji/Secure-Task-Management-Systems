# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All API endpoints (except login and register) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Test Accounts

The system comes with pre-seeded test accounts:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| Owner | owner_saniya@turbovets.com | password123 | Full access to all features |
| Admin | admin_aakash@turbovets.com | password123 | Most permissions except organization management |
| Viewer | viewer_joey@turbovets.com | password123 | Read-only access |

## Endpoints

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin_aakash@turbovets.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin_aakash@turbovets.com",
    "firstName": "Fnu",
    "lastName": "Aakash",
    "roles": ["admin"]
  }
}
```

#### POST /auth/logout
Logout user and log the event.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin_aakash@turbovets.com",
  "firstName": "Fnu",
  "lastName": "Aakash",
  "roles": ["admin"],
  "userRoles": [
    {
      "role": {
        "id": "role-id",
        "type": "admin",
        "name": "Administrator"
      }
    }
  ]
}
```

### Task Endpoints

#### GET /tasks
Get all tasks accessible to the current user. Returns different results based on user role:
- **Owner/Admin**: All tasks in the system
- **Viewer**: Only tasks assigned to them

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "in_progress",
    "priority": "high",
    "category": "work",
    "dueDate": "2025-10-18T16:00:00.000Z",
    "createdAt": "2025-10-18T16:00:00.000Z",
    "updatedAt": "2025-10-18T16:00:00.000Z",
    "createdBy": {
      "id": "uuid",
      "firstName": "Fnu",
      "lastName": "Aakash",
      "email": "admin_aakash@turbovets.com"
    },
    "assignments": [
      {
        "id": "assignment-id",
        "user": {
          "id": "user-id",
          "firstName": "Saniya",
          "lastName": "Sharma",
          "email": "owner_saniya@turbovets.com"
        }
      },
      {
        "id": "assignment-id-2",
        "user": {
          "id": "user-id-2",
          "firstName": "Joey",
          "lastName": "Bergs",
          "email": "viewer_joey@turbovets.com"
        }
      }
    ]
  }
]
```

#### POST /tasks
Create a new task with multi-user assignment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "category": "work",
  "dueDate": "2025-10-18T16:00:00.000Z",
  "assignedToEmails": ["owner_saniya@turbovets.com", "viewer_joey@turbovets.com"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "category": "work",
  "dueDate": "2025-10-18T16:00:00.000Z",
  "createdAt": "2025-10-18T16:00:00.000Z",
  "updatedAt": "2025-10-18T16:00:00.000Z",
  "assignments": [
    {
      "id": "assignment-id",
      "user": {
        "id": "user-id",
        "firstName": "Saniya",
        "lastName": "Sharma",
        "email": "owner_saniya@turbovets.com"
      }
    }
  ]
}
```

#### GET /tasks/:id
Get a specific task by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Task Title",
  "description": "Task description",
  "status": "in_progress",
  "priority": "high",
  "category": "work",
  "dueDate": "2025-10-18T16:00:00.000Z",
  "createdAt": "2025-10-18T16:00:00.000Z",
  "updatedAt": "2025-10-18T16:00:00.000Z",
  "createdBy": {
    "id": "uuid",
    "firstName": "Fnu",
    "lastName": "Aakash",
    "email": "admin_aakash@turbovets.com"
  },
  "assignments": [
    {
      "id": "assignment-id",
      "user": {
        "id": "user-id",
        "firstName": "Saniya",
        "lastName": "Sharma",
        "email": "owner_saniya@turbovets.com"
      }
    }
  ]
}
```

#### PATCH /tasks/:id
Update a task with multi-user assignment support.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "completed",
  "priority": "low",
  "assignedToEmails": ["owner_saniya@turbovets.com"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Updated Task Title",
  "description": "Task description",
  "status": "completed",
  "priority": "low",
  "category": "work",
  "dueDate": "2025-10-18T16:00:00.000Z",
  "createdAt": "2025-10-18T16:00:00.000Z",
  "updatedAt": "2025-10-18T16:00:00.000Z",
  "assignments": [
    {
      "id": "assignment-id",
      "user": {
        "id": "user-id",
        "firstName": "Saniya",
        "lastName": "Sharma",
        "email": "owner_saniya@turbovets.com"
      }
    }
  ]
}
```

#### DELETE /tasks/:id
Delete a task.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

### User Management Endpoints

#### GET /users
Get all users (Admin/Owner only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "owner_saniya@turbovets.com",
    "firstName": "Saniya",
    "lastName": "Sharma",
    "status": "active",
    "createdAt": "2025-10-18T16:00:00.000Z",
    "updatedAt": "2025-10-18T16:00:00.000Z",
    "userRoles": [
      {
        "role": {
          "id": "role-id",
          "type": "owner",
          "name": "Owner"
        }
      }
    ]
  },
  {
    "id": "uuid-2",
    "email": "admin_aakash@turbovets.com",
    "firstName": "Fnu",
    "lastName": "Aakash",
    "status": "active",
    "createdAt": "2025-10-18T16:00:00.000Z",
    "updatedAt": "2025-10-18T16:00:00.000Z",
    "userRoles": [
      {
        "role": {
          "id": "role-id-2",
          "type": "admin",
          "name": "Administrator"
        }
      }
    ]
  }
]
```

#### GET /users/:id
Get a specific user by ID (Admin/Owner only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "admin_aakash@turbovets.com",
  "firstName": "Fnu",
  "lastName": "Aakash",
  "status": "active",
  "createdAt": "2025-10-18T16:00:00.000Z",
  "updatedAt": "2025-10-18T16:00:00.000Z",
  "userRoles": [
    {
      "role": {
        "id": "role-id",
        "type": "admin",
        "name": "Administrator"
      }
    }
  ]
}
```

#### POST /users
Create a new user (Admin/Owner only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newuser@turbovets.com",
  "password": "securepassword123",
  "firstName": "New",
  "lastName": "User",
  "roles": ["viewer"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newuser@turbovets.com",
  "firstName": "New",
  "lastName": "User",
  "status": "active",
  "createdAt": "2025-10-18T16:00:00.000Z",
  "updatedAt": "2025-10-18T16:00:00.000Z",
  "userRoles": [
    {
      "role": {
        "id": "role-id",
        "type": "viewer",
        "name": "Viewer"
      }
    }
  ]
}
```

#### DELETE /users/:id
Delete a user (Admin/Owner only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```
204 No Content
```

### Audit Log Endpoints

#### GET /audit-log
Get audit logs (Admin/Owner only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `action` (optional): Filter by action type
- `resource` (optional): Filter by resource type
- `userId` (optional): Filter by user ID

**Response:**
```json
[
  {
    "id": "log-id",
    "action": "login",
    "resource": "auth",
    "resourceId": "user-id",
    "details": "User admin_aakash@turbovets.com logged in",
    "timestamp": "2025-10-18T16:00:00.000Z",
    "userId": "user-id",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  },
  {
    "id": "log-id-2",
    "action": "create",
    "resource": "task",
    "resourceId": "task-id",
    "details": "Task created: Complete project documentation",
    "timestamp": "2025-10-18T16:00:00.000Z",
    "userId": "user-id",
    "ipAddress": "127.0.0.1",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email address",
    "password must be at least 6 characters long"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Data Models

### Task Status
- `todo`: Task is not started
- `in_progress`: Task is being worked on
- `completed`: Task is finished
- `cancelled`: Task was cancelled

### Task Priority
- `low`: Low priority task
- `medium`: Medium priority task
- `high`: High priority task
- `urgent`: Urgent task

### Task Category
- `work`: Work-related task
- `personal`: Personal task
- `project`: Project-related task
- `meeting`: Meeting-related task

### User Roles
- `owner`: Organization owner with full access
- `admin`: Administrator with most permissions
- `viewer`: Read-only access

### User Status
- `active`: User account is active
- `inactive`: User account is inactive
- `suspended`: User account is suspended

## Role-Based Access Control (RBAC)

### Permission Matrix

| Resource | Action | Owner | Admin | Viewer |
|----------|--------|-------|-------|--------|
| Tasks | Create | ✅ | ✅ | ❌ |
| Tasks | Read | ✅ | ✅ | ✅ |
| Tasks | Update | ✅ | ✅ | ❌ |
| Tasks | Delete | ✅ | ✅ | ❌ |
| Users | Create | ✅ | ✅ | ❌ |
| Users | Read | ✅ | ✅ | ❌ |
| Users | Update | ✅ | ✅ | ❌ |
| Users | Delete | ✅ | ✅ | ❌ |
| Audit Logs | Read | ✅ | ✅ | ❌ |
| Organizations | Manage | ✅ | ❌ | ❌ |

### Task Assignment Rules
- **Owner/Admin**: Can assign tasks to any user
- **Viewer**: Cannot assign tasks to others
- **Multi-user Assignment**: Tasks can be assigned to multiple users simultaneously
- **Assignment Updates**: Existing assignments are replaced when updating task assignments

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

The API is configured to accept requests from:
- `http://localhost:4200` (Angular development server)
- `http://localhost:3001` (Alternative frontend)

## Security Headers

The API includes basic security headers. In production, consider adding:
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Database Schema

### Key Relationships
- **Users ↔ Roles**: Many-to-many relationship via `user_roles` table
- **Tasks ↔ Users**: Many-to-many relationship via `task_assignments` table
- **Users → Tasks**: One-to-many relationship for task creators
- **Users → AuditLogs**: One-to-many relationship for audit trail

### Foreign Key Constraints
- User deletion cascades to related `user_roles` and `audit_logs`
- Task assignments are properly cleaned up when users or tasks are deleted
- Audit logs maintain referential integrity with user records

## Development Notes

### JWT Token Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "roles": ["admin"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Password Security
- Passwords are hashed using bcrypt with salt rounds of 10
- Password validation requires minimum 6 characters
- Password is never returned in API responses

### Audit Logging
- All user actions are logged with timestamps and metadata
- IP addresses and user agents are captured for security
- Audit logs are immutable and cannot be modified
- Logs are automatically cleaned up when users are deleted

---

**Note**: This API documentation reflects the current implementation. For the most up-to-date information, refer to the source code and test the endpoints directly.