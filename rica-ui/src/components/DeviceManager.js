import React, { useState, useEffect } from 'react';
import DeviceLinkingService from '../services/DeviceLinkingService';
import ErrorBoundary from './ErrorBoundary';
import './DeviceManager.css';

const DeviceManager = () => {
  // State management
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [settings, setSettings] = useState({
    openCTIEndpoint: 'http://localhost:2020/graphql',
    openBASEndpoint: 'http://localhost:2021/api/injects',
    discoveryInterval: 60,
    dataCollectionInterval: 300
  });

  // Initialize device linking service
  useEffect(() => {
    // Subscribe to device discovery events
    const handleDevicesDiscovered = (discoveredDevices) => {
      setDevices(discoveredDevices);
      setStatusMessage(`Discovered ${discoveredDevices.length} devices`);
      setTimeout(() => setStatusMessage(''), 3000);
    };

    // Subscribe to device connection events
    const handleDeviceConnected = (device) => {
      setDevices(prevDevices => 
        prevDevices.map(d => d.deviceId === device.deviceId ? { ...d, connected: true, status: 'connected' } : d)
      );
      setStatusMessage(`Connected to ${device.deviceName}`);
      setTimeout(() => setStatusMessage(''), 3000);
    };

    // Subscribe to device disconnection events
    const handleDeviceDisconnected = (device) => {
      setDevices(prevDevices => 
        prevDevices.map(d => d.deviceId === device.deviceId ? { ...d, connected: false, status: 'disconnected' } : d)
      );
      setStatusMessage(`Disconnected from ${device.deviceName}`);
      setTimeout(() => setStatusMessage(''), 3000);
    };

    // Subscribe to data collection events
    const handleDataCollected = (data) => {
      setStatusMessage(`Collected data from ${data.length} devices`);
      setTimeout(() => setStatusMessage(''), 3000);
    };

    // Subscribe to error events
    const handleError = (error) => {
      setStatusMessage(`Error: ${error.message}`);
      setTimeout(() => setStatusMessage(''), 5000);
    };

    // Register event listeners
    DeviceLinkingService.addEventListener('devicesDiscovered', handleDevicesDiscovered);
    DeviceLinkingService.addEventListener('deviceConnected', handleDeviceConnected);
    DeviceLinkingService.addEventListener('deviceDisconnected', handleDeviceDisconnected);
    DeviceLinkingService.addEventListener('dataCollected', handleDataCollected);
    DeviceLinkingService.addEventListener('error', handleError);

    // Load initial devices
    const storedDevices = DeviceLinkingService.getAllDevices();
    setDevices(storedDevices);

    // Check if discovery or collection is already running
    setIsDiscovering(DeviceLinkingService.isDiscovering);
    setIsCollecting(DeviceLinkingService.isCollecting);

    // Cleanup event listeners on unmount
    return () => {
      DeviceLinkingService.removeEventListener('devicesDiscovered', handleDevicesDiscovered);
      DeviceLinkingService.removeEventListener('deviceConnected', handleDeviceConnected);
      DeviceLinkingService.removeEventListener('deviceDisconnected', handleDeviceDisconnected);
      DeviceLinkingService.removeEventListener('dataCollected', handleDataCollected);
      DeviceLinkingService.removeEventListener('error', handleError);
    };
  }, []);

  // Handle device discovery
  const handleStartDiscovery = () => {
    setIsDiscovering(true);
    setStatusMessage('Starting device discovery...');
    DeviceLinkingService.startDiscovery()
      .catch(error => {
        setIsDiscovering(false);
        setStatusMessage(`Error starting discovery: ${error.message}`);
      });
  };

  const handleStopDiscovery = () => {
    setIsDiscovering(false);
    DeviceLinkingService.stopDiscovery();
    setStatusMessage('Device discovery stopped');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle data collection
  const handleStartCollection = () => {
    setIsCollecting(true);
    setStatusMessage('Starting data collection...');
    DeviceLinkingService.startDataCollection()
      .catch(error => {
        setIsCollecting(false);
        setStatusMessage(`Error starting data collection: ${error.message}`);
      });
  };

  const handleStopCollection = () => {
    setIsCollecting(false);
    DeviceLinkingService.stopDataCollection();
    setStatusMessage('Data collection stopped');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle device connection/disconnection
  const handleConnectDevice = (device) => {
    setStatusMessage(`Connecting to ${device.deviceName}...`);
    DeviceLinkingService.connectDevice(device.deviceId)
      .catch(error => {
        setStatusMessage(`Error connecting to device: ${error.message}`);
      });
  };

  const handleDisconnectDevice = (device) => {
    setStatusMessage(`Disconnecting from ${device.deviceName}...`);
    DeviceLinkingService.disconnectDevice(device.deviceId)
      .catch(error => {
        setStatusMessage(`Error disconnecting from device: ${error.message}`);
      });
  };

  // Handle device selection
  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setActiveTab('data');
  };

  // Handle settings change
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  // Apply settings
  const handleApplySettings = () => {
    DeviceLinkingService.updateSettings({
      openCTIEndpoint: settings.openCTIEndpoint,
      openBASEndpoint: settings.openBASEndpoint,
      discoveryInterval: parseInt(settings.discoveryInterval, 10),
      dataCollectionInterval: parseInt(settings.dataCollectionInterval, 10)
    });
    setStatusMessage('Settings applied');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Get device type icon
  const getDeviceTypeIcon = (deviceType) => {
    switch (deviceType) {
      case 'workstation':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 9V7C2 4 4 2 7 2H17C20 2 22 4 22 7V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 15V17C2 20 4 22 7 22H17C20 22 22 20 22 17V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'server':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.32 10H4.69002C3.21002 10 2.01001 8.79001 2.01001 7.32001V4.69001C2.01001 3.21001 3.22002 2.01001 4.69002 2.01001H19.32C20.8 2.01001 22 3.22001 22 4.69001V7.32001C22 8.79001 20.79 10 19.32 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.32 22H4.69002C3.21002 22 2.01001 20.79 2.01001 19.32V16.69C2.01001 15.21 3.22002 14.01 4.69002 14.01H19.32C20.8 14.01 22 15.22 22 16.69V19.32C22 20.79 20.79 22 19.32 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 18H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 6H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 18H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'mobile':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 2H7C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'network':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.72 9.56H5.78C3.7 9.56 2 7.86 2 5.78C2 3.7 3.7 2 5.78 2H7.67001C9.23001 2 10.5 3.28 10.5 4.83V7.39001C10.5 8.49001 9.61 9.38 8.5 9.38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.28 9.56H18.22C20.3 9.56 22 7.86 22 5.78C22 3.7 20.3 2 18.22 2H16.33C14.77 2 13.5 3.28 13.5 4.83V7.39001C13.5 8.49001 14.39 9.38 15.5 9.38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.28 22H18.22C20.3 22 22 20.3 22 18.22C22 16.14 20.3 14.44 18.22 14.44H16.33C14.77 14.44 13.5 15.72 13.5 17.27V19.83C13.5 20.94 14.39 21.83 15.5 21.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.72 22H5.78C3.7 22 2 20.3 2 18.22C2 16.14 3.7 14.44 5.78 14.44H7.67001C9.23001 14.44 10.5 15.72 10.5 17.27V19.83C10.5 20.94 9.61 21.83 8.5 21.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'iot':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.79 10.47V17.79C17.79 20.12 15.9 22 13.58 22H6.21C3.89 22 2 20.11 2 17.79V10.47C2 8.14 3.89 6.26 6.21 6.26H13.58C15.9 6.26 17.79 8.15 17.79 10.47Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.5 4V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.5 4V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 4V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 13.16V15.2C22 18.06 19.76 20.3 16.9 20.3H17.79C15.47 20.3 13.58 18.41 13.58 16.09V10.47C13.58 8.15 15.47 6.26 17.79 6.26H16.9C19.76 6.26 22 8.5 22 11.36V13.16Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 16.95H6.21C2.84 16.95 2 16.11 2 12.74V6.74C2 3.37 2.84 2.53 6.21 2.53H16.74C20.11 2.53 20.95 3.37 20.95 6.74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 21.47V16.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12.95H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.74 21.47H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="device-manager">
        <div className="device-manager-header">
          <h2>Device Manager</h2>
          <div className="device-manager-actions">
            {isDiscovering ? (
              <button className="action-button stop" onClick={handleStopDiscovery}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 15.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Stop Discovery
              </button>
            ) : (
              <button className="action-button start" onClick={handleStartDiscovery}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15.5V8.5C9 7.26 9.82 6.73 10.92 7.3L12.92 8.36L14.92 9.42C16.02 9.99 16.02 11.01 14.92 11.58L12.92 12.64L10.92 13.7C9.82 14.27 9 13.74 9 12.5V15.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Start Discovery
              </button>
            )}
            
            {isCollecting ? (
              <button className="action-button stop" onClick={handleStopCollection}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 15.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Stop Collection
              </button>
            ) : (
              <button className="action-button start" onClick={handleStartCollection}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 15.5V8.5C9 7.26 9.82 6.73 10.92 7.3L12.92 8.36L14.92 9.42C16.02 9.99 16.02 11.01 14.92 11.58L12.92 12.64L10.92 13.7C9.82 14.27 9 13.74 9 12.5V15.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Start Collection
              </button>
            )}
          </div>
        </div>
        
        {statusMessage && (
          <div className="status-message">
            {statusMessage}
          </div>
        )}
        
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveTab('devices')}
          >
            Devices
          </button>
          <button 
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Feeds
          </button>
          <button 
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'devices' && (
            <div className="devices-tab">
              <div className="devices-grid">
                {devices.length === 0 ? (
                  <div className="no-devices">
                    <p>No devices discovered yet. Click "Start Discovery" to find devices on your network.</p>
                  </div>
                ) : (
                  devices.map(device => (
                    <div 
                      key={device.deviceId} 
                      className={`device-card ${device.status || 'discovered'}`}
                      onClick={() => handleSelectDevice(device)}
                    >
                      <div className="device-icon">
                        {getDeviceTypeIcon(device.deviceType)}
                      </div>
                      <div className="device-info">
                        <h3>{device.deviceName}</h3>
                        <p className="device-ip">{device.ipAddress}</p>
                        <p className="device-type">{device.deviceType}</p>
                        <div className={`device-status ${device.status || 'discovered'}`}>
                          {device.status || 'discovered'}
                        </div>
                      </div>
                      <div className="device-actions">
                        {device.connected ? (
                          <button 
                            className="disconnect-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnectDevice(device);
                            }}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button 
                            className="connect-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConnectDevice(device);
                            }}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'data' && (
            <div className="data-tab">
              {selectedDevice ? (
                <div className="data-feeds">
                  <h3>Data Feeds for {selectedDevice.deviceName}</h3>
                  {selectedDevice.dataFeeds && selectedDevice.dataFeeds.length > 0 ? (
                    <div className="feeds-list">
                      {selectedDevice.dataFeeds.map((feed, index) => (
                        <div key={index} className="feed-item">
                          <div className="feed-header">
                            <h4>{feed.name}</h4>
                            <span className={`feed-status ${feed.active ? 'active' : 'inactive'}`}>
                              {feed.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="feed-details">
                            <p>Type: {feed.type}</p>
                            <p>Interval: {feed.interval / 1000} seconds</p>
                            {feed.lastCollection && (
                              <p>Last Collection: {new Date(feed.lastCollection).toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-feeds">
                      <p>No data feeds available for this device. Connect to the device first to enable data collection.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-device-selected">
                  <p>Select a device from the Devices tab to view its data feeds.</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-form">
                <div className="form-group">
                  <label htmlFor="openCTIEndpoint">OpenCTI GraphQL Endpoint</label>
                  <input
                    type="text"
                    id="openCTIEndpoint"
                    name="openCTIEndpoint"
                    value={settings.openCTIEndpoint}
                    onChange={handleSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="openBASEndpoint">OpenBAS API Endpoint</label>
                  <input
                    type="text"
                    id="openBASEndpoint"
                    name="openBASEndpoint"
                    value={settings.openBASEndpoint}
                    onChange={handleSettingsChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="discoveryInterval">Discovery Interval (seconds)</label>
                  <input
                    type="number"
                    id="discoveryInterval"
                    name="discoveryInterval"
                    value={settings.discoveryInterval}
                    onChange={handleSettingsChange}
                    min="10"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="dataCollectionInterval">Data Collection Interval (seconds)</label>
                  <input
                    type="number"
                    id="dataCollectionInterval"
                    name="dataCollectionInterval"
                    value={settings.dataCollectionInterval}
                    onChange={handleSettingsChange}
                    min="30"
                  />
                </div>
                
                <div className="form-actions">
                  <button className="apply-button" onClick={handleApplySettings}>
                    Apply Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DeviceManager;
