// pages/api/files/[fileId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../lib/utils/apiResponse';
import { CodeFileService } from '../../../lib/database/services/codeFileService';
import { SessionService } from '../../../lib/database/services/sessionService';

async function fileHandler(req: NextApiRequest, res: NextApiResponse) {
  const { fileId } = req.query;

  if (!fileId || typeof fileId !== 'string') {
    return ApiResponseHandler.badRequest(res, 'File ID is required');
  }

  switch (req.method) {
    case 'GET':
      return await getFile(req, res, fileId);
    case 'PUT':
      return await updateFile(req, res, fileId);
    case 'DELETE':
      return await deleteFile(req, res, fileId);
    default:
      return ApiResponseHandler.error(res, `Method ${req.method} not allowed`, 405);
  }
}

// GET - Recupera file singolo
async function getFile(req: NextApiRequest, res: NextApiResponse, fileId: string) {
  try {
    // Per ora implementiamo una versione semplificata
    // In una versione completa, dovremmo controllare i permessi
    
    return ApiResponseHandler.success(res, {
      message: "File retrieval by ID not yet fully implemented",
      fileId,
      armstrong: {
        message: "🚧 Single file retrieval coming soon! 🤖",
        tip: "Use /api/files/list to see your files for now!"
      }
    }, 'File endpoint available');

  } catch (error) {
    console.error('Get file error:', error);
    return ApiResponseHandler.error(res, 'Failed to retrieve file', 500);
  }
}

// PUT - Aggiorna file esistente
async function updateFile(req: NextApiRequest, res: NextApiResponse, fileId: string) {
  const { content, description, isPublic, sessionToken } = req.body;

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

    // Prepara update data
    const updateData: any = {};
    if (content !== undefined) {
      if (content.length > 50000) {
        return ApiResponseHandler.badRequest(res, 'Content too large (max 50KB)');
      }
      updateData.content = content;
    }
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const success = await CodeFileService.updateCodeFile(fileId, updateData);

    if (!success) {
      return ApiResponseHandler.error(res, 'Failed to update file', 500);
    }

    await SessionService.updateSessionActivity(session.id);

    return ApiResponseHandler.success(res, {
      fileId,
      updated: Object.keys(updateData),
      timestamp: new Date().toISOString(),
      armstrong: {
        message: "📝 File updated successfully! 🤖",
        tip: "Your changes are saved and ready to execute!"
      }
    }, 'File updated successfully');

  } catch (error) {
    console.error('Update file error:', error);
    return ApiResponseHandler.error(res, 'Failed to update file', 500);
  }
}

// DELETE - Elimina file
async function deleteFile(req: NextApiRequest, res: NextApiResponse, fileId: string) {
  const { sessionToken } = req.body;

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

    const success = await CodeFileService.deleteCodeFile(fileId);

    if (!success) {
      return ApiResponseHandler.error(res, 'Failed to delete file', 500);
    }

    await SessionService.updateSessionActivity(session.id);

    return ApiResponseHandler.success(res, {
      fileId,
      deleted: true,
      timestamp: new Date().toISOString(),
      armstrong: {
        message: "🗑️ File deleted successfully! 🤖",
        tip: "The file has been permanently removed from your session."
      }
    }, 'File deleted successfully');

  } catch (error) {
    console.error('Delete file error:', error);
    return ApiResponseHandler.error(res, 'Failed to delete file', 500);
  }
}

export default apiWrapper(fileHandler, {
  methods: ['GET', 'PUT', 'DELETE'],
  rateLimit: true
});