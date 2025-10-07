# Rica API Server

A production-ready API server for Rica with device linking capabilities. This server provides a comprehensive solution for device discovery, management, and data collection, with seamless integration to OpenCTI and OpenBAS platforms.

## Features

### Core Features

- **Device Discovery**: Automatically discover devices on your network
- **Device Management**: Connect to, monitor, and manage devices from a single interface
- **Data Collection**: Collect security telemetry and system information from connected devices
- **Integration with OpenCTI**: Feed device data into OpenCTI for threat intelligence analysis
- **Integration with OpenBAS**: Send device data to OpenBAS for security simulations
- **Real-time Monitoring**: Monitor device status and security events in real-time

### Security Features

- JWT-based authentication
- Role-based access control
- Input validation
- Rate limiting
- Secure password storage
- Data encryption
- HTTPS support

### Production-Ready Features

- Structured logging
- Error handling
- Health checks
- Docker containerization
- Kubernetes deployment support
- Environment-specific configuration
- API documentation

### Legacy Features

- ClickPesa payment processing
- Payment status tracking
- Webhook handling

## Architecture

The Rica API Server is built with a modular architecture:

- **Controllers**: Handle API requests and responses
- **Services**: Implement business logic
- **Models**: Define data structures
- **Routes**: Define API endpoints
- **Middleware**: Process requests before they reach the routes
- **Utils**: Provide utility functions
- **Config**: Manage application configuration

## Installation

### Prerequisites

- Node.js 16.x or later
- MongoDB 5.0 or later (optional, for data persistence)
- OpenCTI instance (optional, for threat intelligence integration)
- OpenBAS instance (optional, for security simulations)

### Standard Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rica.git
cd rica/rica-landing/server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm start
```

### Docker Installation

```bash
# Build and start containers
docker-compose up -d
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on port 8080 by default. You can change the port by setting the `PORT` environment variable.

## API Documentation

Detailed API documentation is available in the [API_DOCS.md](./API_DOCS.md) file.

### Key Endpoints

#### Device Management

- `GET /api/devices`: Get all devices
- `GET /api/devices/:deviceId`: Get device by ID
- `POST /api/devices/discovery/start`: Start device discovery
- `POST /api/devices/:deviceId/connect`: Connect to a device
- `POST /api/devices/collection/start`: Start data collection

#### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `GET /api/auth/me`: Get current user

#### Legacy Payment Processing

- `POST /api/payments`: Create a payment
- `GET /api/payments/:transactionId`: Get payment status
- `POST /webhooks/clickpesa`: ClickPesa webhook endpoint

## Deployment

For detailed deployment instructions, see the [DEPLOYMENT.md](./DEPLOYMENT.md) file.

### Quick Deployment

```bash
# Using Docker
docker-compose up -d

# Using Node.js
NODE_ENV=production npm start
```

## Device Linking System

The Device Linking System is a core feature that enables seamless integration with OpenCTI and OpenBAS. It provides:

- Automatic device discovery on the network
- Secure device connection and authentication
- Real-time data collection from connected devices
- Data formatting for OpenCTI (STIX format) and OpenBAS (injects)
- Configurable collection intervals and data types

For detailed information about the Device Linking System, see the [DEVICE_LINKING_GUIDE.md](../DEVICE_LINKING_GUIDE.md) file.

## Security

The Rica API Server implements several security measures:

- JWT-based authentication for API access
- Role-based access control for endpoint authorization
- Input validation for all API endpoints
- Rate limiting to prevent abuse
- Secure password storage using bcrypt
- Data encryption for sensitive information
- HTTPS support for secure communication

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

In a production environment, you should:

1. Verify webhook signatures
2. Use HTTPS
3. Implement proper authentication
4. Store payments in a database
5. Add proper error handling and logging
