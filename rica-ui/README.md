# Rica - AI-native Cyber Cockpit

Rica is an advanced cybersecurity operations platform with a Palantir Gotham-inspired UI. It integrates threat intelligence, attack simulation, and AI assistance into a unified interface for security professionals.

## Features

### Modern Palantir Gotham-Style UI
- Dark, professional theme with clean, modern design
- Multi-panel layout with resizable components
- Responsive design for different screen sizes

### Project Explorer & Code Editor
- VS Code-like file explorer with folder structure
- Code editor with syntax highlighting
- Multiple file tabs for easy navigation

### Integrated Terminal
- Full-featured terminal with command history
- Interactive command input with simulated responses
- Resizable panel that works across different views

### Problems & Diagnostics
- Real-time problem detection and reporting
- Categorized warnings and errors with detailed information
- Clickable file locations for quick navigation

### Output & Debug Console
- Dedicated output panel for application logs
- Debug console for runtime information
- Timestamped entries for better tracking

### Graph Visualization
- Interactive node-based graph visualization
- Different node types with visual distinction
- Node selection and detailed information display

### Starry AI Assistant
- AI-powered assistant for cybersecurity tasks
- Chat interface with message history
- Suggested prompts for common tasks

## Technical Stack
- React.js for the frontend
- Node.js Express middleware for the backend
- Integration with  for threat intelligence
- Integration with /Camoufox for attack simulation
- Ollama for local LLM capabilities

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   cd rica-ui
   npm install
   python -m pip install -r requirements.txt
   ```
3. Install CamouFox:
   ```bash
   # Install CamouFox from PyPI
   python -m pip install camoufox
   
   # Install Playwright
   python -m playwright install firefox
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Browser Profile Management

Rica includes a powerful browser profile management system built on CamouFox:

### Features
- Create and manage multiple browser profiles
- Customize fingerprints (User Agent, Platform, WebGL, etc.)
- Proxy support for each profile
- Profile sharing within teams
- Active session management

### Profile Configuration
Profiles support extensive customization:
- Browser type (Firefox/Chrome emulation)
- Platform (Windows/MacOS/Linux)
- Screen resolution
- Language and timezone
- WebGL parameters
- Custom user agents
- Proxy settings

### Anti-Detection Features
- Undetectable fingerprint modification
- WebRTC protection
- Font fingerprint spoofing
- Canvas noise generation
- Hardware concurrency randomization
- Timezone and locale spoofing

### Usage
1. Create a new profile in the Profile Manager
2. Configure fingerprint settings
3. Click 'Launch' to start an isolated browser session
4. Use 'Stop' to end the session

### Team Collaboration
- Share profiles with team members
- Track shared profile usage
- Manage team access permissions
- Real-time profile status updates

## Production Deployment

For production deployment, build the optimized version:

```bash
npm run build
```

This creates a `build` folder with production-ready files that can be served by any static file server.

## Integration with External Services

Rica is designed to integrate with:

- **CamouFox** - Anti-detect browser for profile management
  - Undetectable browser fingerprint modification
  - Proxy support and IP protection
  - Team-based profile sharing
- **** - For threat intelligence data
- **** - For breach and attack simulation
- **Ollama** - For local LLM capabilities

Configure the connection details in the `.env` file of the `rica-api` service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
