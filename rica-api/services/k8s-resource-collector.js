const k8s = require('@kubernetes/client-node');
const axios = require('axios');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
const metricsApi = kc.makeApiClient(k8s.CustomObjectsApi);

const CREDIT_SERVICE_URL = process.env.CREDIT_SERVICE_URL || 'http://credit-metering-service:3100';
const COLLECTION_INTERVAL = 60000; // 1 minute

class ResourceCollector {
  constructor() {
    this.previousMetrics = new Map();
  }

  // Get all Rica tenant namespaces
  async getTenantNamespaces() {
    const response = await k8sApi.listNamespace();
    return response.body.items
      .filter(ns => ns.metadata.labels?.['rica-tenant'] === 'true')
      .map(ns => ({
        name: ns.metadata.name,
        tenantId: ns.metadata.labels['tenant-id']
      }));
  }

  // Collect CPU and memory usage from metrics-server
  async collectPodMetrics(namespace) {
    try {
      const response = await metricsApi.getNamespacedCustomObject(
        'metrics.k8s.io',
        'v1beta1',
        namespace.name,
        'pods',
        ''
      );

      return response.body.items.map(pod => ({
        name: pod.metadata.name,
        containers: pod.containers.map(container => ({
          name: container.name,
          cpu: this.parseCPU(container.usage.cpu),
          memory: this.parseMemory(container.usage.memory)
        }))
      }));
    } catch (error) {
      console.error(`Error collecting metrics for ${namespace.name}:`, error.message);
      return [];
    }
  }

  // Collect storage usage
  async collectStorageMetrics(namespace) {
    try {
      const response = await k8sApi.listNamespacedPersistentVolumeClaim(namespace.name);

      return response.body.items.map(pvc => ({
        name: pvc.metadata.name,
        capacity: this.parseMemory(pvc.status.capacity?.storage || '0Gi')
      }));
    } catch (error) {
      console.error(`Error collecting storage metrics for ${namespace.name}:`, error.message);
      return [];
    }
  }

  // Parse CPU in millicores
  parseCPU(cpuString) {
    if (!cpuString) return 0;

    if (cpuString.endsWith('n')) {
      return parseInt(cpuString) / 1000000; // nanocores to millicores
    } else if (cpuString.endsWith('m')) {
      return parseInt(cpuString);
    } else if (cpuString.endsWith('u')) {
      return parseFloat(cpuString) / 1000; // microcores to millicores
    } else {
      return parseFloat(cpuString) * 1000; // cores to millicores
    }
  }

  // Parse memory in GiB
  parseMemory(memString) {
    if (!memString) return 0;

    const units = {
      'Ki': 1 / (1024 * 1024),
      'Mi': 1 / 1024,
      'Gi': 1,
      'Ti': 1024,
      'K': 1 / (1000 * 1000 * 1000),
      'M': 1 / (1000 * 1000),
      'G': 1 / 1000,
      'T': 1
    };

    for (const [unit, multiplier] of Object.entries(units)) {
      if (memString.endsWith(unit)) {
        return parseFloat(memString) * multiplier;
      } else if (memString.endsWith(unit + 'i')) {
        return parseFloat(memString) * multiplier;
      }
    }

    // Assume bytes if no unit
    return parseFloat(memString) / (1024 * 1024 * 1024);
  }

  // Calculate usage delta and send to credit service
  async reportUsage(tenantId, currentMetrics) {
    const previousKey = `${tenantId}`;
    const previous = this.previousMetrics.get(previousKey) || {
      timestamp: Date.now(),
      cpu: 0,
      memory: 0,
      storage: 0
    };

    const now = Date.now();
    const hoursPassed = (now - previous.timestamp) / (1000 * 60 * 60);

    // Calculate average usage over the interval
    const avgCPU = (currentMetrics.cpu + previous.cpu) / 2;
    const avgMemory = (currentMetrics.memory + previous.memory) / 2;
    const avgStorage = (currentMetrics.storage + previous.storage) / 2;

    const usageRecords = [
      {
        tenantId,
        resourceType: 'cpu',
        amount: avgCPU * hoursPassed,
        metadata: {
          interval: 'hourly',
          pods: currentMetrics.podCount,
          cpu_cores: (avgCPU / 1000).toFixed(3) // Convert millicores to cores
        }
      },
      {
        tenantId,
        resourceType: 'memory',
        amount: avgMemory * hoursPassed,
        metadata: {
          interval: 'hourly',
          memory_gb: avgMemory.toFixed(3)
        }
      },
      {
        tenantId,
        resourceType: 'storage',
        amount: avgStorage * hoursPassed,
        metadata: {
          interval: 'hourly',
          storage_gb: avgStorage.toFixed(3)
        }
      }
    ];

    try {
      await axios.post(`${CREDIT_SERVICE_URL}/batch-usage`, {
        usageRecords
      }, {
        headers: { 'X-Tenant-Id': tenantId }
      });

      console.log(`✅ Reported usage for tenant ${tenantId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to report usage for ${tenantId}:`, error.message);
      return false;
    } finally {
      // Store current metrics for next iteration
      this.previousMetrics.set(previousKey, {
        timestamp: now,
        cpu: currentMetrics.cpu,
        memory: currentMetrics.memory,
        storage: currentMetrics.storage
      });
    }
  }

