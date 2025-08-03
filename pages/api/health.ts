// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../lib/utils/apiResponse';
import { DockerManager } from '../../lib/docker/dockerManager';
import { SecurityPolicyManager } from '../../lib/docker/securityPolicy';
import { DockerImageBuilder } from '../../lib/docker/buildImages';

async function healthHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check Docker availability
    const dockerAvailable = await DockerManager.checkDockerAvailability();
    const customImagesAvailable = dockerAvailable ? await DockerImageBuilder.checkCustomImages() : false;
    
    // Get current security policy
    const environment = process.env.NODE_ENV || 'production';
    const securityPolicy = SecurityPolicyManager.getPolicy(environment);

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      services: {
        api: 'healthy',
        database: 'pending', // Implementeremo dopo
        docker: dockerAvailable ? 'healthy' : 'unavailable',
        customImages: customImagesAvailable ? 'available' : 'not-built'
      },
      security: {
        policy: securityPolicy.name,
        description: securityPolicy.description,
        resourceLimits: securityPolicy.resourceLimits,
        timeouts: securityPolicy.timeouts,
        environment: environment
      },
      armstrong: {
        name: 'Armstrong AI API',
        motto: 'Ready to stretch and execute! 🤖',
        version: '1.0.0',
        capabilities: [
          'JavaScript execution (local)',
          dockerAvailable ? 'Python execution (Docker)' : 'Python execution (simulation)',
          'JSON validation',
          'HTML preview',
          'CSS preview',
          'Multi-language support',
          'Security policies',
          'Rate limiting',
          'Resource monitoring'
        ],
        supportedLanguages: [
          {
            name: 'JavaScript',
            icon: '🟨',
            execution: 'local',
            status: 'ready'
          },
          {
            name: 'Python',
            icon: '🐍',
            execution: dockerAvailable ? 'docker' : 'simulation',
            status: dockerAvailable ? 'ready' : 'simulation-mode'
          },
          {
            name: 'HTML',
            icon: '🌐',
            execution: 'preview',
            status: 'ready'
          },
          {
            name: 'CSS',
            icon: '🎨',
            execution: 'preview',
            status: 'ready'
          },
          {
            name: 'JSON',
            icon: '📄',
            execution: 'validation',
            status: 'ready'
          }
        ]
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        uptime: {
          seconds: Math.floor(process.uptime()),
          readable: formatUptime(process.uptime())
        }
      },
      docker: dockerAvailable ? {
        available: true,
        customImages: customImagesAvailable,
        securityFeatures: [
          'Network isolation (--network=none)',
          'Read-only filesystem',
          'Memory limits',
          'CPU limits',
          'Process limits',
          'No system privileges',
          'User namespace isolation'
        ]
      } : {
        available: false,
        reason: 'Docker not installed or not accessible',
        installInstructions: [
          'sudo apt install docker.io',
          'sudo usermod -aG docker $USER',
          'newgrp docker',
          'docker run hello-world'
        ]
      }
    };

    return ApiResponseHandler.success(res, healthData, 'Armstrong AI is healthy and secured');

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorData = {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        api: 'healthy',
        database: 'pending',
        docker: 'error',
        customImages: 'unknown'
      },
      armstrong: {
        name: 'Armstrong AI API',
        motto: 'Experiencing some turbulence, but still ready! 🤖',
      }
    };

    return ApiResponseHandler.success(res, errorData, 'Armstrong API is experiencing issues');
  }
}

// Helper function per formattare uptime
function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
}

export default apiWrapper(healthHandler, {
  methods: ['GET'],
  rateLimit: false
});