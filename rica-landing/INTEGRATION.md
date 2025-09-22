# Rica Landing Page - Integration with Rica UI

This document describes how the Rica landing page integrates with the Rica UI application.

## Integration Points

### 1. Authentication Integration

- **AuthContext**: Created a shared authentication context that manages user state across the application
- **Token Storage**: Authentication tokens are stored in localStorage for persistence
- **User Data**: User information is stored in localStorage for quick access
- **Login/Signup**: Authentication functions handle user registration and login

### 2. Redirection Logic

- **Automatic Redirection**: When a user is authenticated, they are automatically redirected to the Rica UI application
- **Protected Routes**: Added ProtectedRoute component to handle authentication state and redirections
- **Dashboard Link**: Added a direct link to the Rica UI application for authenticated users

### 3. Shared Header/Navigation

- **Dynamic Header**: Header component shows different options based on authentication state
- **User Profile**: When logged in, the header displays the user's profile information
- **Dashboard Button**: Added a "Go to Dashboard" button that takes users directly to the Rica UI
- **Logout Button**: Added a logout button that works across both applications

### 4. API Integration

- **Shared Authentication**: Both applications use the same authentication system
- **Consistent Error Handling**: Error handling is consistent between both applications
- **Mock API**: For demonstration purposes, we're using a mock API, but this can be replaced with real API endpoints

## User Flow

1. **New User**:
   - Visits landing page
   - Explores features, pricing, etc.
   - Signs up with email/password
   - Is redirected to Rica UI

2. **Returning User (Not Logged In)**:
   - Visits landing page
   - Logs in with credentials
   - Is redirected to Rica UI

3. **Returning User (Already Logged In)**:
   - Visits landing page
   - Is automatically redirected to Rica UI

4. **Logged In User**:
   - Can navigate between Rica UI and landing page
   - Sees consistent authentication state across both
   - Can log out from either application

## Implementation Details

### Authentication Context

The `AuthContext` provides:
- `currentUser`: The currently authenticated user
- `login(email, password)`: Function to authenticate a user
- `signup(userData)`: Function to register a new user
- `logout()`: Function to log out the current user
- `loading`: Boolean indicating if authentication is in progress
- `error`: Any error that occurred during authentication

### Protected Routes

The `ProtectedRoute` component:
- Redirects unauthenticated users to the login page when trying to access protected routes
- Redirects authenticated users to the Rica UI when visiting public routes (like login/signup)
- Shows a loading indicator while checking authentication status

### Header Component

The Header component:
- Shows "Log In" and "Sign Up" buttons for unauthenticated users
- Shows "Go to Dashboard" and "Log Out" buttons for authenticated users
- Displays the user's profile information when logged in

## Configuration

The Rica UI application URL is currently set to `http://localhost:3000`. This should be updated to the actual URL of the Rica UI application in production.

## Future Improvements

1. **Single Sign-On**: Implement a true SSO solution for seamless authentication between applications
2. **API Gateway**: Use an API gateway to handle authentication and routing between applications
3. **Refresh Tokens**: Add support for refresh tokens to extend session duration
4. **Role-Based Access**: Implement role-based access control for different user types
5. **OAuth Integration**: Add support for OAuth providers (Google, GitHub, etc.)
