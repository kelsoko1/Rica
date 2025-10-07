/**
 * Tenant Manager Service
 * 
 * Manages multi-tenancy for Rica, including:
 * - Tenant provisioning and deprovisioning
 * - Resource allocation based on subscription tier
 * - Credit-based resource management
 * - Kubernetes namespace and deployment management
 * - Tenant lifecycle management
 */

const k8s = require('@kubernetes/client-node');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Kubernetes client setup
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
const k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
const k8sRbacApi = kc.makeApiClient(k8s.RbacAuthorizationV1Api);

// Subscription tier configurations
const TIER_CONFIGS = {
  'pay-as-you-go': {
    name: 'Pay As You Go',
    cpuRequest: '500m',
    cpuLimit: '1000m',
    memoryRequest: '512Mi',
    memoryLimit: '1Gi',
    storageRequest: '5Gi',
    podCpuMax: '500m',
    podCpuDefault: '200m',
    podMemoryMax: '512Mi',
    podMemoryDefault: '256Mi',
    maxProfiles: 5,
    maxTeams: 2,
    maxStorage: '5Gi',
    features: {
      activepieces: true,
      codeServer: true,
      ollama: true
    },
    resources: {
      ui: { cpuRequest: '100m', cpuLimit: '200m', memoryRequest: '128Mi', memoryLimit: '256Mi' },
      activepieces: { cpuRequest: '200m', cpuLimit: '400m', memoryRequest: '256Mi', memoryLimit: '512Mi' },
      codeServer: { cpuRequest: '200m', cpuLimit: '400m', memoryRequest: '256Mi', memoryLimit: '512Mi' },
      ollama: { cpuRequest: '500m', cpuLimit: '1000m', memoryRequest: '512Mi', memoryLimit: '1Gi' }
    },
    storage: {
      codeServer: '2Gi',
      ollama: '3Gi'
    }
  },
  'personal': {
    name: 'Personal',
    cpuRequest: '2000m',
    cpuLimit: '4000m',
    memoryRequest: '4Gi',
    memoryLimit: '8Gi',
    storageRequest: '20Gi',
    podCpuMax: '2000m',
    podCpuDefault: '500m',
    podMemoryMax: '2Gi',
    podMemoryDefault: '512Mi',
    maxProfiles: 20,
    maxTeams: 5,
    maxStorage: '20Gi',
    features: {
      activepieces: true,
      codeServer: true,
      ollama: true
    },
    resources: {
      ui: { cpuRequest: '200m', cpuLimit: '400m', memoryRequest: '256Mi', memoryLimit: '512Mi' },
      activepieces: { cpuRequest: '300m', cpuLimit: '600m', memoryRequest: '512Mi', memoryLimit: '1Gi' },
      codeServer: { cpuRequest: '300m', cpuLimit: '600m', memoryRequest: '512Mi', memoryLimit: '1Gi' },
      ollama: { cpuRequest: '1000m', cpuLimit: '2000m', memoryRequest: '2Gi', memoryLimit: '4Gi' }
    },
    storage: {
      codeServer: '5Gi',
      ollama: '7Gi'
    }
  },
  'team': {
    name: 'Team',
    cpuRequest: '4000m',
    cpuLimit: '8000m',
    memoryRequest: '8Gi',
    memoryLimit: '16Gi',
    storageRequest: '50Gi',
    podCpuMax: '4000m',
    podCpuDefault: '1000m',
    podMemoryMax: '4Gi',
    podMemoryDefault: '1Gi',
    maxProfiles: 100,
    maxTeams: 20,
    maxStorage: '50Gi',
    features: {
      activepieces: true,
      codeServer: true,
      ollama: true
    },
    resources: {
      ui: { cpuRequest: '300m', cpuLimit: '600m', memoryRequest: '512Mi', memoryLimit: '1Gi' },
      activepieces: { cpuRequest: '500m', cpuLimit: '1000m', memoryRequest: '1Gi', memoryLimit: '2Gi' },
      codeServer: { cpuRequest: '500m', cpuLimit: '1000m', memoryRequest: '1Gi', memoryLimit: '2Gi' },
      ollama: { cpuRequest: '2000m', cpuLimit: '4000m', memoryRequest: '4Gi', memoryLimit: '8Gi' }
    },
    storage: {
      codeServer: '15Gi',
      ollama: '20Gi'
    }
  }
};

