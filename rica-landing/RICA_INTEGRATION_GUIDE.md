# Rica Integration Guide

This guide explains how the Rica landing page integrates with the Rica UI application.

## Overview

The Rica landing page serves as the marketing and user acquisition frontend for the Rica security intelligence platform. It provides information about features, pricing, and company details, as well as user authentication functionality. Once users are authenticated, they are redirected to the Rica UI application, which is the main product interface.

## Architecture

The integration between the Rica landing page and Rica UI follows a microservices architecture:

1. **Rica Landing Page** - React application for marketing and user authentication
2. **Rica UI** - Main application for the security intelligence platform
3. **Shared Authentication** - Both applications use the same authentication system

## Integration Points

### Authentication Flow

1. **User Registration**:
   - User fills out the signup form on the landing page
   - Form data is sent to the authentication API
   - Upon successful registration, the user is redirected to the Rica UI

2. **User Login**:
   - User enters credentials on the login page
   - Credentials are validated by the authentication API
   - Upon successful login, the user is redirected to the Rica UI

3. **Session Management**:
   - Authentication tokens are stored in localStorage
   - Both applications check for valid tokens
   - If a token exists, the user is considered authenticated

4. **Automatic Redirection**:
   - When an authenticated user visits the landing page, they are automatically redirected to the Rica UI
   - When an unauthenticated user tries to access protected routes in either application, they are redirected to the login page

### API Integration

Both applications use the same API endpoints for authentication:

- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/validate` - Validate authentication token
- `POST /api/auth/logout` - Log out user

### UI/UX Consistency

To maintain a consistent user experience:

1. **Shared Design System**:
   - Both applications use the same color scheme, typography, and component styles
   - Material UI is used as the component library in both applications

2. **Consistent Navigation**:
   - The header in both applications shows the user's profile information when logged in
   - Both applications provide a way to navigate between them

## Configuration

### Development Environment

In development, the applications are configured as follows:

- Rica Landing Page: `http://localhost:3030`
- Rica UI: `http://localhost:3000`
- API Server: `http://localhost:8080`

### Production Environment

In production, the applications are deployed to:

- Rica Landing Page: `https://rica.io`
- Rica UI: `https://app.rica.io`
- API Server: `https://api.rica.io`

## Implementation Details

### Authentication Context

The `AuthContext` provides:

```jsx
const { currentUser, login, signup, logout, loading, error } = useAuth();
```

- `currentUser`: The currently authenticated user
- `login(email, password)`: Function to authenticate a user
- `signup(userData)`: Function to register a new user
- `logout()`: Function to log out the current user
- `loading`: Boolean indicating if authentication is in progress
- `error`: Any error that occurred during authentication

### Protected Routes

The `ProtectedRoute` component:

```jsx
<ProtectedRoute requireAuth={true}>
  <DashboardComponent />
</ProtectedRoute>
```

- Redirects unauthenticated users to the login page when trying to access protected routes
- Redirects authenticated users to the Rica UI when visiting public routes (like login/signup)

### API Service

The API service provides methods for authentication and user management:

```jsx
import { authService, userService } from '../services/api';

// Authentication
const { user, token } = await authService.login(email, password);
const { user, token } = await authService.register(userData);
const user = await authService.validateToken(token);

// User management
const profile = await userService.getProfile();
const updatedProfile = await userService.updateProfile(profileData);
```

## Deployment

Both applications are containerized using Docker and deployed to Kubernetes. The deployment process is automated using CI/CD pipelines.

## Future Improvements

1. **Single Sign-On**: Implement a true SSO solution for seamless authentication between applications
2. **API Gateway**: Use an API gateway to handle authentication and routing between applications
3. **Refresh Tokens**: Add support for refresh tokens to extend session duration
4. **Role-Based Access**: Implement role-based access control for different user types
5. **OAuth Integration**: Add support for OAuth providers (Google, GitHub, etc.)

## Troubleshooting

### Common Issues

1. **Authentication Token Expired**:
   - Clear localStorage and log in again
   - Check if the server time is synchronized

2. **Redirect Loop**:
   - Clear localStorage and cookies
   - Check if the authentication token is valid

3. **API Connection Issues**:
   - Verify that the API server is running
   - Check network connectivity
   - Verify CORS configuration

## Contact

For questions or issues related to the integration, contact:

- Development Team: dev@rica.io
- DevOps Team: devops@rica.io
