# ES Module Migration for Rica API

## Overview
The Rica API has been migrated from CommonJS (`require`/`module.exports`) to ES Modules (`import`/`export`) to resolve compatibility issues with the latest version of `@kubernetes/client-node` package.

## Changes Made

### 1. Package Configuration
**File:** `package.json`
- Added `"type": "module"` to enable ES module support

### 2. Core Files Converted

#### tenantManager.js
- ✅ Converted `require('@kubernetes/client-node')` to `import`
- ✅ Converted `require('crypto')` to `import`
- ✅ Converted `require('fs').promises` to `import { promises as fs }`
- ✅ Converted `require('path')` to `import`
- ✅ Added `__dirname` support using `fileURLToPath` and `dirname`
- ✅ Changed `module.exports` to `export default`

#### creditResourceManager.js
- ✅ Converted `require('./tenantManager')` to `import tenantManager from './tenantManager.js'`
- ✅ Changed `module.exports` to `export default`

#### tenantRoutes.js
- ✅ Converted `require('express')` to `import express`
- ✅ Converted local imports to use `.js` extension
- ✅ Changed `module.exports` to `export default`

#### index.js
- ✅ Converted all `require()` statements to `import`
- ✅ Added `__dirname` support for ES modules
- ✅ Imported `tenantRoutes` and `creditResourceManager`
- ✅ Mounted tenant routes at `/api/tenants`
- ✅ Initialized credit monitoring on startup

## Important Notes

### File Extensions
When using ES modules, you **must** include the `.js` extension in relative imports:
```javascript
// ❌ Wrong
import tenantManager from './tenantManager';

// ✅ Correct
import tenantManager from './tenantManager.js';
```

### __dirname in ES Modules
ES modules don't have `__dirname` by default. We added it using:
```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Dynamic Imports
If you need to conditionally import modules, use dynamic imports:
```javascript
// Instead of:
const module = require('./module');

// Use:
const module = await import('./module.js');
```

## Testing the Migration

### 1. Install Dependencies
```bash
cd ~/Rica/rica-api
npm install
```

### 2. Set Environment Variables
Create a `.env` file:
```bash
# Required
API_KEY=your-secure-api-key-here
KUBERNETES_CONFIG=/path/to/kubeconfig

# Optional
PORT=3001
NODE_ENV=development
_GRAPHQL_URL=http://localhost:4000/graphql
_API_URL=http://localhost:8080/api
```

### 3. Start the Server
```bash
npm start
```

### 4. Test Health Endpoint
```bash
curl -H "x-api-key: your-secure-api-key-here" http://localhost:3001/api/health
```

### 5. Test Tenant Provisioning
```bash
curl -X POST http://localhost:3001/api/tenants/provision \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secure-api-key-here" \
  -H "x-user-id: user123" \
  -H "x-user-email: user@example.com" \
  -d '{
    "subscriptionTier": "pay-as-you-go",
    "userCredits": 100
  }'
```

## API Endpoints

### Tenant Management
- `POST /api/tenants/provision` - Provision a new tenant
- `GET /api/tenants/:tenantId` - Get tenant information
- `GET /api/tenants/:tenantId/status` - Get tenant status
- `PUT /api/tenants/:tenantId/tier` - Update subscription tier
- `DELETE /api/tenants/:tenantId` - Deprovision tenant
- `GET /api/tenants/user/:userId` - Get tenant by user ID
- `GET /api/tenants` - List all tenants

### Credit Management
- `GET /api/tenants/:tenantId/credits` - Get credit usage report
- `POST /api/tenants/:tenantId/suspend` - Suspend tenant (low credits)
- `POST /api/tenants/:tenantId/resume` - Resume tenant
- `GET /api/tenants/tier/:tier/cost` - Get estimated monthly cost

### Health Check
- `GET /api/health` - API health status

## Troubleshooting

### Error: Cannot find module
**Problem:** Import statements fail with "Cannot find module"
**Solution:** Ensure all relative imports include the `.js` extension

### Error: __dirname is not defined
**Problem:** Code tries to use `__dirname` directly
**Solution:** Use the `fileURLToPath` pattern shown above

### Error: require() of ES Module not supported
**Problem:** Mixing CommonJS and ES modules
**Solution:** Ensure all files use `import`/`export` syntax

### Kubernetes Connection Issues
**Problem:** Cannot connect to Kubernetes cluster
**Solution:** 
1. Ensure `KUBERNETES_CONFIG` environment variable points to valid kubeconfig
2. Or ensure the API is running in a Kubernetes pod with proper RBAC
3. Check that `kubectl` works from the same environment

## Next Steps

1. ✅ ES Module migration complete
2. ⏳ Test all API endpoints
3. ⏳ Deploy to production environment
4. ⏳ Update Rica-Landing integration
5. ⏳ Monitor credit tracking and tenant provisioning

## References

- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [Kubernetes Client Node](https://github.com/kubernetes-client/javascript)
- [Multi-Tenancy Guide](../docs/MULTI_TENANCY_GUIDE.md)
