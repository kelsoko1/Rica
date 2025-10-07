/**
 * Test script for the Device Linking System
 * This script tests the core functionality of the DeviceLinkingService
 */

const DeviceLinkingService = require('./src/services/DeviceLinkingService').default;

// Mock the localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key];
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  }
};

// Test the DeviceLinkingService
async function testDeviceLinkingService() {
  console.log('Testing DeviceLinkingService...');
  
  // Test device discovery
  console.log('\nTesting device discovery...');
  try {
    await DeviceLinkingService.startDiscovery();
    console.log('✅ Device discovery started successfully');
  } catch (error) {
    console.error('❌ Failed to start device discovery:', error);
  }
  
  // Wait for discovery to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test getting all devices
  console.log('\nTesting getAllDevices...');
  const devices = DeviceLinkingService.getAllDevices();
  console.log(`Found ${devices.length} devices`);
  
  if (devices.length > 0) {
    console.log('First device:', devices[0]);
    
    // Test connecting to a device
    console.log('\nTesting device connection...');
    try {
      const connectedDevice = await DeviceLinkingService.connectDevice(devices[0].deviceId);
      console.log('✅ Connected to device:', connectedDevice.deviceName);
      
      // Test data collection
      console.log('\nTesting data collection...');
      try {
        await DeviceLinkingService.startDataCollection();
        console.log('✅ Data collection started successfully');
        
        // Wait for data collection to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test stopping data collection
        console.log('\nTesting stopping data collection...');
        DeviceLinkingService.stopDataCollection();
        console.log('✅ Data collection stopped successfully');
      } catch (error) {
        console.error('❌ Failed to collect data:', error);
      }
      
      // Test disconnecting from a device
      console.log('\nTesting device disconnection...');
      try {
        const disconnectedDevice = await DeviceLinkingService.disconnectDevice(devices[0].deviceId);
        console.log('✅ Disconnected from device:', disconnectedDevice.deviceName);
      } catch (error) {
        console.error('❌ Failed to disconnect from device:', error);
      }
    } catch (error) {
      console.error('❌ Failed to connect to device:', error);
    }
  }
  
  // Test stopping discovery
  console.log('\nTesting stopping device discovery...');
  DeviceLinkingService.stopDiscovery();
  console.log('✅ Device discovery stopped successfully');
}

// Run the tests
testDeviceLinkingService().catch(console.error);
