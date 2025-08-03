// pages/api/sessions/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../lib/utils/apiResponse';
import { SessionService } from '../../../lib/database/services/sessionService';

interface CreateSessionRequest {
  userAgent?: string;
  fingerprint?: string;
}

async function createSessionHandler(req: NextApiRequest, res: NextApiResponse) {
  const { userAgent, fingerprint }: CreateSessionRequest = req.body;

  try {
    // Ottieni IP client
    const ipAddress = getClientIP(req);
    const clientUserAgent = userAgent || req.headers['user-agent'];

    // Crea sessione anonima
    const session = await SessionService.createAnonymousSession(
      ipAddress,
      clientUserAgent
    );

    if (!session) {
      return ApiResponseHandler.error(res, 'Failed to create session', 500);
    }

    // Imposta cookie di sessione (opzionale, per persistenza browser)
    res.setHeader('Set-Cookie', [
      `armstrong_session=${session.sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800` // 7 giorni
    ]);

    return ApiResponseHandler.success(res, {
      sessionId: session.id,
      sessionToken: session.sessionToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 giorni
      isAnonymous: session.isAnonymous,
      createdAt: session.createdAt,
      armstrong: {
        motto: "Session created! Ready to stretch! 🤖",
        capabilities: [
          "Code execution tracking",
          "File saving",
          "Execution history",
          "Performance analytics"
        ]
      }
    }, 'Session created successfully');

  } catch (error) {
    console.error('Create session error:', error);
    return ApiResponseHandler.error(res, 'Session creation failed', 500);
  }
}

function getClientIP(req: NextApiRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

export default apiWrapper(createSessionHandler, {
  methods: ['POST'],
  rateLimit: true
});