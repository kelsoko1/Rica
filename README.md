# Rica - AI-Powered Code Editor

Rica is an intelligent code editor powered by DeepSeek Coder, providing advanced code editing, explanation, and automation capabilities.

## Features

- 🤖 AI-powered code editing and suggestions
- 🔍 Intelligent code analysis and explanations
- ⚡ Real-time code completion
- 🛠️ Automated refactoring
- 🐞 Smart debugging assistance
- 📝 Code documentation generation
- 🧪 Test case generation

## Prerequisites

- Python 3.8 or later
- Node.js 14 or later
- 16GB RAM minimum (32GB recommended)
- NVIDIA GPU with 8GB VRAM minimum for optimal performance

## Quick Start

1. Clone this repository
2. Run `setup.bat` (Windows) or `setup.sh` (Linux/Mac)
3. Follow the terminal prompts

## Manual Setup

If the automatic setup doesn't work, you can set up the components manually:

1. Set up the model server:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   python setup.py
   cd rica-server
   pip install -r requirements.txt
   python server.py
   ```

2. Set up the API server:
   ```bash
   cd rica-api
   npm install
   npm start
   ```

3. Set up the frontend:
   ```bash
   cd rica-ui
   npm install
   npm start
   ```

## Configuration

1. Model settings can be configured in `rica-server/server.py`
2. API settings can be configured in `rica-api/.env`
3. Frontend settings can be configured in `rica-ui/.env`

## Usage

1. Open http://localhost:3000 in your browser
2. Use the code editor as you normally would
3. Access AI features through:
   - Command palette (Ctrl/Cmd + Shift + P)
   - Right-click menu
   - Starry AI sidebar

## Available Commands

- `explain` - Get an explanation of selected code
- `refactor` - Get suggestions for code improvement
- `debug` - Get help with debugging
- `test` - Generate test cases
- `find` - Search for similar code patterns
- `create` - Generate new code
- `edit` - Get suggestions for code changes

## Keyboard Shortcuts

- Ctrl/Cmd + Shift + E - Explain code
- Ctrl/Cmd + Shift + R - Refactor code
- Ctrl/Cmd + Shift + D - Debug code
- Ctrl/Cmd + Shift + T - Generate tests
- Ctrl/Cmd + Shift + Space - Open AI suggestions

## Troubleshooting

1. If the model server fails to start:
   - Check if you have enough RAM and VRAM
   - Try running with `--load_in_8bit` instead of `--load_in_4bit`
   - Use CPU-only mode by removing `device_map="auto"`

2. If the API server fails to start:
   - Check if port 3001 is available
   - Verify environment variables in `.env`

3. If the frontend fails to start:
   - Check if port 3000 is available
   - Clear npm cache and node_modules

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT License - feel free to use this in your projects!
 MVP - AI-native Cyber Cockpit (Starry + Swarm + Sims)
This repository is an MVP scaffold that wires a lightweight **Node.js middleware (rica-api)** and a **React frontend (rica-ui)** to act as a polished UI for headless engines:
- **OpenCTI** (knowledge graph) — headless, run your own instance.
- **OpenBAS / Camoufox** (Breach & Attack Simulation) — headless engine.
- **Ollama** (local LLM runtime) used by **Starry / DeepSeek** copilot.

This scaffold is intended for fast MVP launch. It assumes you already have OpenCTI and OpenBAS (Camoufox) running in your environment (Docker or Kubernetes). The scaffold exposes:
- `rica-api` — the orchestration / fusion layer. Routes AI queries to Ollama and proxies calls to OpenCTI/OpenBAS.
- `rica-ui` — React-based Gotham-style UI shell (left nav, graph area placeholder, Starry right panel).

## What's included
- `rica-api/` : Node.js Express middleware with endpoints:
  - `GET /api/threat-actors` -> proxies OpenCTI GraphQL
  - `POST /api/simulate` -> posts to OpenBAS/Camoufox
  - `POST /api/starry` -> sends prompts to Ollama (or OpenAI if configured)
  - Credit wallet simulation (in-memory)
- `rica-ui/` : React frontend (Create React App style) with sidebar + center + Starry right panel; connects to rica-api.
- `docker-compose.yml` : service definitions for `rica-api` and `rica-ui` (development). Engines (OpenCTI/OpenBAS) expected to be external.

## Quick start (development)
1. Ensure OpenCTI and OpenBAS (Camoufox) are running and reachable:
   - OpenCTI GraphQL: e.g. `http://opencti:4000/graphql` or `http://localhost:4000/graphql`
   - OpenBAS API: e.g. `http://openbas:8080/api` or `http://localhost:8080/api`
2. Optional: Run Ollama locally for private LLM: `ollama serve` or follow Ollama docs.
3. From this repo root:
   ```bash
   # build & run via docker-compose (dev)
   docker-compose up --build
   ```
   This will start `rica-api` (port 3001) and `rica-ui` (port 3000). If you prefer to run locally:
   ```bash
   # Run API
   cd rica-api
   npm install
   npm run start

   # In a separate terminal: Run UI
   cd rica-ui
   npm install
   npm start
   ```

## Environment variables
Create `rica-api/.env` from `.env.example` and set:
- `OPENCTI_GRAPHQL_URL` - e.g. http://localhost:4000/graphql
- `OPENBAS_API_URL` - e.g. http://localhost:8080/api
- `OLLAMA_URL` - e.g. http://localhost:11434 (Ollama default)
- `API_KEY` - a token used to protect Rica API (for demo only)

## Production Deployment

### Prerequisites
- Docker and Docker Compose installed
- Access to a Docker registry (optional for production)
- Domain name and SSL certificate (for production)

### Environment Setup
1. Configure environment variables in `.env` files:
   - `rica-api/.env`: API settings, external service URLs, and security keys
   - `rica-ui/.env`: Frontend settings and API URL

2. For production, ensure these critical variables are set:
   - `NODE_ENV=production`
   - `API_KEY` with a strong, unique value
   - `DEEPSEEK_API_KEY` with your valid API key
   - `FRONTEND_URL` with your production domain

### Deployment Options

#### Option 1: Docker Compose (Recommended for small deployments)
```bash
# Build and run in production mode
NODE_ENV=production docker-compose up --build -d
```

#### Option 2: Kubernetes Deployment
1. Build and push Docker images to your registry:
```bash
docker build -t your-registry/rica-api:latest ./rica-api
docker build -t your-registry/rica-ui:latest ./rica-ui
docker push your-registry/rica-api:latest
docker push your-registry/rica-ui:latest
```

2. Apply Kubernetes manifests (examples in `k8s/` directory):
```bash
kubectl apply -f k8s/
```

#### Option 3: Cloud Provider Deployment
- **AWS**: Use ECS or EKS with Application Load Balancer
- **Azure**: Use AKS with Azure Container Registry
- **GCP**: Use GKE with Container Registry

### Security Considerations
- Use a reverse proxy (Nginx, Traefik) with SSL termination
- Implement proper network segmentation
- Set up monitoring and alerting
- Configure regular backups of data
- Use secrets management for sensitive values

### Scaling Recommendations
- Replace in-memory credit wallet with persistent DB (Postgres / Redis)
- Add authentication (OIDC / SSO, JWT), rate-limits, RBAC
- Move LLM inference to a managed inference cluster (vLLM / Ollama at scale)
- Run OpenCTI/OpenBAS behind private networks with secure service-to-service auth
- Use horizontal pod autoscaling in Kubernetes

## Files in zip
A production-ready guide and runnable demo code has been included. Read the `README` and `README_API.md` for endpoint details.

-- End of quickstart -- 
