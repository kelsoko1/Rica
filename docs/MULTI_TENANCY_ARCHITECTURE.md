# Rica Multi-Tenancy Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          RICA MULTI-TENANCY SYSTEM                       │
│                                                                          │
│  ┌────────────────┐         ┌──────────────┐         ┌───────────────┐ │
│  │  Rica-Landing  │────────▶│  Rica-API    │────────▶│  Kubernetes   │ │
│  │  (Frontend)    │         │  (Backend)   │         │  Cluster      │ │
│  └────────────────┘         └──────────────┘         └───────────────┘ │
│         │                           │                         │         │
│         │                           │                         │         │
│    ┌────▼────┐               ┌─────▼──────┐          ┌───────▼──────┐ │
│    │Firebase │               │  Tenant    │          │   Tenant     │ │
│    │  Auth   │               │  Manager   │          │  Namespaces  │ │
│    └─────────┘               └────────────┘          └──────────────┘ │
│         │                           │                         │         │
│         │                           │                         │         │
│    ┌────▼────┐               ┌─────▼──────┐          ┌───────▼──────┐ │
│    │ Credit  │               │   Credit   │          │   Rica-UI    │ │
│    │ Service │               │  Resource  │          │   Instances  │ │
│    └─────────┘               │  Manager   │          └──────────────┘ │
│                               └────────────┘                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## User Journey Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. AUTHENTICATION                                            │
│    ┌──────────────┐                                         │
│    │ Sign Up/Login│──▶ Firebase Auth ──▶ User ID Generated  │
│    └──────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CREDIT PURCHASE                                           │
│    ┌──────────────┐                                         │
│    │ Buy Credits  │──▶ ClickPesa ──▶ Credits Added          │
│    └──────────────┘    ($10 = 250 credits)                  │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TIER SELECTION                                            │
│    ┌──────────────┬──────────────┬──────────────┐          │
│    │Pay-As-You-Go │  Personal    │    Team      │          │
│    │  10 credits  │  50 credits  │  100 credits │          │
│    └──────────────┴──────────────┴──────────────┘          │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. TENANT PROVISIONING                                       │
│    ┌──────────────┐                                         │
│    │ Provision    │──▶ API Request ──▶ Kubernetes Deploy    │
│    └──────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. ACCESS ENVIRONMENT                                        │
│    ┌──────────────────────────────────────────────┐        │
│    │ https://{username}-{id}.rica.example.com     │        │
│    └──────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Kubernetes Tenant Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                                    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Namespace: rica-tenant-{TENANT_ID}                             │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  RESOURCE QUOTAS                                          │  │    │
│  │  │  • CPU: 500m - 4000m (based on tier)                     │  │    │
│  │  │  • Memory: 1Gi - 16Gi (based on tier)                    │  │    │
│  │  │  • Storage: 5Gi - 50Gi (based on tier)                   │  │    │
│  │  │  • Pods: Max 20                                           │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  NETWORK POLICY                                           │  │    │
│  │  │  • Ingress: Only from ingress-nginx                       │  │    │
│  │  │  • Egress: DNS + Same namespace                           │  │    │
│  │  │  • Isolation: Complete from other tenants                 │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐   │    │
│  │  │  DEPLOYMENTS & SERVICES                                  │   │    │
│  │  │                                                           │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │    │
│  │  │  │  Rica UI     │  │  OpenCTI     │  │  OpenBAS     │  │   │    │
│  │  │  │  Port: 80    │  │  Port: 4000  │  │  Port: 3000  │  │   │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │    │
│  │  │                                                           │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │    │
│  │  │  │Activepieces  │  │ Code Server  │  │   Ollama     │  │   │    │
│  │  │  │ Port: 2020   │  │ Port: 2021   │  │  Port: 2022  │  │   │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │    │
│  │  │                                                           │   │    │
│  │  │  ┌──────────────┐  ┌──────────────┐                     │   │    │
│  │  │  │ PostgreSQL   │  │    Redis     │                     │   │    │
│  │  │  │ Port: 5432   │  │  Port: 6379  │                     │   │    │
│  │  │  └──────────────┘  └──────────────┘                     │   │    │
│  │  └─────────────────────────────────────────────────────────┘   │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  PERSISTENT VOLUMES                                       │  │    │
│  │  │  • opencti-data (5-10Gi)                                 │  │    │
│  │  │  • openbas-data (3-5Gi)                                  │  │    │
│  │  │  • code-server-data (2-15Gi)                             │  │    │
│  │  │  • ollama-data (3-20Gi)                                  │  │    │
│  │  │  • postgres-data (5Gi)                                   │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  SECRETS                                                  │  │    │
│  │  │  • opencti-admin-password                                │  │    │
│  │  │  • openbas-admin-password                                │  │    │
│  │  │  • activepieces-api-key                                  │  │    │
│  │  │  • code-server-password                                  │  │    │
│  │  │  • postgres-password                                     │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  INGRESS (nginx)                                                │    │
│  │                                                                  │    │
│  │  https://{username}-{id}.rica.example.com                       │    │
│  │  ├── /           → rica-ui:80                                   │    │
│  │  ├── /opencti   → opencti:4000                                  │    │
│  │  ├── /openbas   → openbas:3000                                  │    │
│  │  ├── /activepieces → activepieces:2020                          │    │
│  │  ├── /code      → code-server:2021                              │    │
│  │  └── /ollama    → ollama:2022                                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Credit-Based Resource Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CREDIT RESOURCE MANAGER                               │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  CREDIT TRACKING                                                │    │
│  │                                                                  │    │
│  │  User Credits ──▶ Provisioning Check ──▶ Minimum Required?     │    │
│  │       │                                         │                │    │
│  │       │                                    ┌────▼────┐           │    │
│  │       │                                    │  YES    │           │    │
│  │       │                                    └────┬────┘           │    │
│  │       │                                         │                │    │
│  │       │                                         ▼                │    │
│  │       │                              ┌──────────────────┐        │    │
│  │       │                              │ Provision Tenant │        │    │
│  │       │                              └────────┬─────────┘        │    │
│  │       │                                       │                  │    │
│  │       ▼                                       ▼                  │    │
│  │  ┌─────────────────────────────────────────────────────┐        │    │
│  │  │  HOURLY CREDIT CONSUMPTION                          │        │    │
│  │  │                                                      │        │    │
│  │  │  Rica UI:        1 credit/hour                      │        │    │
│  │  │  OpenCTI:        5 credits/hour                     │        │    │
│  │  │  OpenBAS:        3 credits/hour                     │        │    │
│  │  │  Activepieces:   2 credits/hour                     │        │    │
│  │  │  Code Server:    2 credits/hour                     │        │    │
│  │  │  Ollama:         4 credits/hour                     │        │    │
│  │  │  Storage:        0.1 credits/GB/hour                │        │    │
│  │  └─────────────────────────────────────────────────────┘        │    │
│  │                           │                                      │    │
│  │                           ▼                                      │    │
│  │  ┌─────────────────────────────────────────────────────┐        │    │
│  │  │  MONITORING (Every 5 minutes)                       │        │    │
│  │  │                                                      │        │    │
│  │  │  Credits > 50  ──▶ Status: OK                       │        │    │
│  │  │  Credits 10-50 ──▶ Status: WARNING (Show alert)     │        │    │
│  │  │  Credits < 10  ──▶ Status: CRITICAL (Urgent alert)  │        │    │
│  │  │  Credits = 0   ──▶ Status: SUSPEND (Stop tenant)    │        │    │
│  │  └─────────────────────────────────────────────────────┘        │    │
│  │                           │                                      │    │
│  │                           ▼                                      │    │
│  │  ┌─────────────────────────────────────────────────────┐        │    │
│  │  │  ACTIONS                                            │        │    │
│  │  │                                                      │        │    │
│  │  │  Warning   ──▶ Notify user to buy credits           │        │    │
│  │  │  Critical  ──▶ Show urgent warning + redirect       │        │    │
│  │  │  Suspend   ──▶ Scale down pods to 0 replicas        │        │    │
│  │  │  Resume    ──▶ Scale up pods when credits added     │        │    │
│  │  └─────────────────────────────────────────────────────┘        │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## API Communication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         API REQUEST FLOW                                 │
│                                                                          │
│  ┌──────────────┐                                                       │
│  │   Browser    │                                                       │
│  └──────┬───────┘                                                       │
│         │                                                                │
│         │ POST /api/tenants/provision                                   │
│         │ Headers: x-user-id, x-user-email                              │
│         │ Body: { subscriptionTier, userCredits }                       │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  RICA-API (tenantRoutes.js)                              │          │
│  │                                                            │          │
│  │  1. Authenticate User (Firebase ID token)                 │          │
│  │  2. Extract userId and userEmail                          │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  3. Check Existing Tenant                                 │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  4. Validate Credits                                      │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  ┌──────────────────────────────────────────────┐        │          │
│  │  │  Credit Resource Manager                      │        │          │
│  │  │  • Check minimum credits for tier             │        │          │
│  │  │  • Return allowed/denied                      │        │          │
│  │  └──────────────────────────────────────────────┘        │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  5. Provision Tenant                                      │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  ┌──────────────────────────────────────────────┐        │          │
│  │  │  Tenant Manager                               │        │          │
│  │  │  • Generate tenant ID                         │        │          │
│  │  │  • Create namespace                           │        │          │
│  │  │  • Apply resource quotas                      │        │          │
│  │  │  • Deploy services                            │        │          │
│  │  │  • Configure ingress                          │        │          │
│  │  │  • Generate secrets                           │        │          │
│  │  └──────────────────────────────────────────────┘        │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  6. Start Credit Tracking                                 │          │
│  │     │                                                      │          │
│  │     ▼                                                      │          │
│  │  7. Return Tenant Info                                    │          │
│  └──────────────────────────────────────────────────────────┘          │
│         │                                                                │
│         │ Response: { tenant: {...}, creditInfo: {...} }                │
│         │                                                                │
│         ▼                                                                │
│  ┌──────────────┐                                                       │
│  │   Browser    │                                                       │
│  │  • Store tenant info                                                 │
│  │  • Redirect to tenant URL                                            │
│  └──────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW                                      │
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐   │
│  │   Firebase   │         │  LocalStorage│         │   Firestore  │   │
│  │              │         │              │         │              │   │
│  │ • User Auth  │────────▶│ • Tenant Info│────────▶│ • User Data  │   │
│  │ • User ID    │         │ • Credits    │         │ • Credits    │   │
│  │ • Email      │         │ • Tier       │         │ • Transactions│  │
│  └──────────────┘         └──────────────┘         └──────────────┘   │
│         │                         │                         │           │
│         │                         │                         │           │
│         ▼                         ▼                         ▼           │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │              RICA-LANDING (Frontend)                         │      │
│  │                                                               │      │
│  │  • TenantProvisioning.jsx                                    │      │
│  │  • tenantService.js                                          │      │
│  │  • creditService.js                                          │      │
│  │  • integrationService.js                                     │      │
│  └─────────────────────────────────────────────────────────────┘      │
│         │                                                               │
│         │ HTTP Requests                                                │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │              RICA-API (Backend)                              │      │
│  │                                                               │      │
│  │  • tenantRoutes.js                                           │      │
│  │  • tenantManager.js                                          │      │
│  │  • creditResourceManager.js                                  │      │
│  └─────────────────────────────────────────────────────────────┘      │
│         │                                                               │
│         │ Kubernetes API Calls                                         │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │              KUBERNETES CLUSTER                              │      │
│  │                                                               │      │
│  │  • Namespaces                                                │      │
│  │  • Deployments                                               │      │
│  │  • Services                                                  │      │
│  │  • Ingress                                                   │      │
│  │  • Secrets                                                   │      │
│  │  • PersistentVolumes                                         │      │
│  └─────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY ARCHITECTURE                            │
│                                                                          │
│  Layer 1: AUTHENTICATION                                                │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  • Firebase Authentication                                │          │
│  │  • ID Token Verification                                  │          │
│  │  • User-to-Tenant Mapping                                 │          │
│  └──────────────────────────────────────────────────────────┘          │
│                           │                                              │
│                           ▼                                              │
│  Layer 2: AUTHORIZATION                                                 │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  • RBAC (Role-Based Access Control)                      │          │
│  │  • Namespace-Scoped Permissions                           │          │
│  │  • ServiceAccount per Tenant                              │          │
│  └──────────────────────────────────────────────────────────┘          │
│                           │                                              │
│                           ▼                                              │
│  Layer 3: NETWORK ISOLATION                                             │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  • NetworkPolicy Enforcement                              │          │
│  │  • Ingress: Only from ingress-nginx                       │          │
│  │  • Egress: DNS + Same namespace only                      │          │
│  │  • No cross-tenant communication                          │          │
│  └──────────────────────────────────────────────────────────┘          │
│                           │                                              │
│                           ▼                                              │
│  Layer 4: RESOURCE ISOLATION                                            │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  • Dedicated Namespace per Tenant                         │          │
│  │  • ResourceQuota Enforcement                              │          │
│  │  • LimitRange for Pods                                    │          │
│  │  • Separate PersistentVolumes                             │          │
│  └──────────────────────────────────────────────────────────┘          │
│                           │                                              │
│                           ▼                                              │
│  Layer 5: DATA PROTECTION                                               │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │  • Secrets Encryption (Kubernetes)                        │          │
│  │  • TLS/SSL for All Traffic                                │          │
│  │  • Unique Passwords per Tenant                            │          │
│  │  • No Shared Credentials                                  │          │
│  └──────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SCALING ARCHITECTURE                             │
│                                                                          │
│  HORIZONTAL SCALING                                                     │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │                                                            │          │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │          │
│  │  │ Rica-API   │  │ Rica-API   │  │ Rica-API   │         │          │
│  │  │ Instance 1 │  │ Instance 2 │  │ Instance 3 │         │          │
│  │  └────────────┘  └────────────┘  └────────────┘         │          │
│  │         │                │                │               │          │
│  │         └────────────────┴────────────────┘               │          │
│  │                      │                                    │          │
│  │                      ▼                                    │          │
│  │           ┌──────────────────────┐                       │          │
│  │           │   Load Balancer      │                       │          │
│  │           └──────────────────────┘                       │          │
│  │                      │                                    │          │
│  │                      ▼                                    │          │
│  │           ┌──────────────────────┐                       │          │
│  │           │ Kubernetes Cluster   │                       │          │
│  │           └──────────────────────┘                       │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  VERTICAL SCALING                                                       │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │                                                            │          │
│  │  Tier Upgrades:                                           │          │
│  │  Pay-As-You-Go ──▶ Personal ──▶ Team                     │          │
│  │                                                            │          │
│  │  Resources Scale:                                         │          │
│  │  500m CPU ──▶ 2000m CPU ──▶ 4000m CPU                    │          │
│  │  1Gi RAM  ──▶ 4Gi RAM   ──▶ 8Gi RAM                      │          │
│  │  5Gi Disk ──▶ 20Gi Disk ──▶ 50Gi Disk                    │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                          │
│  CLUSTER SCALING                                                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │                                                            │          │
│  │  Auto-Scaling:                                            │          │
│  │  • Add nodes when CPU > 80%                               │          │
│  │  • Add nodes when Memory > 80%                            │          │
│  │  • Remove nodes when usage < 40%                          │          │
│  │                                                            │          │
│  │  Multi-Zone:                                              │          │
│  │  • Distribute across availability zones                   │          │
│  │  • High availability                                      │          │
│  │  • Disaster recovery                                      │          │
│  └──────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Legend**:
- `──▶` : Data/Control Flow
- `┌─┐` : Component/Container Boundary
- `│ │` : Vertical Connection
- `└─┘` : Component/Container End

**Color Coding** (if viewing with color support):
- 🔵 Blue: User-facing components
- 🟢 Green: Backend services
- 🟡 Yellow: Infrastructure
- 🔴 Red: Security layers
- 🟣 Purple: Data storage
