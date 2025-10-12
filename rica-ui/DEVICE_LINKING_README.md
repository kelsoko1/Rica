# Rica UI Device Linking System

This document provides information about the Device Linking System integrated into the Rica UI.

## Overview

The Device Linking System allows you to discover, connect, and manage devices across your network. It collects security telemetry from these devices and feeds the data into  and  for threat intelligence and security simulation purposes.

## Features

- **Device Discovery**: Automatically discover devices on your network
- **Device Management**: Connect to, monitor, and manage devices from a single interface
- **Data Collection**: Collect security telemetry and system information from connected devices
- **Integration with **: Feed device data into  for threat intelligence analysis
- **Integration with **: Send device data to  for security simulations
- **Real-time Monitoring**: Monitor device status and security events in real-time

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
-  server running (optional, default: http://localhost:4000)
-  server running (optional, default: http://localhost:3000)

### Quick Start

1. Run the startup script:

```bash
start-with-device-linking.bat
```

This script will:
- Start the mock API server for device discovery and data collection
- Start the Rica UI with the Device Linking System

2. Open your browser and navigate to http://localhost:3000
3. Click on the "Device Manager" icon in the left sidebar
4. Start using the Device Linking System!

### Manual Start

If you prefer to start the services manually:

1. Start the mock API server:

```bash
cd rica-ui
npm install express cors uuid
node mock-api-server.js
```

2. In a separate terminal, start the Rica UI:

```bash
cd rica-ui
npm start
```

## Using the Device Manager

1. Click on the "Device Manager" icon in the left sidebar
2. Click "Start Discovery" to begin discovering devices on your network
3. Once devices are discovered, click "Connect" on any device to establish a connection
4. Click "Start Collection" to begin collecting data from connected devices
5. Use the tabs to switch between Devices, Data Feeds, and Settings views

## Configuration

You can configure the Device Linking System through the Settings tab in the Device Manager:

- ** Endpoint**: URL of the  GraphQL API
- ** Endpoint**: URL of the  API
- **Discovery Interval**: How often to scan for new devices (in seconds)
- **Data Collection Interval**: How often to collect data from devices (in seconds)

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
└── start-mock-api.bat
```

### Mock API Server

The mock API server provides the following endpoints:

- `GET /api/health`: Health check endpoint
- `POST /api/devices/discover`: Discover devices on the network
- `POST /api/devices/connect`: Connect to a device
- `POST /api/devices/disconnect`: Disconnect from a device
- `POST /api/devices/collect-data`: Collect data from connected devices

## License

This project is licensed under the MIT License.
