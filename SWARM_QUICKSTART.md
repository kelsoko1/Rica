# Swarm Browser - Quick Start Guide

## 🚀 Getting Started

The Swarm browser now features a **GoLogin-style interface** powered by the **CamouFox anti-detect engine**. This guide will help you get started quickly.

## 📋 Prerequisites

- Node.js installed
- Rica UI running
- react-icons package installed (automatically installed with `npm install`)

## 🎯 Quick Start Steps

### 1. Start the Rica UI

```bash
cd c:\Users\kelvin\Desktop\Rica\rica-ui
npm start
```

### 2. Navigate to Swarm

- Click on the **"Swarm"** icon in the left sidebar
- The GoLogin-style interface will load

### 3. Create Your First Profile

**Option A: Use Default Profiles**
- Three sample profiles are automatically created on first load:
  - Facebook - Zen
  - Facebook - Trevor  
  - Facebook - Neal

**Option B: Create New Profile**
1. Click the green **"Create profile"** button (top-right)
2. A new profile is created with:
   - Auto-generated name
   - Unique CamouFox fingerprint
   - "New" tag

### 4. Start a Browser Session

1. Find your profile in the table
2. Click the green **"Start"** button
3. Browser session opens with:
   - Profile name and CamouFox badge in header
   - Initial tab with Google homepage
   - URL bar for navigation

### 5. Browse the Web

**Navigate to a URL:**
1. Click in the URL bar
2. Type a website address (e.g., `facebook.com`)
3. Press Enter

**Open New Tab:**
- Click the **"+"** button in the tab bar

**Switch Tabs:**
- Click on any tab to make it active

**Close Tab:**
- Click the **"×"** on the tab
- Closing the last tab ends the browser session

## 🎨 Interface Overview

```
┌─────────────┬──────────────────────────────────────────────────┐
│             │  🔍 Search   🔄 Refresh  🔽 Filters  ➕ Create   │
│  🌐 Swarm   ├──────────────────────────────────────────────────┤
│             │  🌐 Profiles │ Proxies │ Tags │ Statuses │ ⚙️    │
│ 🌐 Browsers ├──────────────────────────────────────────────────┤
│ 👥 Teams    │ ☑ │ Name ↓  │ Status │ Proxy │ Tags │ Actions   │
│ 🤖 Auto     ├──────────────────────────────────────────────────┤
│ ⚙️  Settings│ ☐ │ Profile1│ Active │ Proxy │ New  │ ▶ Start   │
│             │ ☐ │ Profile2│ Active │ Proxy │      │ ▶ Start   │
├─────────────┤                                                   │
│ [Avatar] TI │                                                   │
│ Trial-3days │                                                   │
└─────────────┴──────────────────────────────────────────────────┘
```

## 🔧 Common Tasks

### Search for Profiles

1. Click in the search box (top-left)
2. Type to filter by:
   - Profile name
   - Status
   - Proxy
   - Tags

### Duplicate a Profile

1. Find the profile you want to copy
2. Click the **copy icon** (📋)
3. A new profile is created with:
   - "(Copy)" appended to name
   - Fresh CamouFox fingerprint

### Delete a Profile

1. Find the profile to delete
2. Click the **trash icon** (🗑️)
3. Confirm deletion in popup

### Select Multiple Profiles

1. Check the boxes next to profiles
2. Or click the header checkbox to select all
3. (Bulk operations coming soon)

### Change Rows Per Page

1. Scroll to bottom of table
2. Click the dropdown (default: 25)
3. Select: 10, 25, 50, or 100

## 🎭 CamouFox Features

Each profile includes a unique fingerprint:

- **User Agent**: Randomized browser signature
- **Platform**: Windows, macOS, or Linux
- **Language**: en-US, en-GB, es-ES, fr-FR, or de-DE
- **Timezone**: Major timezones worldwide
- **Screen Resolution**: Common resolutions
- **WebGL**: Unique vendor/renderer
- **Canvas**: Noise generation
- **Hardware**: Randomized cores and memory

