// pages/api/v1/health.ts - Health check API v1
import { NextApiRequest, NextApiResponse } from 'next';
import { DockerManager } from '../../../lib/docker/dockerManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const startTime = Date.now();
    
    // Controlla stato componenti
    const dockerAvailable = await DockerManager.checkDockerAvailability();
    const sandboxStats = DockerManager.getSandboxStats();
    
    const health = {
      status: 'healthy',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime,
      services: {
        docker: dockerAvailable ? 'up' : 'down',
        sandboxManager: 'up',
        api: 'up'
      },
      stats: {
        activeSandboxes: sandboxStats.total,
        runningSandboxes: sandboxStats.running
      }
    };

    const statusCode = dockerAvailable ? 200 : 503;

    res.status(statusCode).json({
      success: true,
      data: health
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
}
