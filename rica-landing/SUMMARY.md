# Rica Landing Page - Project Summary

## Overview

The Rica Landing Page is a modern, responsive marketing website for the Rica security intelligence platform. It provides information about features, pricing, and company details, as well as user authentication functionality. Once users are authenticated, they are redirected to the Rica UI application, which is the main product interface.

## Features

### Marketing Pages

- **Home Page**: Main landing page with feature highlights, testimonials, and call-to-action sections
- **Features Page**: Detailed information about Rica's features
- **Pricing Page**: Subscription plans and pricing information
- **About Page**: Company information and team

### Authentication

- **Login Page**: User authentication with email and password
- **Signup Page**: Multi-step registration form with account details, personal information, and subscription plan selection
- **Profile Page**: User profile management with personal information, security settings, notification preferences, and subscription details

### Integration with Rica UI

- **Authentication Flow**: Shared authentication system between the landing page and Rica UI
- **Automatic Redirection**: Authenticated users are automatically redirected to the Rica UI
- **Consistent UI/UX**: Both applications use the same design system for a seamless user experience

## Technology Stack

- **Frontend Framework**: React
- **UI Library**: Material UI
- **Styling**: Styled Components
- **Animation**: Framer Motion
- **Routing**: React Router
- **Build Tool**: Vite
- **Authentication**: JWT-based authentication with localStorage

## Project Structure

```
rica-landing/
├── src/
│   ├── assets/        # Images, SVGs, and other static assets
│   ├── components/    # Reusable React components
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── styles/        # Global styles
│   ├── App.jsx        # Main App component
│   └── main.jsx       # Entry point
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── package.json       # Project dependencies and scripts
├── README.md          # Project documentation
├── INTEGRATION.md     # Integration details
└── RICA_INTEGRATION_GUIDE.md # Comprehensive integration guide
```

## Key Components

### Authentication

- **AuthContext**: Provides authentication state and methods
- **ProtectedRoute**: Handles route protection based on authentication state
- **API Service**: Handles authentication requests

### User Interface

- **Header**: Navigation bar with dynamic content based on authentication state
- **Footer**: Site footer with links and information
- **ErrorBoundary**: Error handling component
- **UserProfile**: User profile management component

## Integration with Rica UI

The Rica Landing Page integrates with the Rica UI application through:

1. **Shared Authentication**: Both applications use the same authentication system
2. **Automatic Redirection**: Authenticated users are automatically redirected to the Rica UI
3. **Consistent UI/UX**: Both applications use the same design system

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/rica/rica-landing.git

# Install dependencies
cd rica-landing
npm install
```

### Development Server

```bash
# Start the development server
npm run dev
```

### Building for Production

```bash
# Build the application
npm run build
```

## Deployment

The Rica Landing Page is deployed to production using:

1. **Docker**: Containerized application
2. **Kubernetes**: Container orchestration
3. **CI/CD**: Automated deployment pipeline

## Future Improvements

1. **Single Sign-On**: Implement a true SSO solution for seamless authentication between applications
2. **API Gateway**: Use an API gateway to handle authentication and routing between applications
3. **Refresh Tokens**: Add support for refresh tokens to extend session duration
4. **Role-Based Access**: Implement role-based access control for different user types
5. **OAuth Integration**: Add support for OAuth providers (Google, GitHub, etc.)
