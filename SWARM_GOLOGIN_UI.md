# Swarm Browser - GoLogin-Style UI with CamouFox Engine

## Overview

The Swarm browser has been completely redesigned to match the GoLogin browser interface while using **CamouFox** as the anti-detect browser engine. This provides a professional, familiar interface for managing multiple browser profiles with advanced fingerprint protection.

## Key Features

### 1. **GoLogin-Style Interface**
- **Left Sidebar Navigation**: Quick access to Browsers, Teams, Automation, and Settings
- **Top Action Bar**: Search, refresh, filters, and create profile buttons
- **Content Tabs**: Profiles, Proxies, Tags, Statuses, and Extras
- **Table View**: Clean, organized display of all browser profiles
- **Pagination**: Handle large numbers of profiles efficiently

### 2. **CamouFox Anti-Detect Engine**
CamouFox provides advanced browser fingerprint protection with:
- **User Agent Spoofing**: Randomized user agents per profile
- **Platform Emulation**: Windows, macOS, and Linux emulation
- **WebGL Spoofing**: Unique WebGL vendor and renderer per profile
- **Canvas Fingerprinting**: Canvas noise generation for uniqueness
- **Hardware Fingerprinting**: Randomized hardware concurrency and device memory
- **Timezone & Language**: Customizable timezone and language settings
- **Screen Resolution**: Configurable screen resolution per profile

### 3. **Profile Management**
- **Create Profiles**: Quick profile creation with auto-generated fingerprints
- **Start Profiles**: Launch isolated browser sessions
- **Duplicate Profiles**: Clone existing profiles with new fingerprints
- **Edit Profiles**: Modify profile settings and configurations
- **Delete Profiles**: Remove unwanted profiles
- **Bulk Selection**: Select multiple profiles for batch operations

### 4. **Browser Sessions**
- **Multi-Tab Support**: Open multiple tabs within each profile
- **URL Navigation**: Address bar for easy navigation
- **Tab Management**: Create, switch, and close tabs
- **Session Isolation**: Each profile maintains its own cookies and storage
- **Profile Switching**: Easily switch between different browser profiles

## Interface Components

### Left Sidebar
```
┌─────────────────┐
│ 🌐 Swarm        │
├─────────────────┤
│ 🌐 Browsers     │ ← Active
│ 👥 Teams        │
│ 🤖 Automation   │
│ ⚙️  Settings    │
├─────────────────┤
│ [User Avatar]   │
│ Trial - 3 days  │
│ [Logout]        │
└─────────────────┘
```

### Top Action Bar
```
┌────────────────────────────────────────────────────────────┐
│ 🔍 Search...  │  🔄 Refresh  🔽 Filters  ➕ Create profile │
└────────────────────────────────────────────────────────────┘
```

### Content Tabs
```
┌────────────────────────────────────────────────────────────┐
│ 🌐 Profiles │ Proxies │ Tags │ Statuses │ ⚙️ Extras       │
└────────────────────────────────────────────────────────────┘
```

### Profiles Table
```
┌──────────────────────────────────────────────────────────────────────┐
│ ☑ │ Name ↓          │ Status    │ Proxy      │ Tags        │ Actions │
├──────────────────────────────────────────────────────────────────────┤
│ ☐ │ 🌐 Facebook-Zen │ No status │ SmartProxy │ Active, New │ ▶ Start │
│ ☐ │ 🌐 Facebook-Joe │ No status │ SP HTTP    │             │ ▶ Start │
└──────────────────────────────────────────────────────────────────────┘
```

## Usage Guide

### Creating a New Profile

1. Click the **"Create profile"** button in the top-right corner
2. A new profile will be created with:
   - Auto-generated name (e.g., "New Profile 1")
   - Random CamouFox fingerprint
   - Default settings
   - "New" tag

### Starting a Browser Session

1. Find your profile in the table
2. Click the **"Start"** button
3. The browser session will open with:
   - Profile-specific fingerprint applied
   - Isolated cookies and storage
   - Initial tab with Google homepage
   - URL bar for navigation

### Managing Tabs

