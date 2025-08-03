// lib/middleware/apiWrapper.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { securityMiddleware } from './security';
import { ApiResponseHandler } from '../utils/apiResponse';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

interface ApiWrapperOptions {
  methods?: string[];
  requireAuth?: boolean;
  rateLimit?: boolean;
}

// Estendi il tipo per includere ip
interface ExtendedNextApiRequest extends NextApiRequest {
  ip?: string;
}

export function apiWrapper(
  handler: ApiHandler,
  options: ApiWrapperOptions = {}
) {
  const {
    methods = ['GET', 'POST'],
    requireAuth = false,
    rateLimit = true
  } = options;

  return async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
    try {
      // Metodo HTTP check
      if (!methods.includes(req.method || '')) {
        return ApiResponseHandler.error(
          res,
          `Method ${req.method} not allowed`,
          405
        );
      }

      // Security middleware
      if (rateLimit) {
        await new Promise<void>((resolve, reject) => {
          securityMiddleware(req, res, () => resolve());
        });
      }

      // Auth check (implementeremo dopo)
      if (requireAuth) {
        // TODO: Implementare auth check
      }

      // Esegui handler principale
      await handler(req, res);

    } catch (error: unknown) {
      console.error('API Error:', error);
      
      // Type guard per verificare se error ha una proprietà name e message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      
      if (errorName === 'ValidationError') {
        return ApiResponseHandler.badRequest(res, errorMessage);
      }
      
      return ApiResponseHandler.error(
        res,
        'Internal server error',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  };
}