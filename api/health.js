import { healthRateLimit, healthMetricsMiddleware, advancedHealthCheck } from '../lib/health-middleware';
import { checkDatabase, checkScanner, checkStorage, checkOCR, checkExternalServices } from '../lib/health-checks';

// Apply middleware
export const config = {
  api: {
    responseLimit: false,
  },
};

// Main health check endpoint
export default async function handler(req, res) {
  // Apply rate limiting
  await new Promise((resolve, reject) => {
    healthRateLimit(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });
  
  // Apply metrics middleware (best-effort)
  healthMetricsMiddleware(req, res, () => {});
  
  // Route to appropriate handler
  switch (req.method) {
    case 'GET':
      return handleGetHealth(req, res);
    case 'POST':
      return advancedHealthCheck(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        status: 'error',
        message: `Method ${req.method} not allowed`
      });
  }
}

async function handleGetHealth(req, res) {
  // Note: req.query values are strings when coming from URL
  const {
    detailed = 'false',
    services = 'all',
    timeout = '10000'
  } = req.query;

  const overallTimeout = parseInt(timeout, 10) || 10000;
  const perServiceTimeout = Math.min(overallTimeout, 10000);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), overallTimeout);
    
    // Determine which services to check, keep names in parallel with promises
    const requested = services.split(',').map(s => s.trim().toLowerCase());
    const names = [];
    const promises = [];

    function addCheck(name, promise) {
      names.push(name);
      promises.push(promise);
    }

    if (requested.includes('all') || requested.includes('database')) {
      addCheck('database', checkDatabase());
    }
    if (requested.includes('all') || requested.includes('scanner')) {
      addCheck('scanner', checkScanner());
    }
    if (requested.includes('all') || requested.includes('storage')) {
      addCheck('storage', checkStorage());
    }
    if (requested.includes('all') || requested.includes('ocr')) {
      addCheck('ocr', checkOCR());
    }
    if (requested.includes('all') || requested.includes('external')) {
      addCheck('external', checkExternalServices());
    }

    // Run checks in parallel with per-service timeout
    const results = await Promise.allSettled(
      promises.map(p =>
        Promise.race([
          p,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Service check timeout')), perServiceTimeout)
          )
        ])
      )
    );

    clearTimeout(timeoutId);

    // Process results into a consistent servicesStatus object
    const servicesStatus = {};
    results.forEach((result, index) => {
      const name = names[index] || `service_${index}`;
      if (result.status === 'fulfilled') {
        const value = result.value;
        if (value && typeof value === 'object' && value.status) {
          servicesStatus[name] = value;
        } else if (value === true) {
          servicesStatus[name] = { status: 'healthy' };
        } else {
          servicesStatus[name] = { status: 'unknown', info: value };
        }
      } else {
        servicesStatus[name] = {
          status: 'unhealthy',
          error: result.reason?.message || String(result.reason),
          timestamp: new Date().toISOString()
        };
      }
    });

    // Calculate overall status
    const criticalServices = ['database', 'scanner'];
    const allHealthy = Object.values(servicesStatus).every(s => s.status === 'healthy');
    const criticalHealthy = criticalServices.every(name => {
      // If a critical service wasn't requested, ignore it for critical check
      if (!Object.prototype.hasOwnProperty.call(servicesStatus, name)) return true;
      return servicesStatus[name]?.status === 'healthy';
    });
    const anyDegraded = Object.values(servicesStatus).some(s => s.status === 'degraded');

    let overallStatus = 'healthy';
    let statusCode = 200;

    if (!criticalHealthy) {
      overallStatus = 'unhealthy';
      statusCode = 503;
    } else if (!allHealthy || anyDegraded) {
      overallStatus = 'degraded';
      statusCode = 200;
    }

    // Build response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: servicesStatus,
      metrics: await collectMetrics(),
      request_id: req.headers['x-request-id'] || generateRequestId()
    };
    
    // Add system info if detailed
    if (detailed === 'true') {
      response.system = {
        node: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        argv: process.argv.slice(0, 2)
      };
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Health-Check-Timestamp', new Date().toISOString());
    
    res.status(statusCode).json(response);
    
  } catch (error) {
    if (error && error.name === 'AbortError') {
      res.status(504).json({
        status: 'timeout',
        message: 'Health check timed out',
        timeout: `${timeout}ms`,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Health check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : (error?.message || String(error)),
        timestamp: new Date().toISOString()
      });
    }
  }
}

async function collectMetrics() {
  const os = await import('os');
  
  return {
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used_percent: Math.round((1 - os.freemem() / os.totalmem()) * 100)
    },
    cpu: {
      load_average: os.loadavg(),
      cores: os.cpus().length
    },
    uptime: os.uptime(),
    network: {
      interfaces: Object.keys(os.networkInterfaces()).length
    },
    application: {
      heap_used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heap_total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };
}

function generateRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
}    if (serviceList.includes('all') || serviceList.includes('ocr')) {
      serviceChecks.push(checkOCR());
    }
    if (serviceList.includes('all') || serviceList.includes('external')) {
      serviceChecks.push(checkExternalServices());
    }
    
    // Run checks in parallel with timeout
    const results = await Promise.allSettled(
      serviceChecks.map(p => 
        Promise.race([
          p,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Service check timeout')), 5000)
          )
        ])
      )
    );
    
    clearTimeout(timeoutId);
    
    // Process results
    const servicesStatus = {};
    const serviceNames = ['database', 'scanner', 'storage', 'ocr', 'external'];
    
    results.forEach((result, index) => {
      const serviceName = serviceNames[index];
      if (serviceName) {
        servicesStatus[serviceName] = result.status === 'fulfilled' 
          ? result.value 
          : { 
              status: 'unhealthy', 
              error: result.reason?.message || 'Unknown error',
              timestamp: new Date().toISOString()
            };
      }
    });
    
    // Calculate overall status
    const criticalServices = ['database', 'scanner'];
    const allHealthy = Object.values(servicesStatus).every(s => s.status === 'healthy');
    const criticalHealthy = criticalServices.every(name => 
      servicesStatus[name]?.status === 'healthy'
    );
    const anyDegraded = Object.values(servicesStatus).some(s => s.status === 'degraded');
    
    let overallStatus = 'healthy';
    let statusCode = 200;
    
    if (!criticalHealthy) {
      overallStatus = 'unhealthy';
      statusCode = 503;
    } else if (!allHealthy || anyDegraded) {
      overallStatus = 'degraded';
      statusCode = 200;
    }
    
    // Build response
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: servicesStatus,
      metrics: await collectMetrics(),
      request_id: req.headers['x-request-id'] || generateRequestId()
    };
    
    // Add system info if detailed
    if (detailed === 'true') {
      response.system = {
        node: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        argv: process.argv.slice(0, 2)
      };
    }
    
    // Set cache headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Health-Check-Timestamp', new Date().toISOString());
    
    res.status(statusCode).json(response);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      res.status(504).json({
        status: 'timeout',
        message: 'Health check timed out',
        timeout: `${timeout}ms`,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Health check failed:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

async function collectMetrics() {
  const os = await import('os');
  
  return {
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used_percent: Math.round((1 - os.freemem() / os.totalmem()) * 100)
    },
    cpu: {
      load_average: os.loadavg(),
      cores: os.cpus().length
    },
    uptime: os.uptime(),
    network: {
      interfaces: Object.keys(os.networkInterfaces()).length
    },
    application: {
      heap_used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heap_total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };
}

function generateRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
