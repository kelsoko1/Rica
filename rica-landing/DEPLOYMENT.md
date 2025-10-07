# Rica Landing Deployment Guide

This guide provides instructions for deploying the Rica Landing application using either Firebase Hosting or Docker.

## Prerequisites

- Node.js 16+ and npm
- Firebase CLI (for Firebase deployment)
- Docker and Docker Compose (for Docker deployment)
- Git

## Environment Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rica-landing
   ```

2. Create a `.env` file based on the `.env.example` template:
   ```bash
   cp .env.example .env
   ```

3. Update the environment variables in the `.env` file with your actual values.

## Deployment Options

### Option 1: Firebase Hosting

Firebase Hosting provides fast and secure hosting for your web app, static and dynamic content, and microservices.

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project (kelsoko-bddc4)
   - Set the public directory to "dist" (for Vite) or "build" (for Create React App)
   - Configure as a single-page app
   - Set up automatic builds and deploys (optional)

4. Deploy to Firebase:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

   Or use our deployment script:
   ```bash
   ./deploy.sh --firebase  # Linux/Mac
   deploy.bat --firebase   # Windows
   ```

5. Your app will be available at:
   - https://kelsoko-bddc4.web.app
   - https://kelsoko-bddc4.firebaseapp.com

### Option 2: Docker Deployment

Docker allows you to package the application with all its dependencies into a standardized unit for deployment.

1. Make sure Docker and Docker Compose are installed on your system.

2. Build and run the Docker container:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

   Or use our deployment script:
   ```bash
   ./deploy.sh --docker  # Linux/Mac
   deploy.bat --docker   # Windows
   ```

3. Your app will be available at http://localhost:8080

### Option 3: Combined Deployment

You can deploy to both Firebase and Docker simultaneously:

```bash
./deploy.sh --both  # Linux/Mac
deploy.bat --both   # Windows
```

## Environment Variables

The application requires several environment variables to function properly:

### Firebase Configuration
- `REACT_APP_FIREBASE_API_KEY`: Your Firebase API key
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `REACT_APP_FIREBASE_PROJECT_ID`: Firebase project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `REACT_APP_FIREBASE_APP_ID`: Firebase app ID

### ClickPesa Configuration
- `REACT_APP_CLICKPESA_API_KEY`: Your ClickPesa API key
- `REACT_APP_CLICKPESA_API_SECRET`: Your ClickPesa API secret

### Security
- `REACT_APP_ENCRYPTION_KEY`: Encryption key for sensitive data

### Analytics and Monitoring
- `REACT_APP_ANALYTICS_KEY`: Analytics tracking key
- `REACT_APP_SENTRY_DSN`: Sentry DSN for error tracking

## Troubleshooting

### Firebase Deployment Issues
- Ensure you have the correct permissions for the Firebase project
- Check that the build directory is correctly specified in `firebase.json`
- Verify that your Firebase project is properly set up for hosting

### Docker Deployment Issues
- Check Docker logs: `docker-compose logs rica-landing`
- Ensure ports are not in use: `netstat -tulpn | grep 8080`
- Verify environment variables are correctly passed to the container

## Monitoring and Maintenance

- Monitor application performance using Firebase Performance Monitoring
- Track errors using Sentry
- Set up Firebase Analytics for user behavior insights
- Regularly update dependencies to maintain security