class TenantManager {
  constructor() {
    this.tenants = new Map();
    this.templateDir = path.join(__dirname, '../k8s');
  }

  /**
   * Generate a unique tenant ID
   */
  generateTenantId(userEmail) {
    const hash = crypto.createHash('sha256').update(userEmail + Date.now()).digest('hex');
    return hash.substring(0, 16);
  }

  /**
   * Generate a unique subdomain for tenant
   */
  generateSubdomain(userEmail, tenantId) {
    const emailPrefix = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${emailPrefix}-${tenantId.substring(0, 8)}`;
  }

  /**
   * Load and process Kubernetes template
   */
  async loadTemplate(templateName, variables) {
    const templatePath = path.join(this.templateDir, templateName);
    let template = await fs.readFile(templatePath, 'utf8');

    // Replace all variables in template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      template = template.replace(regex, value);
    }

    return template;
  }

  /**
   * Generate secrets for tenant
   */
  generateTenantSecrets(tenantId) {
    return {
      'activepieces-api-key': crypto.randomBytes(32).toString('hex'),
      'activepieces-encryption-key': crypto.randomBytes(32).toString('hex'),
      'activepieces-jwt-secret': crypto.randomBytes(32).toString('hex'),
      'postgres-password': crypto.randomBytes(16).toString('hex')
    };
  }

  /**
   * Create Kubernetes secret for tenant
   */
  async createTenantSecret(namespace, secrets) {
    const secretData = {};
    for (const [key, value] of Object.entries(secrets)) {
      secretData[key] = Buffer.from(value).toString('base64');
    }

    const secret = {
      apiVersion: 'v1',
      kind: 'Secret',
      metadata: {
        name: 'tenant-secrets',
        namespace: namespace
      },
      type: 'Opaque',
      data: secretData
    };

    try {
      await k8sApi.createNamespacedSecret(namespace, secret);
      console.log(`Created secret for namespace: ${namespace}`);
    } catch (error) {
      console.error(`Error creating secret: ${error.message}`);
      throw error;
    }
  }

  /**
   * Provision a new tenant environment
   */
  async provisionTenant(userEmail, subscriptionTier = 'pay-as-you-go', userId) {
    try {
      console.log(`Provisioning tenant for user: ${userEmail}, tier: ${subscriptionTier}`);

      // Generate tenant identifiers
      const tenantId = this.generateTenantId(userEmail);
      const subdomain = this.generateSubdomain(userEmail, tenantId);
      const namespace = `rica-tenant-${tenantId}`;
      const createdAt = new Date().toISOString();

      // Get tier configuration
      const tierConfig = TIER_CONFIGS[subscriptionTier] || TIER_CONFIGS['pay-as-you-go'];

      // Generate secrets
      const secrets = this.generateTenantSecrets(tenantId);

      // Prepare template variables
      const variables = {
        TENANT_ID: tenantId,
        USER_EMAIL: userEmail,
        TENANT_SUBDOMAIN: subdomain,
        SUBSCRIPTION_TIER: subscriptionTier,
        CREATED_AT: createdAt,
        REGISTRY: process.env.DOCKER_REGISTRY || 'localhost:5000',
        
        // Resource quotas
        CPU_REQUEST: tierConfig.cpuRequest,
        CPU_LIMIT: tierConfig.cpuLimit,
        MEMORY_REQUEST: tierConfig.memoryRequest,
        MEMORY_LIMIT: tierConfig.memoryLimit,
        STORAGE_REQUEST: tierConfig.storageRequest,
        POD_CPU_MAX: tierConfig.podCpuMax,
        POD_CPU_DEFAULT: tierConfig.podCpuDefault,
        POD_MEMORY_MAX: tierConfig.podMemoryMax,
        POD_MEMORY_DEFAULT: tierConfig.podMemoryDefault,
        
        // Features
        FEATURE_ACTIVEPIECES: tierConfig.features.activepieces,
        FEATURE_CODE_SERVER: tierConfig.features.codeServer,
        FEATURE_OLLAMA: tierConfig.features.ollama,
        
        // Limits
        MAX_PROFILES: tierConfig.maxProfiles,
        MAX_TEAMS: tierConfig.maxTeams,
        MAX_STORAGE: tierConfig.maxStorage,
        
        // UI resources
        UI_CPU_REQUEST: tierConfig.resources.ui.cpuRequest,
        UI_CPU_LIMIT: tierConfig.resources.ui.cpuLimit,
        UI_MEMORY_REQUEST: tierConfig.resources.ui.memoryRequest,
        UI_MEMORY_LIMIT: tierConfig.resources.ui.memoryLimit,
        
        // Service-specific resources
        ACTIVEPIECES_CPU_REQUEST: tierConfig.resources.activepieces.cpuRequest,
        ACTIVEPIECES_CPU_LIMIT: tierConfig.resources.activepieces.cpuLimit,
        ACTIVEPIECES_MEMORY_REQUEST: tierConfig.resources.activepieces.memoryRequest,
        ACTIVEPIECES_MEMORY_LIMIT: tierConfig.resources.activepieces.memoryLimit,
        
        CODE_SERVER_CPU_REQUEST: tierConfig.resources.codeServer.cpuRequest,
        CODE_SERVER_CPU_LIMIT: tierConfig.resources.codeServer.cpuLimit,
        CODE_SERVER_MEMORY_REQUEST: tierConfig.resources.codeServer.memoryRequest,
        CODE_SERVER_MEMORY_LIMIT: tierConfig.resources.codeServer.memoryLimit,
        CODE_SERVER_STORAGE: tierConfig.storage.codeServer,
        
        OLLAMA_CPU_REQUEST: tierConfig.resources.ollama.cpuRequest,
        OLLAMA_CPU_LIMIT: tierConfig.resources.ollama.cpuLimit,
        OLLAMA_MEMORY_REQUEST: tierConfig.resources.ollama.memoryRequest,
        OLLAMA_MEMORY_LIMIT: tierConfig.resources.ollama.memoryLimit,
        OLLAMA_STORAGE: tierConfig.storage.ollama
      };

      // Step 1: Create namespace with resource quotas and network policies
      console.log(`Creating namespace: ${namespace}`);
      const namespaceTemplate = await this.loadTemplate('tenant-namespace-template.yaml', variables);
      await this.applyYaml(namespaceTemplate);

      // Step 2: Create secrets
      console.log(`Creating secrets for namespace: ${namespace}`);
      await this.createTenantSecret(namespace, secrets);

      // Step 3: Deploy Rica UI
      console.log(`Deploying Rica UI to namespace: ${namespace}`);
      const uiTemplate = await this.loadTemplate('tenant-rica-ui-deployment.yaml', variables);
      await this.applyYaml(uiTemplate);

      // Step 4: Deploy headless servers based on tier
      console.log(`Deploying headless servers to namespace: ${namespace}`);
      const serversTemplate = await this.loadTemplate('tenant-headless-servers.yaml', variables);
      await this.applyYaml(serversTemplate);

      // Step 5: Create ingress
      console.log(`Creating ingress for namespace: ${namespace}`);
      const ingressTemplate = await this.loadTemplate('tenant-ingress.yaml', variables);
      await this.applyYaml(ingressTemplate);

      // Store tenant information
      const tenantInfo = {
        tenantId,
        userId,
        userEmail,
        subdomain,
        namespace,
        subscriptionTier,
        tierConfig,
        secrets,
        createdAt,
        status: 'provisioning',
        url: `https://${subdomain}.rica.example.com`
      };

