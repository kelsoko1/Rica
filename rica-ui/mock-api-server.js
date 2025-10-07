/**
 * Mock API Server for Rica Device Linking System
 * This server simulates device discovery and data collection for development purposes
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for devices
const devices = [
  {
    deviceId: 'device-001',
    deviceName: 'Workstation-001',
    deviceType: 'workstation',
    ipAddress: '192.168.1.100',
    macAddress: '00:1A:2B:3C:4D:5E',
    operatingSystem: 'Windows 10',
    osVersion: '10.0.19044',
    status: 'discovered',
    connected: false,
    lastSeen: new Date().toISOString(),
  },
  {
    deviceId: 'device-002',
    deviceName: 'Server-001',
    deviceType: 'server',
    ipAddress: '192.168.1.101',
    macAddress: '00:1A:2B:3C:4D:5F',
    operatingSystem: 'Ubuntu',
    osVersion: '20.04',
    status: 'discovered',
    connected: false,
    lastSeen: new Date().toISOString(),
  },
  {
    deviceId: 'device-003',
    deviceName: 'Router-001',
    deviceType: 'network',
    ipAddress: '192.168.1.1',
    macAddress: '00:1A:2B:3C:4D:60',
    operatingSystem: 'RouterOS',
    osVersion: '6.48.3',
    status: 'discovered',
    connected: false,
    lastSeen: new Date().toISOString(),
  },
  {
    deviceId: 'device-004',
    deviceName: 'SmartTV-001',
    deviceType: 'iot',
    ipAddress: '192.168.1.102',
    macAddress: '00:1A:2B:3C:4D:61',
    operatingSystem: 'WebOS',
    osVersion: '5.0',
    status: 'discovered',
    connected: false,
    lastSeen: new Date().toISOString(),
  },
  {
    deviceId: 'device-005',
    deviceName: 'Mobile-001',
    deviceType: 'mobile',
    ipAddress: '192.168.1.103',
    macAddress: '00:1A:2B:3C:4D:62',
    operatingSystem: 'Android',
    osVersion: '12',
    status: 'discovered',
    connected: false,
    lastSeen: new Date().toISOString(),
  },
];

// Generate random security events
const generateSecurityEvents = (deviceId) => {
  const eventTypes = ['authentication_failure', 'malware_detected', 'suspicious_traffic', 'port_scan'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const sourceIps = ['203.0.113.42', '198.51.100.77', '192.0.2.123'];
  const destinationIps = ['192.168.1.100', '192.168.1.101', '192.168.1.102'];
  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS'];
  const ports = [80, 443, 22, 3389, 8080];
  
  const numEvents = Math.floor(Math.random() * 3) + 1; // 1-3 events
  const events = [];
  
  for (let i = 0; i < numEvents; i++) {
    events.push({
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Security event detected on device ${deviceId}`,
      sourceIp: sourceIps[Math.floor(Math.random() * sourceIps.length)],
      destinationIp: destinationIps[Math.floor(Math.random() * destinationIps.length)],
      protocol: protocols[Math.floor(Math.random() * protocols.length)],
      port: ports[Math.floor(Math.random() * ports.length)],
      timestamp: new Date().toISOString(),
    });
  }
  
  return events;
};

// Generate random vulnerabilities
const generateVulnerabilities = () => {
  const vulnNames = ['CVE-2021-44228', 'CVE-2022-22965', 'CVE-2022-30190', 'CVE-2022-1388'];
  const descriptions = [
    'Log4j remote code execution vulnerability',
    'Spring Framework remote code execution vulnerability',
    'Microsoft Office remote code execution vulnerability',
    'F5 BIG-IP authentication bypass vulnerability',
  ];
  
  const numVulns = Math.floor(Math.random() * 2); // 0-1 vulnerabilities
  const vulns = [];
  
  for (let i = 0; i < numVulns; i++) {
    const index = Math.floor(Math.random() * vulnNames.length);
    vulns.push({
      name: vulnNames[index],
      description: descriptions[index],
      severity: 'high',
    });
  }
  
  return vulns;
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Discover devices endpoint
app.post('/api/devices/discover', (req, res) => {
  // Simulate new device discovery (20% chance)
  if (Math.random() < 0.2) {
    const newDeviceId = `device-${(devices.length + 1).toString().padStart(3, '0')}`;
    const deviceTypes = ['workstation', 'server', 'network', 'iot', 'mobile'];
    const osNames = ['Windows 10', 'Ubuntu', 'RouterOS', 'WebOS', 'Android'];
    const osVersions = ['10.0.19044', '20.04', '6.48.3', '5.0', '12'];
    
    const typeIndex = Math.floor(Math.random() * deviceTypes.length);
    
    devices.push({
      deviceId: newDeviceId,
      deviceName: `${deviceTypes[typeIndex].charAt(0).toUpperCase() + deviceTypes[typeIndex].slice(1)}-${(devices.length + 1).toString().padStart(3, '0')}`,
      deviceType: deviceTypes[typeIndex],
      ipAddress: `192.168.1.${104 + devices.length - 5}`,
      macAddress: `00:1A:2B:3C:4D:${(63 + devices.length - 5).toString(16).toUpperCase()}`,
      operatingSystem: osNames[typeIndex],
      osVersion: osVersions[typeIndex],
      status: 'discovered',
      connected: false,
      lastSeen: new Date().toISOString(),
    });
  }
  
  // Update lastSeen for all devices
  devices.forEach(device => {
    device.lastSeen = new Date().toISOString();
  });
  
  res.json({
    success: true,
    devices: devices.map(device => ({
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      operatingSystem: device.operatingSystem,
      osVersion: device.osVersion,
      status: device.status,
      connected: device.connected,
      lastSeen: device.lastSeen,
    })),
  });
});

// Connect to device endpoint
app.post('/api/devices/connect', (req, res) => {
  const { deviceId } = req.body;
  
  // Find device
  const deviceIndex = devices.findIndex(device => device.deviceId === deviceId);
  
  if (deviceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Device with ID ${deviceId} not found`,
    });
  }
  
  // Update device status
  devices[deviceIndex].status = 'connected';
  devices[deviceIndex].connected = true;
  devices[deviceIndex].connectionTime = new Date().toISOString();
  
  // Initialize data feeds if not present
  if (!devices[deviceIndex].dataFeeds || devices[deviceIndex].dataFeeds.length === 0) {
    devices[deviceIndex].dataFeeds = [
      {
        name: 'System Information',
        type: 'system',
        active: true,
        interval: 300000, // 5 minutes
      },
      {
        name: 'Security Events',
        type: 'security',
        active: true,
        interval: 300000, // 5 minutes
      },
    ];
  }
  
  res.json({
    success: true,
    message: `Connected to device ${deviceId}`,
    device: devices[deviceIndex],
  });
});

// Disconnect from device endpoint
app.post('/api/devices/disconnect', (req, res) => {
  const { deviceId } = req.body;
  
  // Find device
  const deviceIndex = devices.findIndex(device => device.deviceId === deviceId);
  
  if (deviceIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Device with ID ${deviceId} not found`,
    });
  }
  
  // Update device status
  devices[deviceIndex].status = 'disconnected';
  devices[deviceIndex].connected = false;
  
  res.json({
    success: true,
    message: `Disconnected from device ${deviceId}`,
    device: devices[deviceIndex],
  });
});

// Collect data from devices endpoint
app.post('/api/devices/collect-data', (req, res) => {
  const { deviceIds } = req.body;
  
  // Filter connected devices
  const connectedDevices = devices.filter(device => 
    device.connected && (!deviceIds || deviceIds.includes(device.deviceId))
  );
  
  if (connectedDevices.length === 0) {
    return res.json({
      success: true,
      message: 'No connected devices to collect data from',
      data: [],
    });
  }
  
  // Collect data from connected devices
  const collectedData = connectedDevices.map(device => {
    // Generate security events
    const securityEvents = generateSecurityEvents(device.deviceId);
    
    // Generate vulnerabilities
    const vulnerabilities = generateVulnerabilities();
    
    // Generate system information
    const systemInfo = {
      os: device.operatingSystem,
      osVersion: device.osVersion,
      cpu: 'Intel Core i7-10700K',
      memory: '16GB',
      disk: '512GB SSD',
      uptime: '10 days, 5 hours, 30 minutes',
    };
    
    return {
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      ipAddress: device.ipAddress,
      macAddress: device.macAddress,
      timestamp: new Date().toISOString(),
      securityEvents,
      vulnerabilities,
      systemInfo,
    };
  });
  
  // Update device data
  collectedData.forEach(data => {
    const deviceIndex = devices.findIndex(device => device.deviceId === data.deviceId);
    
    if (deviceIndex !== -1) {
      devices[deviceIndex].lastData = data;
      devices[deviceIndex].lastDataCollection = new Date().toISOString();
      
      // Update data feeds
      if (devices[deviceIndex].dataFeeds) {
        devices[deviceIndex].dataFeeds.forEach(feed => {
          feed.lastCollection = new Date().toISOString();
        });
      }
    }
  });
  
  res.json({
    success: true,
    message: `Collected data from ${collectedData.length} devices`,
    data: collectedData,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
});
