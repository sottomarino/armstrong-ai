import { SimpleExecutor } from "../../../lib/execution/simpleExecutor";
// pages/api/v1/execute.ts - Esecuzione codice E2B-compatible
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthUser } from '../../../lib/middleware/apiAuth';
import { DockerManager } from '../../../lib/docker/dockerManager';

interface ExecuteRequest {
  code: string;
  language?: string;
  sandboxId?: string;
  timeout?: number;
  stdin?: string;
}

interface ExecuteResponse {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  sandboxId?: string;
  language: string;
  timestamp: string;
}

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    const body: ExecuteRequest = req.body;

    // Validazione input
    if (!body.code) {
      return res.status(400).json({
        error: 'Code is required',
        code: 'INVALID_INPUT'
      });
    }

    let targetSandboxId = body.sandboxId;
    let language = body.language || 'python';

    // Se non c'è sandboxId, crea sandbox temporaneo
    if (!targetSandboxId) {
      if (!body.language) {
        return res.status(400).json({
          error: 'Language is required when not using existing sandbox',
          code: 'INVALID_INPUT'
        });
      }

      // Crea sandbox temporaneo
      const tempSandbox = await DockerManager.createPersistentSandbox({
        language: body.language as any,
        userId: user.id,
        timeout: body.timeout || 30000,
        persistent: false
      });

      targetSandboxId = tempSandbox.id;
      language = tempSandbox.language;

      // Schedule cleanup dopo 5 minuti
      setTimeout(async () => {
        try {
          await DockerManager.destroySandbox(tempSandbox.id);
          console.log(`🧹 Auto-cleaned temporary sandbox: ${tempSandbox.id}`);
        } catch (error) {
          console.warn(`Failed to auto-cleanup sandbox ${tempSandbox.id}:`, error);
        }
      }, 5 * 60 * 1000);
    } else {
      // Verifica ownership del sandbox esistente
      const sandbox = DockerManager.getSandbox(targetSandboxId);
      if (!sandbox) {
        return res.status(404).json({
          error: 'Sandbox not found',
          code: 'SANDBOX_NOT_FOUND'
        });
      }

      if (sandbox.config.userId !== user.id) {
        return res.status(403).json({
          error: 'Access denied to sandbox',
          code: 'ACCESS_DENIED'
        });
      }

      language = sandbox.language;
    }

    // Esegui codice nel sandbox
    const result = await DockerManager.executeInSandbox(
      targetSandboxId,
      body.code,
      {
        timeout: body.timeout || 30000
      }
    );

    const response: ExecuteResponse = {
      success: result.success,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      sandboxId: targetSandboxId,
      language,
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Execution failed',
      code: 'EXECUTION_FAILED'
    });
  }
}

export default withAuth(handler);
