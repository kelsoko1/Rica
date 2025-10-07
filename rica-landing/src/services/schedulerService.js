/**
 * Scheduler Service
 * 
 * This service handles scheduled tasks such as processing recurring payments.
 * In a production environment, these tasks would be handled by a server-side scheduler.
 * 
 * @module schedulerService
 * @version 1.0.0
 * @author Rica Development Team
 */

import recurringPaymentService from './recurringPaymentService';
import analyticsService from './analyticsService';
import config from '../config/environment';

// Task registry
const tasks = new Map();

// Task status
const taskStatus = new Map();

/**
 * Register a task
 * 
 * @param {string} taskId - Task ID
 * @param {Function} taskFn - Task function
 * @param {Object} options - Task options
 * @returns {boolean} Success status
 */
const registerTask = (taskId, taskFn, options = {}) => {
  try {
    if (tasks.has(taskId)) {
      console.warn(`Task ${taskId} is already registered`);
      return false;
    }
    
    tasks.set(taskId, { taskFn, options });
    taskStatus.set(taskId, {
      lastRun: null,
      nextRun: null,
      lastResult: null,
      error: null,
      running: false
    });
    
    return true;
  } catch (error) {
    console.error('Error registering task:', error);
    return false;
  }
};

/**
 * Unregister a task
 * 
 * @param {string} taskId - Task ID
 * @returns {boolean} Success status
 */
const unregisterTask = (taskId) => {
  try {
    if (!tasks.has(taskId)) {
      console.warn(`Task ${taskId} is not registered`);
      return false;
    }
    
    tasks.delete(taskId);
    taskStatus.delete(taskId);
    
    return true;
  } catch (error) {
    console.error('Error unregistering task:', error);
    return false;
  }
};

/**
 * Run a task
 * 
 * @param {string} taskId - Task ID
 * @returns {Promise<any>} Task result
 */
const runTask = async (taskId) => {
  try {
    if (!tasks.has(taskId)) {
      throw new Error(`Task ${taskId} is not registered`);
    }
    
    const { taskFn, options } = tasks.get(taskId);
    const status = taskStatus.get(taskId);
    
    // Check if task is already running
    if (status.running) {
      console.warn(`Task ${taskId} is already running`);
      return null;
    }
    
    // Update status
    status.running = true;
    taskStatus.set(taskId, status);
    
    // Log task start
    if (config.isProd) {
      console.info(`[${new Date().toISOString()}] Running task: ${taskId}`);
    }
    
    // Track task start
    analyticsService.trackEvent('scheduler_task_started', {
      taskId,
      timestamp: new Date().toISOString()
    });
    
    // Run task
    const startTime = Date.now();
    let result;
    
    try {
      result = await taskFn();
      
      // Update status
      status.lastRun = new Date().toISOString();
      status.lastResult = result;
      status.error = null;
      
      // Calculate next run time if interval is provided
      if (options.interval) {
        status.nextRun = new Date(Date.now() + options.interval).toISOString();
      }
      
      // Track task success
      analyticsService.trackEvent('scheduler_task_completed', {
        taskId,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Update status
      status.error = error.message;
      
      // Track task error
      analyticsService.trackEvent('scheduler_task_error', {
        taskId,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
      
      throw error;
    } finally {
      // Update status
      status.running = false;
      taskStatus.set(taskId, status);
    }
    
    return result;
  } catch (error) {
    console.error(`Error running task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get task status
 * 
 * @param {string} taskId - Task ID
 * @returns {Object} Task status
 */
const getTaskStatus = (taskId) => {
  if (!taskStatus.has(taskId)) {
    return null;
  }
  
  return taskStatus.get(taskId);
};

/**
 * Initialize scheduler
 * 
 * @returns {boolean} Success status
 */
const initializeScheduler = () => {
  try {
    // Register recurring payment processing task
    registerTask('process-recurring-payments', async () => {
      return await recurringPaymentService.processAllDuePayments();
    }, {
      interval: config.isProd ? 3600000 : 60000, // 1 hour in production, 1 minute in development
      description: 'Process due recurring payments'
    });
    
    // Start scheduler if in production
    if (config.isProd) {
      startScheduler();
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing scheduler:', error);
    return false;
  }
};

// Scheduler interval ID
let schedulerIntervalId = null;

/**
 * Start scheduler
 * 
 * @returns {boolean} Success status
 */
const startScheduler = () => {
  try {
    if (schedulerIntervalId) {
      console.warn('Scheduler is already running');
      return false;
    }
    
    // Run scheduler every minute
    schedulerIntervalId = setInterval(async () => {
      // Check for tasks to run
      for (const [taskId, { options }] of tasks.entries()) {
        const status = taskStatus.get(taskId);
        
        // Skip if task is running
        if (status.running) {
          continue;
        }
        
        // Check if task should run
        const shouldRun = !status.nextRun || new Date(status.nextRun) <= new Date();
        
        if (shouldRun) {
          try {
            await runTask(taskId);
          } catch (error) {
            console.error(`Error running scheduled task ${taskId}:`, error);
          }
        }
      }
    }, 60000); // Check every minute
    
    console.info('Scheduler started');
    return true;
  } catch (error) {
    console.error('Error starting scheduler:', error);
    return false;
  }
};

/**
 * Stop scheduler
 * 
 * @returns {boolean} Success status
 */
const stopScheduler = () => {
  try {
    if (!schedulerIntervalId) {
      console.warn('Scheduler is not running');
      return false;
    }
    
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
    
    console.info('Scheduler stopped');
    return true;
  } catch (error) {
    console.error('Error stopping scheduler:', error);
    return false;
  }
};

// Export service
export default {
  registerTask,
  unregisterTask,
  runTask,
  getTaskStatus,
  initializeScheduler,
  startScheduler,
  stopScheduler
};
