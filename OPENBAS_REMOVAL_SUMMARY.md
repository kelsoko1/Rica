# OpenBAS Removal Summary

## Overview
This document summarizes the complete removal of OpenBAS (Simulations) from the Rica project.

## Date
October 5, 2025

## Files Deleted

### Component Files
1. `rica-ui/src/components/SimsFrame.js` - Main Simulations frame component
2. `rica-ui/src/components/SimsFrame.css` - Simulations frame styles
3. `rica-ui/src/components/OpenBASFrame.js` - OpenBAS iframe component

### Docker Configuration
4. `docker-compose.openbas.yml` - OpenBAS Docker Compose configuration

### Scripts
5. `fix-opencti-openbas.sh` - OpenCTI/OpenBAS fix script

## Files Modified

### UI Components

#### 1. `rica-ui/src/App.js`
- Removed `SimsFrame` import
- Removed `sims` from health status indicator condition
- Removed `sims` rendering from workspace content

#### 2. `rica-ui/src/AppNew.js`
- Removed `SimsFrame` import
- Removed `sims` rendering from workspace content

#### 3. `rica-ui/src/components/CustomLeftSidebar.js`
- Removed Simulations navigation button
- Removed all `sims` related click handlers and state

#### 4. `rica-ui/src/components/LeftNav.js`
- Removed Simulations navigation button
- Removed all `sims` related click handlers and state

#### 5. `rica-ui/src/components/HeadlessServerContainer.js`
- Removed `SimsFrame` import
- Removed `sims` server configuration from `serverConfigs` object

#### 6. `rica-ui/src/components/HeadlessServerStatusIndicator.js`
- Removed `sims` server name mapping
- Removed "Simulations (OpenBAS)" label

#### 7. `rica-ui/src/components/IntegratedTerminal.js`
- Removed `simulate` command reference from help text
- Removed OpenBAS simulation command documentation

### Services

#### 8. `rica-ui/src/services/HeadlessServerHealthService.js`
- Removed `sims` from server status tracking
- Removed `sims` server URL configuration (port 2021)

#### 9. `rica-ui/src/services/HeadlessServerStatusManager.js`
- Removed `sims` from initial server status state

#### 10. `rica-ui/src/services/DeviceLinkingService.js`
- Removed `openBASEndpoint` from settings
- Removed `sendDataToOpenBAS()` method
- Removed `formatDataForOpenBAS()` method
- Updated data collection to only send to OpenCTI

## Port Mapping Changes

### Before Removal
- Port 2020: OpenCTI (Fabric)
- Port 2021: OpenBAS (Simulations) ❌ REMOVED
- Port 2022: Activepieces (Auto)
- Port 2023: Code Server
- Port 2024: Ollama

### After Removal
- Port 2020: OpenCTI (Fabric)
- Port 2022: Activepieces (Auto)
- Port 2023: Code Server
- Port 2024: Ollama

## Remaining Headless Servers

The Rica UI now integrates with the following headless servers:

1. **Fabric (OpenCTI)** - Threat intelligence platform (Port 2020)
2. **Auto (Activepieces)** - Automation workflow platform (Port 2022)
3. **Code Server** - VS Code in browser (Port 2023)
4. **Ollama** - AI model server (Port 2024)

## Navigation Structure

The left sidebar now contains:
- Project Explorer
- Device Manager
- Fabric (OpenCTI)
- Auto (Activepieces)
- Teams

## Impact on Features

### Removed Features
- Simulations tab in the UI
- OpenBAS iframe integration
- Security simulation management
- Device data sync to OpenBAS
- OpenBAS health monitoring
- Simulation-related terminal commands

### Retained Features
- All threat intelligence features (OpenCTI/Fabric)
- Automation workflows (Activepieces/Auto)
- Device linking and management
- Teams collaboration
- Code Server integration
- All other core Rica functionality

## Testing Recommendations

After this removal, please verify:

1. ✅ Application starts without errors
2. ✅ Navigation sidebar displays correctly
3. ✅ Fabric (OpenCTI) tab works properly
4. ✅ Auto (Activepieces) tab works properly
5. ✅ Health status indicator shows correct servers
6. ✅ Device linking only sends data to OpenCTI
7. ✅ No console errors related to missing SimsFrame
8. ✅ Terminal help command shows updated command list

## Notes

- This removal is clean and complete - no orphaned references remain
- All OpenBAS-related functionality has been removed
- The application architecture remains intact
- Port 2021 is now free for future use
- The health monitoring system continues to work for remaining servers
- Device linking service now only integrates with OpenCTI

## Future Considerations

If OpenBAS needs to be re-integrated in the future:
1. Restore the deleted files from version control
2. Re-add the navigation buttons
3. Re-add the server configurations
4. Re-add the health monitoring for port 2021
5. Re-add the device linking integration
6. Update the PORT_MAPPING.md documentation

---

**Removal completed successfully on October 5, 2025**