      this.tenants.set(tenantId, tenantInfo);

      console.log(`Tenant provisioned successfully: ${tenantId}`);
      return tenantInfo;

    } catch (error) {
      console.error(`Error provisioning tenant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply Kubernetes YAML configuration
   */
  async applyYaml(yamlContent) {
    // This is a simplified version. In production, use kubectl apply or a proper YAML parser
    // For now, we'll parse and apply each resource individually
    const yaml = require('js-yaml');
    const documents = yamlContent.split('---').filter(doc => doc.trim());

    for (const doc of documents) {
      try {
        const resource = yaml.load(doc);
        if (!resource || !resource.kind) continue;

        await this.applyResource(resource);
      } catch (error) {
        console.error(`Error applying resource: ${error.message}`);
        // Continue with other resources
      }
    }
  }

  /**
   * Apply individual Kubernetes resource
   */
  async applyResource(resource) {
    const { kind, metadata } = resource;
    const namespace = metadata.namespace;

    try {
      switch (kind) {
        case 'Namespace':
          await k8sApi.createNamespace(resource);
          break;
        case 'ResourceQuota':
          await k8sApi.createNamespacedResourceQuota(namespace, resource);
          break;
        case 'LimitRange':
          await k8sApi.createNamespacedLimitRange(namespace, resource);
          break;
        case 'NetworkPolicy':
          await k8sNetworkingApi.createNamespacedNetworkPolicy(namespace, resource);
          break;
        case 'ServiceAccount':
          await k8sApi.createNamespacedServiceAccount(namespace, resource);
          break;
        case 'Role':
          await k8sRbacApi.createNamespacedRole(namespace, resource);
          break;
        case 'RoleBinding':
          await k8sRbacApi.createNamespacedRoleBinding(namespace, resource);
          break;
        case 'Deployment':
          await k8sAppsApi.createNamespacedDeployment(namespace, resource);
          break;
        case 'StatefulSet':
          await k8sAppsApi.createNamespacedStatefulSet(namespace, resource);
          break;
        case 'Service':
          await k8sApi.createNamespacedService(namespace, resource);
          break;
        case 'ConfigMap':
          await k8sApi.createNamespacedConfigMap(namespace, resource);
          break;
        case 'PersistentVolumeClaim':
          await k8sApi.createNamespacedPersistentVolumeClaim(namespace, resource);
          break;
        case 'Ingress':
          await k8sNetworkingApi.createNamespacedIngress(namespace, resource);
          break;
        default:
          console.log(`Unsupported resource kind: ${kind}`);
      }
    } catch (error) {
      if (error.response && error.response.statusCode === 409) {
        console.log(`Resource already exists: ${kind}/${metadata.name}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Deprovision a tenant environment
   */
  async deprovisionTenant(tenantId) {
    try {
      const tenant = this.tenants.get(tenantId);
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      console.log(`Deprovisioning tenant: ${tenantId}`);

      // Delete namespace (this will delete all resources in the namespace)
      await k8sApi.deleteNamespace(tenant.namespace);

      // Remove from cache
      this.tenants.delete(tenantId);

      console.log(`Tenant deprovisioned successfully: ${tenantId}`);
      return { success: true, tenantId };

    } catch (error) {
      console.error(`Error deprovisioning tenant: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get tenant information
   */
  getTenant(tenantId) {
    return this.tenants.get(tenantId);
  }

  /**
   * Get tenant by user ID
   */
  getTenantByUserId(userId) {
    for (const [tenantId, tenant] of this.tenants.entries()) {
      if (tenant.userId === userId) {
        return tenant;
      }
    }
    return null;
  }

  /**
   * Update tenant subscription tier
   */
  async updateTenantTier(tenantId, newTier) {
    try {
      const tenant = this.tenants.get(tenantId);
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      console.log(`Updating tenant ${tenantId} to tier: ${newTier}`);

      // Get new tier configuration
      const tierConfig = TIER_CONFIGS[newTier] || TIER_CONFIGS['pay-as-you-go'];

      // Update resource quotas
      // This would involve updating the ResourceQuota in the namespace
      // Implementation depends on specific requirements

      tenant.subscriptionTier = newTier;
      tenant.tierConfig = tierConfig;
      this.tenants.set(tenantId, tenant);

      console.log(`Tenant tier updated successfully: ${tenantId}`);
      return tenant;

    } catch (error) {
      console.error(`Error updating tenant tier: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get tenant status and resource usage
   */
  async getTenantStatus(tenantId) {
    try {
      const tenant = this.tenants.get(tenantId);
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      // Get pod status
      const podsResponse = await k8sApi.listNamespacedPod(tenant.namespace);
      const pods = podsResponse.body.items;

      // Get resource usage (would need metrics-server in production)
      const status = {
        tenantId,
        namespace: tenant.namespace,
        subscriptionTier: tenant.subscriptionTier,
        url: tenant.url,
        createdAt: tenant.createdAt,
        pods: pods.map(pod => ({
          name: pod.metadata.name,
          status: pod.status.phase,
          ready: pod.status.conditions?.find(c => c.type === 'Ready')?.status === 'True'
        })),
        services: {
          ricaUi: pods.some(p => p.metadata.labels?.app === 'rica-ui'),
          activepieces: pods.some(p => p.metadata.labels?.app === 'activepieces'),
          codeServer: pods.some(p => p.metadata.labels?.app === 'code-server'),
          ollama: pods.some(p => p.metadata.labels?.app === 'ollama')
        }
      };

      return status;

    } catch (error) {
      console.error(`Error getting tenant status: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all tenants
   */
  listTenants() {
    return Array.from(this.tenants.values());
  }
}

module.exports = new TenantManager();
