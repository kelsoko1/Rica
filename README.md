# Rica - Unified Cybersecurity Intelligence Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-blue.svg)](https://kubernetes.io/)

Rica is a comprehensive, cloud-native cybersecurity platform that unifies threat intelligence, security automation, AI-powered assistance, and collaborative workflows into a single, powerful interface.

## 🌟 Overview

Rica provides security teams with an integrated environment for:
- **Security Automation** - Visual workflow automation with Activepieces
- **AI-Powered Assistance** - Local LLM integration via Ollama for security insights
- **Code Development** - Integrated VS Code environment for security tooling
- **Team Collaboration** - Multi-user workspace with role-based access
- **Payment & Billing** - Flexible credit-based and subscription pricing models

## 🚀 Key Features

### Core Capabilities
- 🛡️ **Unified Security Dashboard** - Single pane of glass for all security operations
- 🤖 **Starry AI Assistant** - Chat with local LLMs (DeepSeek, Llama, Qwen) for security analysis
- ⚡ **Workflow Automation** - Visual automation builder with 200+ integrations
- 💻 **Integrated Development** - Full VS Code environment in your browser
- 👥 **Team Management** - Collaborative workspaces with profile sharing
- 📊 **Real-time Monitoring** - Health checks and status indicators for all services

### Multi-Tenancy Architecture
- 🏢 **Kubernetes-Based Isolation** - Each tenant gets dedicated namespace and resources
- 💳 **Credit-Based Billing** - Flexible pay-as-you-go and subscription models
- 🔒 **Enterprise Security** - Network isolation, RBAC, and encrypted communications
- 📈 **Auto-Scaling** - Dynamic resource allocation based on usage
- 🌐 **Custom Subdomains** - Unique URLs for each tenant

## 📋 Prerequisites

### System Requirements
- **OS**: Linux, macOS, or Windows with WSL2
- **RAM**: 16GB minimum (32GB recommended for AI features)
- **Storage**: 50GB available space
- **CPU**: 4 cores minimum (8 cores recommended)

### Software Dependencies
- **Docker**: 20.10+ with Docker Compose
- **Node.js**: 16.x or later
- **Kubernetes**: 1.24+ (for multi-tenancy)
- **Git**: Latest version

## ⚡ Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/rica.git
cd rica

# Create network (one-time setup)
docker network create rica-network

# Start all services
.\start-rica-complete.bat  # Windows
./start-rica-complete.sh   # Linux/Mac
```

### Option 2: Manual Setup

```bash
# 1. Start the network
docker network create rica-network

# 2. Start core services
docker-compose -f docker-compose.prod.yml up -d

# 3. Start headless servers
docker-compose -f docker-compose.headless-servers.yml up -d