**Create New Tab:**
- Click the **"+"** button in the tab bar

**Switch Tabs:**
- Click on any tab to make it active

**Close Tab:**
- Click the **"×"** button on the tab
- Last tab closes the entire browser session

**Navigate:**
- Enter URL in the address bar
- Press Enter to navigate

### Profile Actions

**Duplicate Profile:**
- Click the copy icon (📋) to create a clone
- New profile gets a fresh CamouFox fingerprint

**Edit Profile:**
- Click the edit icon (✏️) to modify settings

**Delete Profile:**
- Click the delete icon (🗑️)
- Confirm deletion in the popup

### Search and Filter

**Search:**
- Use the search box to filter by:
  - Profile name
  - Status
  - Proxy
  - Tags

**Filters:**
- Click "Filters" button for advanced filtering options

### Pagination

**Rows Per Page:**
- Select 10, 25, 50, or 100 rows per page

**Navigation:**
- Use ‹ and › buttons to navigate pages
- View current range (e.g., "1-25 of 100")

## CamouFox Fingerprint Details

Each profile includes a unique fingerprint with:

```javascript
{
  userAgent: "Mozilla/5.0 (Win32) AppleWebKit/537.36...",
  platform: "Win32" | "MacIntel" | "Linux x86_64",
  language: "en-US" | "en-GB" | "es-ES" | "fr-FR" | "de-DE",
  timezone: "America/New_York" | "Europe/London" | ...,
  screenResolution: "1920x1080" | "1366x768" | ...,
  webglVendor: "Intel Inc.",
  webglRenderer: "Intel Iris OpenGL Engine",
  canvasNoise: "random_string",
  hardwareConcurrency: 2-10 cores,
  deviceMemory: 2 | 4 | 8 | 16 GB
}
```

## Data Persistence

**LocalStorage:**
- All profiles are saved to `localStorage` under key `swarmProfiles`
- Profiles persist across browser sessions
- Automatic save on any profile change

**Profile Data Structure:**
```javascript
{
  id: timestamp,
  name: "Profile Name",
  status: "No status",
  proxy: "Proxy Name",
  proxyDetails: "Connection details",
  tags: ["Active", "New"],
  fingerprint: { /* CamouFox fingerprint */ },
  lastUsed: ISO_date_string,
  created: ISO_date_string
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + T` | New tab (when in browser session) |
| `Ctrl + W` | Close current tab |
| `Ctrl + Tab` | Switch to next tab |
| `Ctrl + Shift + Tab` | Switch to previous tab |
| `Ctrl + L` | Focus URL bar |
| `Esc` | Close browser session |

## Browser Session Features

### Iframe Sandboxing
Each tab runs in a sandboxed iframe with:
- `allow-same-origin`: Required for proper page rendering
- `allow-scripts`: Enable JavaScript execution
- `allow-popups`: Handle popup windows
- `allow-forms`: Enable form submissions
- `allow-downloads`: Allow file downloads

### Lazy Loading
- Iframes use lazy loading for better performance
- Only active tabs load content immediately
- Inactive tabs load when switched to

### Security
- Each profile maintains isolated storage
- Cookies are profile-specific
- No cross-profile data leakage

## Analytics & Tracking

The system tracks:
- **Profile Creation**: When new profiles are created
- **Profile Start**: When browser sessions are launched
- **Profile Duplication**: When profiles are cloned
- **Profile Deletion**: When profiles are removed
- **Tab Management**: Tab creation and closure
- **URL Navigation**: Page navigation events

## Responsive Design

The interface adapts to different screen sizes:

**Desktop (> 1024px):**
- Full sidebar with text labels
- All table columns visible
- Horizontal action buttons

**Tablet (768px - 1024px):**
- Collapsed sidebar (icons only)
- Condensed table columns
- Stacked action buttons

**Mobile (< 768px):**
- Hidden sidebar (hamburger menu)
- Minimal table view
- Vertical action buttons

## Comparison: GoLogin vs Swarm

