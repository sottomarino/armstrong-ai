// pages/api/sessions/[sessionId]/history.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../../lib/utils/apiResponse';
import { ExecutionService } from '../../../../lib/database/services/executionService';
import { SessionService } from '../../../../lib/database/services/sessionService';

async function sessionHistoryHandler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  const { limit = 20, language, success } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return ApiResponseHandler.badRequest(res, 'Session ID is required');
  }

  try {
    // Verifica che la sessione esista
    const session = await SessionService.getSessionByToken(sessionId);
    if (!session) {
      return ApiResponseHandler.notFound(res, 'Session not found');
    }

    // Ottieni esecuzioni della sessione
    const executions = await ExecutionService.getSessionExecutions(
      session.id,
      parseInt(limit as string) || 20
    );

    // Filtra per linguaggio se specificato
    let filteredExecutions = executions;
    if (language && typeof language === 'string') {
      filteredExecutions = executions.filter(e => e.language === language);
    }

    // Filtra per successo se specificato
    if (success !== undefined) {
      const successFilter = success === 'true';
      filteredExecutions = filteredExecutions.filter(e => e.success === successFilter);
    }

    // Ottieni statistiche sessione
    const stats = await ExecutionService.getExecutionStats(session.id);

    // Aggiorna attività sessione
    await SessionService.updateSessionActivity(session.id);

    return ApiResponseHandler.success(res, {
      sessionInfo: {
        id: session.id,
        created: session.createdAt,
        lastActivity: session.lastActivity,
        totalExecutions: session.executionsCount,
        isAnonymous: session.isAnonymous
      },
      executions: filteredExecutions.map(execution => ({
        id: execution.id,
        language: execution.language,
        success: execution.success,
        executionTime: execution.executionTimeMs,
        method: execution.executionMethod,
        createdAt: execution.createdAt,
        preview: execution.codeSnippet.substring(0, 100) + (execution.codeSnippet.length > 100 ? '...' : ''),
        hasOutput: !!execution.output,
        hasError: !!execution.errorMessage
      })),
      statistics: {
        total: stats.totalExecutions,
        successRate: Math.round(stats.successRate * 100) / 100,
        avgExecutionTime: Math.round(stats.avgExecutionTime),
        languages: stats.languageBreakdown,
        methods: stats.methodBreakdown
      },
      armstrong: {
        message: `📊 Found ${filteredExecutions.length} executions in your session history! 🤖`,
        tip: filteredExecutions.length === 0 
          ? "Start coding to build your execution history!"
          : `Your most used language: ${Object.entries(stats.languageBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'}`
      }
    }, 'Session history retrieved successfully');

  } catch (error) {
    console.error('Session history error:', error);
    return ApiResponseHandler.error(res, 'Failed to retrieve session history', 500);
  }
}

export default apiWrapper(sessionHistoryHandler, {
  methods: ['GET'],
  rateLimit: true
});