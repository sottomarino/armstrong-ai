// pages/api/v1/usage.ts - Statistiche utilizzo utente
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthUser } from '../../../lib/middleware/apiAuth';
import { DockerManager } from '../../../lib/docker/dockerManager';

async function handler(req: NextApiRequest, res: NextApiResponse, user: AuthUser) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  try {
    // Statistiche sandbox utente
    const userSandboxes = DockerManager.listUserSandboxes(user.id);
    const sandboxStats = DockerManager.getSandboxStats();

    // Calcola statistiche utente
    const userStats = {
      sandboxes: {
        active: userSandboxes.length,
        limit: user.quotas.maxSandboxes,
        usage: Math.round((userSandboxes.length / user.quotas.maxSandboxes) * 100)
      },
      executions: {
        // In un'implementazione reale, dovresti tracciare questo nel database
        monthly: 0, // Placeholder
        limit: user.quotas.maxExecutions,
        usage: 0 // Placeholder
      },
      plan: user.plan,
      userId: user.id
    };

    // Statistiche generali sistema (se utente enterprise)
    const systemStats = user.plan === 'enterprise' ? {
      totalSandboxes: sandboxStats.total,
      runningSandboxes: sandboxStats.running,
      languageDistribution: sandboxStats.byLanguage
    } : undefined;

    res.status(200).json({
      success: true,
      data: {
        user: userStats,
        system: systemStats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      error: 'Failed to get usage statistics',
      code: 'USAGE_STATS_FAILED'
    });
  }
}

export default withAuth(handler);
