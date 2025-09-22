# Rica Device Linking System

The Rica Device Linking System provides a seamless way to discover, connect, and manage devices across your network. It collects security telemetry from these devices and feeds the data into OpenCTI and OpenBAS for threat intelligence and security simulation purposes.

## Features

- **Device Discovery**: Automatically discover devices on your network
- **Device Management**: Connect to, monitor, and manage devices from a single interface
- **Data Collection**: Collect security telemetry and system information from connected devices
- **Integration with OpenCTI**: Feed device data into OpenCTI for threat intelligence analysis
- **Integration with OpenBAS**: Send device data to OpenBAS for security simulations
- **Real-time Monitoring**: Monitor device status and security events in real-time

## Getting Started

### Prerequisites

- Rica UI running
- OpenCTI server running (default: http://localhost:4000)
- OpenBAS server running (default: http://localhost:3000)
- Network access to devices you want to monitor

### Running the Mock API Server

For development and testing purposes, a mock API server is provided. This server simulates device discovery and data collection.

1. Install dependencies:

```bash
cd rica-ui
npm install express cors uuid
```

2. Start the mock API server:

```bash
node mock-api-server.js
```

The server will start on port 3001 and provide the following endpoints:

- `GET /api/health`: Health check endpoint
- `POST /api/devices/discover`: Discover devices on the network
- `POST /api/devices/connect`: Connect to a device
- `POST /api/devices/disconnect`: Disconnect from a device
- `POST /api/devices/collect-data`: Collect data from connected devices

### Using the Device Manager

1. Open Rica UI
2. Click on the "Device Manager" icon in the left sidebar
3. Click "Start Discovery" to begin discovering devices on your network
4. Once devices are discovered, click "Connect" on any device to establish a connection
5. Click "Start Collection" to begin collecting data from connected devices

## Architecture

The Device Linking System consists of the following components:

### Frontend Components

- **DeviceManager.js**: React component for managing devices
- **DeviceManager.css**: Styles for the DeviceManager component

### Services

- **DeviceLinkingService.js**: Core service for device discovery, connection, and data collection
- **DeviceDiscoveryAPI.js**: Service for handling API calls to the backend

### Backend API

- **mock-api-server.js**: Mock API server for development and testing

## Data Flow

```
Device → Rica Backend API → DeviceLinkingService → OpenCTI/OpenBAS
```

1. Devices are discovered on the network
2. Rica connects to devices and collects data
3. Data is processed and formatted for OpenCTI and OpenBAS
4. Formatted data is sent to OpenCTI and OpenBAS for analysis and simulation

## Configuration

The Device Linking System can be configured through the Settings tab in the Device Manager UI:

- **OpenCTI Endpoint**: URL of the OpenCTI GraphQL API
- **OpenBAS Endpoint**: URL of the OpenBAS API
- **Discovery Interval**: How often to scan for new devices (in seconds)
- **Data Collection Interval**: How often to collect data from devices (in seconds)

## Development

### Project Structure

```
rica-ui/
├── src/
│   ├── components/
│   │   ├── DeviceManager.js
│   │   └── DeviceManager.css
│   └── services/
│       └── DeviceLinkingService.js
├── mock-api-server.js
└── mock-api-package.json
```

### Adding New Features

To add new features to the Device Linking System:

1. Update the DeviceLinkingService.js file to implement the new functionality
2. Update the DeviceManager.js component to expose the new functionality in the UI
3. Update the mock-api-server.js file to simulate the new functionality

## Troubleshooting

### Common Issues

#### Device Discovery Not Working

- Ensure the mock API server is running
- Check the browser console for errors
- Verify network connectivity

#### Cannot Connect to Device

- Ensure the device is discovered first
- Check the browser console for errors
- Verify the mock API server is running

#### Data Collection Failing

- Ensure the device is connected
- Check the browser console for errors
- Verify the mock API server is running

## License

This project is licensed under the MIT License.
