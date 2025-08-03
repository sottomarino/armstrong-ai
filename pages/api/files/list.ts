// pages/api/files/list.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../lib/utils/apiResponse';
import { CodeFileService } from '../../../lib/database/services/codeFileService';
import { SessionService } from '../../../lib/database/services/sessionService';

async function listFilesHandler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionToken, language, public: isPublic } = req.query;

  try {
    // Se richiesti file pubblici
    if (isPublic === 'true') {
      const publicFiles = await CodeFileService.getPublicFiles(
        language as string,
        20
      );

      return ApiResponseHandler.success(res, {
        files: publicFiles.map(file => ({
          id: file.id,
          filename: file.filename,
          language: file.language,
          description: file.description,
          size: file.content.length,
          lines: file.content.split('\n').length,
          executionCount: file.executionCount,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          preview: file.content.substring(0, 200) + (file.content.length > 200 ? '...' : '')
        })),
        total: publicFiles.length,
        type: 'public',
        armstrong: {
          message: `🌍 Found ${publicFiles.length} public files! 🤖`,
          tip: "Explore community code and get inspired!"
        }
      }, 'Public files retrieved successfully');
    }

    // File della sessione
    const sessionTokenToUse = sessionToken as string || 
      req.headers['x-armstrong-session'] as string ||
      req.headers.cookie?.split(';').find(c => c.trim().startsWith('armstrong_session='))?.split('=')[1];

    if (!sessionTokenToUse) {
      return ApiResponseHandler.badRequest(res, 'Session token is required for private files');
    }

    const session = await SessionService.getSessionByToken(sessionTokenToUse);
    if (!session) {
      return ApiResponseHandler.notFound(res, 'Session not found');
    }

    const sessionFiles = await CodeFileService.getSessionFiles(session.id);

    // Filtra per linguaggio se specificato
    let filteredFiles = sessionFiles;
    if (language && typeof language === 'string') {
      filteredFiles = sessionFiles.filter(f => f.language === language);
    }

    // Aggiungi statistiche
    const stats = {
      total: filteredFiles.length,
      byLanguage: filteredFiles.reduce((acc, file) => {
        acc[file.language] = (acc[file.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      totalSize: filteredFiles.reduce((sum, file) => sum + file.content.length, 0),
      totalLines: filteredFiles.reduce((sum, file) => sum + file.content.split('\n').length, 0),
      publicCount: filteredFiles.filter(f => f.isPublic).length
    };

    return ApiResponseHandler.success(res, {
      files: filteredFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        language: file.language,
        description: file.description,
        isPublic: file.isPublic,
        size: file.content.length,
        lines: file.content.split('\n').length,
        executionCount: file.executionCount,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        preview: file.content.substring(0, 200) + (file.content.length > 200 ? '...' : '')
      })),
      statistics: stats,
      sessionId: session.id,
      type: 'session',
      armstrong: {
        message: `📂 Found ${filteredFiles.length} files in your session! 🤖`,
        tip: stats.total === 0 
          ? "Start saving your code to build your personal library!"
          : `Your favorite language: ${Object.entries(stats.byLanguage).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'}`,
        stats: {
          mostUsedLanguage: Object.entries(stats.byLanguage).sort(([,a], [,b]) => b - a)[0]?.[0],
          averageFileSize: Math.round(stats.totalSize / Math.max(stats.total, 1)),
          codebase: `${stats.totalLines} lines across ${stats.total} files`
        }
      }
    }, 'Session files retrieved successfully');

  } catch (error) {
    console.error('List files error:', error);
    return ApiResponseHandler.error(res, 'Failed to retrieve files', 500);
  }
}

export default apiWrapper(listFilesHandler, {
  methods: ['GET'],
  rateLimit: true
});