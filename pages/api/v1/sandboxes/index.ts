// pages/api/v1/sandboxes/index.ts - Gestione Sandbox E2B-compatible
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthUser } from '../../../../lib/middleware/apiAuth';
import { DockerManager } from '../../../../lib/docker/dockerManager';

interface CreateSandboxRequest {
  language: 'python' | 'javascript' | 'node' | 'typescript' | 'bash';
  template?: string;
  timeout?: number;
  memory?: string;
  cpu?: string;
  persistent?: boolean;
  environment?: Record<string, string>;
}

interface SandboxResponse {
  id: string;
  status: string;
  language: string;
  createdAt: string;
  config: {
    language: string;
    timeout?: number;
    memory?: string;
    cpu?: string;
    persistent?: boolean;
  };
}

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  if (req.method === 'POST') {
    // Crea nuovo sandbox
    try {
      const body: CreateSandboxRequest = req.body;

      // Validazione input
      if (!body.language) {
        return res.status(400).json({
          error: 'Language is required',
          code: 'INVALID_INPUT'
        });
      }

      // Controlla quota utente
      const userSandboxes = DockerManager.listUserSandboxes(user.id);
      if (userSandboxes.length >= user.quotas.maxSandboxes) {
        return res.status(429).json({
          error: `Sandbox limit reached (${user.quotas.maxSandboxes})`,
          code: 'QUOTA_EXCEEDED'
        });
      }

      // Crea sandbox usando il tuo DockerManager enhanced
      const sandbox = await DockerManager.createPersistentSandbox({
        language: body.language,
        template: body.template,
        timeout: body.timeout || 30000,
        memoryLimit: body.memory || '512MB',
        cpuLimit: body.cpu || '0.5',
        userId: user.id,
        persistent: body.persistent || false,
        environment: body.environment || {}
      });

      const response: SandboxResponse = {
        id: sandbox.id,
        status: sandbox.status,
        language: sandbox.language,
        createdAt: sandbox.createdAt.toISOString(),
        config: {
          language: sandbox.language,
          timeout: sandbox.config.timeout,
          memory: sandbox.config.memoryLimit,
          cpu: sandbox.config.cpuLimit,
          persistent: sandbox.config.persistent
        }
      };

      res.status(201).json({
        success: true,
        data: response
      });

    } catch (error) {
      console.error('Sandbox creation error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to create sandbox',
        code: 'SANDBOX_CREATION_FAILED'
      });
    }

  } else if (req.method === 'GET') {
    // Lista sandbox utente
    try {
      const userSandboxes = DockerManager.listUserSandboxes(user.id);
      
      const sandboxes: SandboxResponse[] = userSandboxes.map(sandbox => ({
        id: sandbox.id,
        status: sandbox.status,
        language: sandbox.language,
        createdAt: sandbox.createdAt.toISOString(),
        config: {
          language: sandbox.language,
          timeout: sandbox.config.timeout,
          memory: sandbox.config.memoryLimit,
          cpu: sandbox.config.cpuLimit,
          persistent: sandbox.config.persistent
        }
      }));

      res.status(200).json({
        success: true,
        data: sandboxes,
        meta: {
          total: sandboxes.length,
          limit: user.quotas.maxSandboxes
        }
      });

    } catch (error) {
      console.error('Sandbox listing error:', error);
      res.status(500).json({
        error: 'Failed to list sandboxes',
        code: 'SANDBOX_LIST_FAILED'
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