  // Main collection loop
  async collect() {
    console.log('🔍 Starting resource collection...');

    try {
      const namespaces = await this.getTenantNamespaces();
      if (namespaces.length === 0) {
        console.log('No tenant namespaces found');
        return;
      }

      console.log(`Found ${namespaces.length} tenant namespaces`);

      for (const ns of namespaces) {
        try {
          console.log(`Collecting metrics for ${ns.name} (${ns.tenantId})`);

          const [podMetrics, storageMetrics] = await Promise.all([
            this.collectPodMetrics(ns),
            this.collectStorageMetrics(ns)
          ]);

          // Aggregate metrics
          let totalCPU = 0;
          let totalMemory = 0;
          let podCount = 0;

          for (const pod of podMetrics) {
            for (const container of pod.containers) {
              totalCPU += container.cpu;
              totalMemory += container.memory;
            }
            podCount++;
          }

          const totalStorage = storageMetrics.reduce((sum, pvc) => sum + pvc.capacity, 0);

          console.log(`📊 Metrics for ${ns.tenantId}:`, {
            cpu: `${(totalCPU / 1000).toFixed(2)} cores`,
            memory: `${totalMemory.toFixed(2)} GiB`,
            storage: `${totalStorage.toFixed(2)} GiB`,
            pods: podCount
          });

          await this.reportUsage(ns.tenantId, {
            cpu: totalCPU,
            memory: totalMemory,
            storage: totalStorage,
            podCount
          });
        } catch (error) {
          console.error(`Error processing namespace ${ns.name}:`, error.message);
        }
      }

      console.log('✅ Collection cycle completed');
    } catch (error) {
      console.error('❌ Collection error:', error);
    }
  }

  // Start periodic collection
  start() {
    console.log(`Starting resource collector (interval: ${COLLECTION_INTERVAL}ms)`);
    this.collect(); // Run immediately
    this.interval = setInterval(() => this.collect(), COLLECTION_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      console.log('Resource collector stopped');
    }
  }
}

// Service-specific usage tracking (to be called by each service)
class ServiceUsageTracker {
  constructor(serviceName, tenantId) {
    this.serviceName = serviceName;
    this.tenantId = tenantId;
    this.baseMetadata = {
      service: serviceName,
      timestamp: new Date().toISOString()
    };
  }

  async trackUsage(resourceType, amount, additionalMetadata = {}) {
    try {
      const response = await axios.post(
        `${CREDIT_SERVICE_URL}/usage`,
        {
          resourceType,
          amount,
          metadata: {
            ...this.baseMetadata,
            ...additionalMetadata
          }
        },
        {
          headers: {
            'X-Tenant-Id': this.tenantId,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error tracking usage:', error.message);
      throw error;
    }
  }

  async trackActivePiecesExecution(executionTime, success) {
    return this.trackUsage('activepieces_call', 1, {
      executionTime,
      success,
      unit: 'execution'
    });
  }

  async trackOllamaTokens(inputTokens, outputTokens, model) {
    const totalTokens = inputTokens + outputTokens;
    return this.trackUsage('ollama_token', totalTokens, {
      inputTokens,
      outputTokens,
      model,
      unit: 'token'
    });
  }

  async trackVircadiaSession(minutes) {
    return this.trackUsage('vircadia_minute', minutes, {
      unit: 'minute'
    });
  }

  async trackCodeServerSession(minutes) {
    return this.trackUsage('codeserver_minute', minutes, {
      unit: 'minute'
    });
  }
}

// Main execution
if (require.main === module) {
  const collector = new ResourceCollector();

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    collector.stop();
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log('Shutting down...');
    collector.stop();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  // Start the collector
  collector.start();
}

module.exports = {
  ResourceCollector,
  ServiceUsageTracker,
  // Export a singleton instance for convenience
  resourceCollector: new ResourceCollector(),
  createServiceTracker: (serviceName, tenantId) => new ServiceUsageTracker(serviceName, tenantId)
};