# 4. Access Rica UI
open http://localhost:3000
```

### Access Points

Once running, access the following services:

- **Rica UI**: http://localhost:3000
- **Rica Landing**: http://localhost:3001
- **Activepieces**: http://localhost:2020
- **Code Server**: http://localhost:2021
- **Ollama**: http://localhost:2022

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Rica Platform                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Rica UI    │  │ Rica Landing │  │  Rica API    │ │
│  │   (Port 3000)│  │  (Port 3001) │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Headless Services Layer                  │  │
│  ├──────────────┬──────────────┬──────────────────┤  │
│  │ Activepieces │ Code Server  │     Ollama       │  │
│  │  (Port 2020) │ (Port 2021)  │   (Port 2022)    │  │
│  └──────────────┴──────────────┴──────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Data Layer                               │  │
│  ├──────────────┬──────────────┬──────────────────┤  │
│  │  PostgreSQL  │    Redis     │   File Storage   │  │
│  └──────────────┴──────────────┴──────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Service Descriptions

| Service | Purpose | Port | Technology |
|---------|---------|------|------------|
| **Rica UI** | Main dashboard interface | 3000 | React, Material-UI |
| **Rica Landing** | Marketing & payment portal | 3001 | React, Firebase |
| **Rica API** | Backend API services | 3002 | Node.js, Express |
| **Activepieces** | Workflow automation | 2020 | TypeScript, PostgreSQL |
| **Code Server** | VS Code in browser | 2021 | VS Code, Node.js |
| **Ollama** | Local LLM inference | 2022 | Go, LLM Models |
| **PostgreSQL** | Primary database | 5432 | PostgreSQL 15 |
| **Redis** | Cache & sessions | 6379 | Redis 7 |
| **Nginx** | Reverse proxy | 80/443 | Nginx |

## 💰 Pricing & Billing

### Subscription Tiers

| Tier | Monthly Cost | Credits | Resources | Best For |
|------|-------------|---------|-----------|----------|
| **Pay-As-You-Go** | $0 base | Buy as needed | Minimal | Testing & development |
| **Personal** | $49/month | 250 credits | 2 CPU, 4GB RAM | Individual users |
| **Team** | $199/month | 1000 credits | 4 CPU, 8GB RAM | Small teams |
| **Enterprise** | Custom | Custom | Custom | Large organizations |

### Credit System

- **Credit Packages**: $10 for 250 credits ($0.04 per credit)
- **Credit Costs** (per hour):
  - Rica UI: 1 credit
  - Activepieces: 2 credits
  - Code Server: 2 credits
  - Ollama: 4 credits
  - Storage: 0.1 credits/GB

### Payment Methods

Integrated with **ClickPesa** for global payments:
- 💳 Credit/Debit Cards (Visa, Mastercard)
- 📱 Mobile Money (M-Pesa, Airtel Money, Tigo Pesa)
- 💰 Digital Wallets (PayPal, Apple Pay, Google Pay)
- 🏦 Bank Transfers

## 🔐 Security

### Security Features

- 🔒 **Network Isolation** - Kubernetes NetworkPolicy per tenant
- 🛡️ **RBAC** - Role-based access control
- 🔑 **Secret Management** - Encrypted secrets per tenant
- 🔐 **SSL/TLS** - End-to-end encryption
- 🚨 **Security Headers** - Helmet.js protection
- 🔍 **Audit Logging** - Comprehensive activity logs
- 🚫 **Rate Limiting** - DDoS protection

### Authentication

- **Firebase Authentication** - Secure user management
- **Email/Password** - Traditional authentication
- **Google OAuth** - Social login
- **JWT Tokens** - Stateless session management
- **2FA Support** - Multi-factor authentication (coming soon)

For detailed security information, see [docs/SECURITY.md](docs/SECURITY.md).

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### Getting Started
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Multi-Tenancy Quick Start](docs/MULTI_TENANCY_QUICKSTART.md) - 5-minute setup guide
- [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) - Configuration options

### Architecture & Design
- [Architecture Overview](docs/RICA_ARCHITECTURE.md) - System architecture
- [Multi-Tenancy Guide](docs/MULTI_TENANCY_GUIDE.md) - Multi-tenant setup
- [Authentication](docs/AUTHENTICATION_ARCHITECTURE.md) - Auth system design

### Features & Integration
- [Automation](docs/AUTOMATION_README.md) - Workflow automation guide
- [Headless Services](docs/HEADLESS_SERVERS_README.md) - Service integration
- [Port Mapping](docs/PORT_MAPPING.md) - Service port reference

### Operations
- [Production Deployment](docs/PRODUCTION_DEPLOYMENT.md) - Production setup
- [Server Deployment](docs/SERVER_DEPLOYMENT_GUIDE.md) - Server configuration
- [Network Configuration](docs/NETWORK_FIX_GUIDE.md) - Docker networking

### Development
- [Contributing](docs/CONTRIBUTING.md) - Contribution guidelines
- [Changelog](docs/CHANGELOG.md) - Version history
- [UI Enhancements](docs/UI_ENHANCEMENTS_SUMMARY.md) - UI improvements

## 🛠️ Development

### Project Structure

```
rica/
├── rica-ui/              # Main dashboard application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── styles/       # CSS styles
│   └── public/           # Static assets
├── rica-landing/         # Marketing & payment site
│   ├── src/
│   └── public/
├── rica-api/             # Backend API
│   ├── routes/           # API routes
│   └── services/         # Business logic
├── k8s/                  # Kubernetes manifests
│   ├── tenant-*.yaml     # Tenant templates
│   └── services/         # Service definitions
├── docs/                 # Documentation
├── docker-compose.*.yml  # Docker configurations
└── scripts/              # Deployment scripts
```

### Local Development

```bash
# Install dependencies
cd rica-ui && npm install
cd ../rica-landing && npm install
cd ../rica-api && npm install

# Start development servers
cd rica-ui && npm start      # Port 3000
cd rica-landing && npm start # Port 3001
cd rica-api && npm start     # Port 3002
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testPathPattern=components
```

## 🚢 Deployment

### Docker Deployment

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete instructions.

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With all services
.\start-rica-complete.bat  # Windows
./start-rica-complete.sh   # Linux/Mac
```

### Kubernetes Deployment

See [docs/MULTI_TENANCY_GUIDE.md](docs/MULTI_TENANCY_GUIDE.md) for multi-tenant setup.

```bash
# Deploy multi-tenancy infrastructure
.\deploy-multi-tenancy.bat  # Windows
./deploy-multi-tenancy.sh   # Linux/Mac

# Deploy for specific tenant
kubectl apply -f k8s/tenant-namespace-template.yaml
kubectl apply -f k8s/tenant-rica-ui-deployment.yaml
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](docs/CONTRIBUTING.md) for details on:

- Code of Conduct
- Development workflow
- Coding standards
- Pull request process
- Testing requirements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Activepieces** - Workflow automation engine
- **Ollama** - Local LLM inference
- **Code Server** - VS Code in the browser
- **Firebase** - Authentication and database
- **ClickPesa** - Payment processing
- **Material-UI** - React component library

## 📞 Support

### Getting Help

- 📖 **Documentation**: Check the [docs/](docs/) directory
- 🐛 **Bug Reports**: [Open an issue](https://github.com/yourusername/rica/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/rica/discussions)
- 📧 **Email**: support@rica.example.com

### Community

- 💬 [Discord Server](https://discord.gg/rica)
- 🐦 [Twitter](https://twitter.com/rica_platform)
- 📺 [YouTube Channel](https://youtube.com/rica)

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Core platform functionality
- ✅ Multi-tenancy support
- ✅ Credit-based billing
- ✅ AI assistant integration
- ✅ Workflow automation

### Upcoming Features (v1.1)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application
- 🔄 API marketplace
- 🔄 Advanced threat hunting
- 🔄 Compliance reporting

### Future Plans (v2.0)
- 📋 Machine learning models
- 📋 Advanced SOAR capabilities
- 📋 Threat intelligence feeds
- 📋 Incident response automation
- 📋 Custom integrations SDK

## 📊 Status

- **Build**: ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
- **Coverage**: ![Coverage](https://img.shields.io/badge/coverage-85%25-green)
- **Version**: ![Version](https://img.shields.io/badge/version-1.0.0-blue)
- **License**: ![License](https://img.shields.io/badge/license-MIT-blue)

---

**Made with ❤️ by the Rica Team**

*Empowering security teams with unified intelligence and automation*
