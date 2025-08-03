// pages/api/sessions/validate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../lib/utils/apiResponse';
import { SessionService } from '../../../lib/database/services/sessionService';

async function validateSessionHandler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionToken } = req.body;

  if (!sessionToken) {
    return ApiResponseHandler.badRequest(res, 'Session token is required');
  }

  try {
    const session = await SessionService.getSessionByToken(sessionToken);

    if (!session) {
      return ApiResponseHandler.notFound(res, 'Session not found or expired');
    }

    // Aggiorna attività
    await SessionService.updateSessionActivity(session.id);

    return ApiResponseHandler.success(res, {
      valid: true,
      sessionId: session.id,
      isAnonymous: session.isAnonymous,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      executionsCount: session.executionsCount,
      armstrong: {
        message: "🔓 Session validated! Welcome back! 🤖"
      }
    }, 'Session is valid');

  } catch (error) {
    console.error('Validate session error:', error);
    return ApiResponseHandler.error(res, 'Session validation failed', 500);
  }
}

export default apiWrapper(validateSessionHandler, {
  methods: ['POST'],
  rateLimit: true
});