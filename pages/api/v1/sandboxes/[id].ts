// pages/api/v1/sandboxes/[id].ts - Gestione sandbox specifico
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthUser } from '../../../../lib/middleware/apiAuth';
import { DockerManager } from '../../../../lib/docker/dockerManager';

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  const { id } = req.query;
  const sandboxId = id as string;

  if (req.method === 'GET') {
    // Ottieni info sandbox
    try {
      const sandbox = DockerManager.getSandbox(sandboxId);
      
      if (!sandbox) {
        return res.status(404).json({
          error: 'Sandbox not found',
          code: 'SANDBOX_NOT_FOUND'
        });
      }

      // Verifica ownership
      if (sandbox.config.userId !== user.id) {
        return res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: sandbox.id,
          status: sandbox.status,
          language: sandbox.language,
          createdAt: sandbox.createdAt.toISOString(),
          lastActivity: sandbox.lastActivity.toISOString(),
          config: {
            language: sandbox.language,
            timeout: sandbox.config.timeout,
            memory: sandbox.config.memoryLimit,
            cpu: sandbox.config.cpuLimit,
            persistent: sandbox.config.persistent
          }
        }
      });

    } catch (error) {
      console.error('Sandbox info error:', error);
      res.status(500).json({
        error: 'Failed to get sandbox info',
        code: 'SANDBOX_INFO_FAILED'
      });
    }

  } else if (req.method === 'DELETE') {
    // Elimina sandbox
    try {
      const sandbox = DockerManager.getSandbox(sandboxId);
      
      if (!sandbox) {
        return res.status(404).json({
          error: 'Sandbox not found',
          code: 'SANDBOX_NOT_FOUND'
        });
      }

      // Verifica ownership
      if (sandbox.config.userId !== user.id) {
        return res.status(403).json({
          error: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }

      const destroyed = await DockerManager.destroySandbox(sandboxId);
      
      if (destroyed) {
        res.status(200).json({
          success: true,
          message: 'Sandbox destroyed successfully'
        });
      } else {
        res.status(500).json({
          error: 'Failed to destroy sandbox',
          code: 'SANDBOX_DESTROY_FAILED'
        });
      }

    } catch (error) {
      console.error('Sandbox destroy error:', error);
      res.status(500).json({
        error: 'Failed to destroy sandbox',
        code: 'SANDBOX_DESTROY_FAILED'
      });
    }

  } else {
    res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }
}

export default withAuth(handler);
