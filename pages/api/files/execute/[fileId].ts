// pages/api/files/execute/[fileId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../../lib/utils/apiResponse';
import { CodeFileService } from '../../../../lib/database/services/codeFileService';
import { ExecutionService } from '../../../../lib/database/services/executionService';
import { SessionService } from '../../../../lib/database/services/sessionService';

async function executeFileHandler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query;
  const { sessionToken } = req.body;

  if (!fileId || typeof fileId !== 'string') {
    return ApiResponseHandler.badRequest(res, 'File ID is required');
  }

  try {
    // Verifica sessione
    const sessionTokenToUse = sessionToken || 
      req.headers['x-armstrong-session'] as string ||
      req.headers.cookie?.split(';').find(c => c.trim().startsWith('armstrong_session='))?.split('=')[1];

    if (!sessionTokenToUse) {
      return ApiResponseHandler.badRequest(res, 'Session token is required');
    }

    const session = await SessionService.getSessionByToken(sessionTokenToUse);
    if (!session) {
      return ApiResponseHandler.notFound(res, 'Session not found');
    }

    // Ottieni file (placeholder - in una versione completa verificheremmo i permessi)
    return ApiResponseHandler.success(res, {
      fileId,
      message: "File execution endpoint ready",
      armstrong: {
        message: "🚀 File execution coming soon! 🤖",
        tip: "This will execute saved files directly from your library!",
        planned: [
          "Direct file execution",
          "Execution history tracking",
          "Performance analytics per file",
          "Share execution results"
        ]
      }
    }, 'File execution endpoint available');

  } catch (error) {
    console.error('Execute file error:', error);
    return ApiResponseHandler.error(res, 'Failed to execute file', 500);
  }
}

export default apiWrapper(executeFileHandler, {
  methods: ['POST'],
  rateLimit: true
});