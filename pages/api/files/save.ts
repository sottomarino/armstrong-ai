// pages/api/files/save.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../lib/utils/apiResponse';
import { CodeFileService } from '../../../lib/database/services/codeFileService';
import { SessionService } from '../../../lib/database/services/sessionService';

interface SaveFileRequest {
  filename: string;
  language: string;
  content: string;
  description?: string;
  isPublic?: boolean;
  sessionToken?: string;
}

async function saveFileHandler(req: NextApiRequest, res: NextApiResponse) {
  const { 
    filename, 
    language, 
    content, 
    description, 
    isPublic = false,
    sessionToken 
  }: SaveFileRequest = req.body;

  if (!filename || !language || !content) {
    return ApiResponseHandler.badRequest(res, 'Filename, language, and content are required');
  }

  if (!['javascript', 'python', 'html', 'css', 'json'].includes(language)) {
    return ApiResponseHandler.badRequest(res, 'Invalid language');
  }

  try {
    // Ottieni sessione
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

    // Valida filename
    const cleanFilename = filename.trim();
    if (cleanFilename.length < 1 || cleanFilename.length > 100) {
      return ApiResponseHandler.badRequest(res, 'Filename must be between 1 and 100 characters');
    }

    // Valida content size (max 50KB)
    if (content.length > 50000) {
      return ApiResponseHandler.badRequest(res, 'Content too large (max 50KB)');
    }

    // Prepara description (converte null in undefined)
    const cleanDescription = description?.trim() || undefined;

    // Salva file
    const fileId = await CodeFileService.saveCodeFile({
      userId: session.userId,
      sessionId: session.id,
      filename: cleanFilename,
      language,
      content,
      description: cleanDescription,
      isPublic,
      executionCount: 0
    });

    if (!fileId) {
      return ApiResponseHandler.error(res, 'Failed to save file', 500);
    }

    // Aggiorna attività sessione
    await SessionService.updateSessionActivity(session.id);

    return ApiResponseHandler.success(res, {
      fileId,
      filename: cleanFilename,
      language,
      size: content.length,
      isPublic,
      sessionId: session.id,
      created: new Date().toISOString(),
      armstrong: {
        message: `📁 File "${cleanFilename}" saved successfully! 🤖`,
        tip: isPublic ? "Your file is public and discoverable by others!" : "Your file is private to your session.",
        stats: {
          contentLines: content.split('\n').length,
          characters: content.length,
          type: language
        }
      }
    }, 'File saved successfully');

  } catch (error) {
    console.error('Save file error:', error);
    return ApiResponseHandler.error(res, 'Failed to save file', 500);
  }
}

export default apiWrapper(saveFileHandler, {
  methods: ['POST'],
  rateLimit: true
});