| Feature | GoLogin | Swarm (Rica) |
|---------|---------|--------------|
| **UI Design** | ✅ Professional | ✅ Matching |
| **Anti-Detect Engine** | Proprietary | CamouFox |
| **Profile Management** | ✅ Full | ✅ Full |
| **Multi-Tab Support** | ✅ Yes | ✅ Yes |
| **Team Collaboration** | ✅ Yes | 🔄 Coming Soon |
| **Proxy Management** | ✅ Advanced | 🔄 Basic |
| **Automation** | ✅ Yes | 🔄 Coming Soon |
| **Cloud Sync** | ✅ Yes | ❌ Local Only |
| **Price** | 💰 Subscription | ✅ Free |

## Future Enhancements

### Planned Features
1. **Team Collaboration**: Share profiles with team members
2. **Proxy Management**: Built-in proxy testing and rotation
3. **Automation Scripts**: Record and replay user actions
4. **Cloud Sync**: Sync profiles across devices
5. **Profile Templates**: Pre-configured profile templates
6. **Cookie Management**: Import/export cookies
7. **Extension Support**: Browser extension management
8. **Profile Groups**: Organize profiles into folders
9. **Bulk Operations**: Batch edit, delete, or start profiles
10. **Advanced Filters**: Complex filtering and sorting options

### Performance Improvements
- Virtual scrolling for large profile lists
- Profile caching for faster loading
- Optimized fingerprint generation
- Background profile updates

## Troubleshooting

### Profile Not Starting
**Issue**: Click "Start" but nothing happens
**Solution**: 
- Check browser console for errors
- Verify profile data is valid
- Try duplicating the profile

### Tabs Not Loading
**Issue**: Tabs show blank or loading indefinitely
**Solution**:
- Check internet connection
- Verify URL is valid
- Try refreshing the tab
- Check iframe sandbox permissions

### Profiles Not Saving
**Issue**: Profiles disappear after refresh
**Solution**:
- Check browser localStorage is enabled
- Verify localStorage quota not exceeded
- Check browser console for errors

### Search Not Working
**Issue**: Search doesn't filter profiles
**Solution**:
- Clear search box and try again
- Check for typos in search query
- Verify profiles have matching data

## Technical Architecture

### Component Structure
```
SwarmUI (Main Component)
├── Sidebar Navigation
│   ├── Logo
│   ├── Nav Items
│   └── User Info
├── Main Content Area
│   ├── Top Action Bar
│   │   ├── Search Box
│   │   └── Action Buttons
│   ├── Content Tabs
│   └── Profiles Table
│       ├── Table Header
│       ├── Table Body
│       └── Pagination
└── Browser Session View
    ├── Session Header
    ├── Tabs Bar
    ├── URL Bar
    └── Content Area (iframes)
```

### State Management
- **React Hooks**: useState, useEffect, useCallback
- **LocalStorage**: Profile persistence
- **Memoization**: Performance optimization with memo()
- **Error Boundaries**: Graceful error handling

### Styling
- **CSS Modules**: Component-scoped styles
- **Flexbox**: Responsive layouts
- **CSS Variables**: Theme customization
- **Transitions**: Smooth animations

## Best Practices

### Profile Management
1. Use descriptive profile names
2. Add relevant tags for organization
3. Configure proxies for each profile
4. Regularly update profile settings
5. Delete unused profiles

### Browser Sessions
1. Close tabs when done to free resources
2. Use separate profiles for different accounts
3. Don't share profiles across team members
4. Monitor running profiles
5. Close sessions when not in use

### Security
1. Use unique fingerprints per profile
2. Configure proxies for anonymity
3. Don't reuse profiles across platforms
4. Regularly rotate fingerprints
5. Monitor for detection issues

## Support & Resources

### Documentation
- [CamouFox Documentation](https://camoufox.com/docs)
- [Rica Platform Guide](./README.md)
- [Browser Fingerprinting Guide](./FINGERPRINTING.md)

### Community
- GitHub Issues: Report bugs and request features
- Discord: Join the Rica community
- Email: support@rica.com

## License

This component is part of the Rica platform and is licensed under the MIT License.

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-02  
**Engine**: CamouFox Anti-Detect Browser  
**UI Design**: GoLogin-Inspired Interface
