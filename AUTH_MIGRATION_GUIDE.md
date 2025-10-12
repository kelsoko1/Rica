# Rica Authentication System Migration

## Overview

This document explains the migration from Firebase-based authentication to PostgreSQL-based authentication in Rica. The new system provides better reliability, full control over data, and seamless integration with the existing multi-tenancy architecture.

## Why PostgreSQL Instead of Firebase?

### Advantages of PostgreSQL Authentication

1. **Reliability**: No external dependency failures affecting login/registration
2. **Data Control**: Full ownership and control of user data
3. **Integration**: Seamless integration with existing Rica services and multi-tenancy
4. **Performance**: Better performance for complex queries and user management
5. **Security**: Enhanced security through direct database control
6. **Cost**: No external service costs for authentication

### Disadvantages Addressed

- **Landing Page Failures**: Firebase outages no longer affect Rica landing
- **Authentication Delays**: Faster local authentication processing
- **Data Isolation**: Better multi-tenant data isolation
- **Scalability**: Better horizontal scaling capabilities

## Architecture

### Database Schema

The new authentication system uses three main tables:

```sql
-- Core user authentication data
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  first_name, last_name,
  is_active, is_verified,
  verification_token, reset_token,
  last_login, created_at, updated_at
)

-- User session management
user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_token VARCHAR(255) UNIQUE,
  device_info JSONB,
  ip_address INET,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Extended user profile data
user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  subscription_tier VARCHAR(50),
  credits_remaining DECIMAL(10,2),
  max_credits DECIMAL(10,2),
  tenant_id VARCHAR(255),
  preferences JSONB,
  created_at, updated_at
)
```

### Authentication Flow

1. **Registration**: User submits email/password → Password hashed with bcrypt → User record created → Email verification sent
2. **Login**: Email/password validated → JWT token generated → Session record created → User profile returned
3. **Session Management**: Session tokens validated against database → Automatic cleanup of expired sessions
4. **Password Security**: Bcrypt hashing with salt rounds for maximum security

## Migration Guide

### Step 1: Database Setup

Run the database initialization script:

```bash
# Linux/Mac
./init-auth-db.sh

# Windows
init-auth-db.bat
```

Or manually:

```bash
# Start PostgreSQL container
docker-compose -f docker-compose.auth-postgres.yml up -d

# Initialize database tables
docker exec rica-auth-postgres psql -U postgres -d rica_auth -f init-auth.sql
```

### Step 2: Install Dependencies

```bash
cd rica-api
npm install
```

### Step 3: Environment Configuration

Update your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=rica_auth
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Step 4: Start Services

```bash
# Start the authentication database
docker-compose -f docker-compose.auth-postgres.yml up -d

# Start the Rica API server
cd rica-api
npm start
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/verify-email` | Verify email address |
| GET | `/api/auth/profile` | Get user profile (requires auth) |

### Example Usage

#### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

## Security Features

### Password Security
- **Bcrypt Hashing**: 12 salt rounds for maximum security
- **Password Requirements**: Enforced on frontend (8+ chars, mixed case, numbers, symbols)
- **No Plain Text Storage**: Passwords never stored in plain text

### Session Management
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Session Records**: Database-tracked sessions for device management
- **Automatic Cleanup**: Expired sessions automatically removed

### Rate Limiting
- **Registration/Login**: 5 attempts per 15 minutes per IP
- **API Access**: 100 requests per 15 minutes per IP
- **Brute Force Protection**: Progressive delays after failed attempts

## Integration with Existing Systems

### Multi-Tenancy
- User profiles linked to tenant IDs
- Subscription tiers managed per user
- Credit system integrated with user accounts

### Credit Management
- Credits tracked per user in `user_profiles` table
- Automatic credit deduction for service usage
- Credit monitoring and suspension

### Tenant Provisioning
- Users can provision tenants after authentication
- Tenant ownership tracked in user profiles
- Resource allocation based on subscription tier

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check container logs
docker logs rica-auth-postgres

# Test database connection
docker exec rica-auth-postgres psql -U postgres -d rica_auth -c "SELECT 1;"
```

#### Authentication Failures
```bash
# Check if tables exist
docker exec rica-auth-postgres psql -U postgres -d rica_auth -c "\dt"

# Verify user exists
docker exec rica-auth-postgres psql -U postgres -d rica_auth -c "SELECT email FROM users;"
```

#### Port Conflicts
- Authentication database runs on port 5433 (main database on 5432)
- API server runs on port 3001
- Ensure no conflicts with existing services

## Performance Considerations

### Database Optimization
- **Indexes**: Created on frequently queried columns (email, session_token, etc.)
- **Connection Pooling**: Configurable connection pool for better performance
- **Query Optimization**: Efficient queries for user lookup and session validation

### Scalability
- **Horizontal Scaling**: Multiple API server instances supported
- **Database Replication**: PostgreSQL supports read replicas for scaling
- **Caching**: JWT tokens reduce database lookups for authenticated requests

## Backup and Recovery

### Database Backups
```bash
# Create backup
docker exec rica-auth-postgres pg_dump -U postgres rica_auth > rica_auth_backup.sql

# Restore backup
docker exec -i rica-auth-postgres psql -U postgres rica_auth < rica_auth_backup.sql
```

### Data Migration
If migrating from Firebase:
1. Export user data from Firebase
2. Transform data to match new schema
3. Import users with hashed passwords
4. Update any existing sessions/tokens

## Future Enhancements

### Planned Features
- **OAuth Integration**: Google, GitHub, Microsoft login
- **Two-Factor Authentication**: SMS and app-based 2FA
- **Advanced Password Policies**: Custom complexity requirements
- **Account Recovery**: Enhanced password reset flow
- **User Roles and Permissions**: Granular access control

### Monitoring and Analytics
- **Authentication Metrics**: Login/logout tracking
- **Security Monitoring**: Failed attempt monitoring
- **Performance Metrics**: Database query performance

## Support

For issues with the new authentication system:
1. Check the troubleshooting section above
2. Review container logs: `docker logs rica-auth-postgres`
3. Check API logs: `docker logs rica-api`
4. Verify database connectivity and table structure

The PostgreSQL-based authentication system provides a robust, scalable, and reliable foundation for Rica's user management needs.