## 💡 Tips & Tricks

### Best Practices

1. **Descriptive Names**: Use clear profile names (e.g., "Facebook - Marketing")
2. **Use Tags**: Organize profiles with tags ("Active", "Testing", etc.)
3. **Close Sessions**: Close browser sessions when done to free resources
4. **Regular Cleanup**: Delete unused profiles periodically

### Performance Tips

1. **Limit Open Sessions**: Don't run too many profiles simultaneously
2. **Close Unused Tabs**: Close tabs you're not using
3. **Use Pagination**: Set appropriate rows per page for your workflow
4. **Search First**: Use search to quickly find profiles

### Security Tips

1. **Unique Profiles**: Use separate profiles for different accounts
2. **Fresh Fingerprints**: Duplicate profiles to get new fingerprints
3. **Proxy Configuration**: Configure proxies for each profile
4. **Don't Share**: Don't share profiles across team members

## 🐛 Troubleshooting

### Profile Won't Start

**Problem**: Clicking "Start" does nothing

**Solutions**:
- Check browser console (F12) for errors
- Try duplicating the profile
- Refresh the page and try again

### Tabs Not Loading

**Problem**: Tabs show blank or loading forever

**Solutions**:
- Check your internet connection
- Verify the URL is correct
- Try a different website
- Close and restart the browser session

### Profiles Not Saving

**Problem**: Profiles disappear after refresh

**Solutions**:
- Check if localStorage is enabled in your browser
- Clear browser cache and reload
- Check browser console for storage errors

### Search Not Working

**Problem**: Search doesn't filter profiles

**Solutions**:
- Clear the search box and try again
- Check for typos in your search query
- Refresh the page

## 📊 What's Different from GoLogin?

| Feature | GoLogin | Swarm (Rica) |
|---------|---------|--------------|
| **UI Design** | ✅ | ✅ Matching |
| **Anti-Detect** | Proprietary | CamouFox |
| **Price** | 💰 Paid | ✅ Free |
| **Cloud Sync** | ✅ | ❌ Local |
| **Team Features** | ✅ | 🔄 Coming |
| **Automation** | ✅ | 🔄 Coming |

## 🚀 Next Steps

### Explore More Features

1. **Teams Tab**: (Coming Soon) Collaborate with team members
2. **Automation Tab**: (Coming Soon) Record and replay actions
3. **Settings Tab**: (Coming Soon) Configure global settings

### Advanced Usage

1. **Proxy Management**: Configure proxies for anonymity
2. **Tag Organization**: Create custom tags for workflow
3. **Bulk Operations**: Select multiple profiles for batch actions
4. **Profile Templates**: Save common configurations

## 📚 Additional Resources

- **Full Documentation**: See `SWARM_GOLOGIN_UI.md`
- **CamouFox Docs**: Learn about fingerprint protection
- **Rica Platform**: Explore other Rica features

## 🆘 Need Help?

- **GitHub Issues**: Report bugs or request features
- **Discord Community**: Join the Rica community
- **Email Support**: support@rica.com

## 🎉 You're Ready!

You now know how to:
- ✅ Create browser profiles
- ✅ Start browser sessions
- ✅ Manage multiple tabs
- ✅ Navigate the web anonymously
- ✅ Organize and search profiles

**Happy browsing with CamouFox! 🦊**

---

**Quick Reference Card**

```
CREATE PROFILE:  Click "Create profile" button
START SESSION:   Click green "Start" button
NEW TAB:         Click "+" in tab bar
CLOSE TAB:       Click "×" on tab
NAVIGATE:        Type URL and press Enter
SEARCH:          Use search box (top-left)
DUPLICATE:       Click copy icon (📋)
DELETE:          Click trash icon (🗑️)
CLOSE SESSION:   Click "×" in session header
```
