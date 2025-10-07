# Rica API Server - API Documentation

This document provides detailed information about the Rica API Server endpoints, including the Device Linking System API.

## Base URL

```
http://localhost:8080
```

In production, use your domain with HTTPS:

```
https://api.your-domain.com
```

## Authentication

Most API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Register a new user

```
POST /api/auth/register
```

Request body:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "role": "user",
      "permissions": ["view:devices"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "username": "user123",
  "password": "securepassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "role": "user",
      "permissions": ["view:devices"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get current user

```
GET /api/auth/me
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "username": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "permissions": ["view:devices"]
    }
  }
}
```

#### Generate API key

```
POST /api/auth/api-key
```

Response:
```json
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "apiKey": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
}
```

### Device Management

#### Get all devices

```
GET /api/devices
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "deviceId": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
      "deviceName": "Server-01",
      "deviceType": "server",
      "ipAddress": "192.168.1.100",
      "status": "connected",
      "lastSeen": "2025-09-20T19:23:42.123Z"
    },
    {
      "deviceId": "e58bd10c-69dd-5483-b678-1f13c3d4e580",
      "deviceName": "Workstation-01",
      "deviceType": "workstation",
      "ipAddress": "192.168.1.101",
      "status": "discovered",
      "lastSeen": "2025-09-20T19:20:15.456Z"
    }
  ]
}
```

#### Get device by ID

```
GET /api/devices/:deviceId
```

Response:
```json
{
  "success": true,
  "data": {
    "deviceId": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
    "deviceName": "Server-01",
    "deviceType": "server",
    "ipAddress": "192.168.1.100",
    "macAddress": "00:1A:2B:3C:4D:5E",
    "operatingSystem": "Ubuntu",
    "osVersion": "20.04",
    "status": "connected",
    "lastSeen": "2025-09-20T19:23:42.123Z",
    "connected": true,
    "connectionTime": "2025-09-20T18:45:30.789Z",
    "dataFeeds": [
      {
        "name": "System Information",
        "type": "system",
        "active": true,
        "interval": 300000,
        "lastCollection": "2025-09-20T19:20:30.456Z"
      },
      {
        "name": "Security Events",
        "type": "security",
        "active": true,
        "interval": 300000,
        "lastCollection": "2025-09-20T19:20:30.456Z"
      }
    ]
  }
}
```

#### Start device discovery

```
POST /api/devices/discovery/start
```

Response:
```json
{
  "success": true,
  "message": "Device discovery started"
}
```

#### Stop device discovery

```
POST /api/devices/discovery/stop
```

Response:
```json
{
  "success": true,
  "message": "Device discovery stopped"
}
```

#### Connect to a device

```
POST /api/devices/:deviceId/connect
```

Request body:
```json
{
  "username": "admin",
  "password": "securepassword",
  "port": 22
}
```

Response:
```json
{
  "success": true,
  "message": "Device connected successfully",
  "data": {
    "deviceId": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
    "deviceName": "Server-01",
    "deviceType": "server",
    "ipAddress": "192.168.1.100",
    "status": "connected",
    "connected": true,
    "connectionTime": "2025-09-20T20:15:30.123Z"
  }
}
```

#### Disconnect from a device

```
POST /api/devices/:deviceId/disconnect
```

Response:
```json
{
  "success": true,
  "message": "Device disconnected successfully",
  "data": {
    "deviceId": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
    "deviceName": "Server-01",
    "deviceType": "server",
    "ipAddress": "192.168.1.100",
    "status": "disconnected",
    "connected": false
  }
}
```

#### Start data collection

```
POST /api/devices/collection/start
```

Response:
```json
{
  "success": true,
  "message": "Data collection started"
}
```

#### Stop data collection

```
POST /api/devices/collection/stop
```

Response:
```json
{
  "success": true,
  "message": "Data collection stopped"
}
```

#### Collect data from a specific device

```
POST /api/devices/:deviceId/collect
```

Response:
```json
{
  "success": true,
  "message": "Data collected successfully",
  "data": {
    "deviceId": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
    "deviceName": "Server-01",
    "deviceType": "server",
    "ipAddress": "192.168.1.100",
    "timestamp": "2025-09-20T20:30:45.789Z",
    "systemInfo": {
      "os": "Ubuntu 20.04 LTS",
      "cpu": "Intel(R) Xeon(R) CPU E5-2680 v4 @ 2.40GHz",
      "memory": "16GB",
      "disk": "500GB"
    },
    "securityEvents": [
      {
        "type": "authentication_failure",
        "severity": "warning",
        "description": "Failed login attempt from 203.0.113.42",
        "timestamp": "2025-09-20T20:25:12.456Z"
      }
    ]
  }
}
```

#### Update device information

```
PUT /api/devices/:deviceId
```

Request body:
```json
{
  "deviceName": "Web-Server-01",
  "deviceType": "server"
}
```

Response:
```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "deviceId": "d47ac10b-58cc-4372-a567-0e02b2c3d479",
    "deviceName": "Web-Server-01",
    "deviceType": "server",
    "ipAddress": "192.168.1.100",
    "status": "connected"
  }
}
```

#### Delete a device

```
DELETE /api/devices/:deviceId
```

Response:
```json
{
  "success": true,
  "message": "Device deleted successfully"
}
```

### Payment Processing (Legacy)

#### Create a payment

```
POST /api/payments
```

Request body:
```json
{
  "amount": 10000,
  "phoneNumber": "+255123456789",
  "description": "Rica Subscription",
  "reference": "RICA-123456"
}
```

Response:
```json
{
  "success": true,
  "transactionId": "CP1632145678901",
  "status": "PENDING",
  "message": "Payment request sent successfully"
}
```

#### Get payment status

```
GET /api/payments/:transactionId
```

Response:
```json
{
  "amount": 10000,
  "phoneNumber": "+255123456789",
  "description": "Rica Subscription",
  "reference": "RICA-123456",
  "status": "PENDING",
  "createdAt": "2025-09-20T14:21:18.901Z"
}
```

### Webhooks

#### ClickPesa webhook

```
POST /webhooks/clickpesa
```

Request body:
```json
{
  "transaction_id": "CP1632145678901",
  "status": "COMPLETED",
  "reference": "RICA-123456",
  "amount": 10000,
  "currency": "TZS",
  "provider": "MPESA"
}
```

Response:
```json
{
  "success": true
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "details": [
      {
        "param": "username",
        "msg": "Username is required"
      }
    ]
  }
}
```

Common HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, clients are limited to:

- 100 requests per 15-minute window (development)
- 50 requests per 15-minute window (production)

When the rate limit is exceeded, the API returns a `429 Too Many Requests` response.
