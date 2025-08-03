// lib/utils/apiResponse.ts
import { NextApiResponse } from 'next';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export class ApiResponseHandler {
  static success<T>(
    res: NextApiResponse,
    data: T,
    message?: string,
    statusCode: number = 200
  ) {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };
    
    return res.status(statusCode).json(response);
  }

  static error(
    res: NextApiResponse,
    error: string,
    statusCode: number = 500,
    details?: any
  ) {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId()
    };

    // In development, include error details
    if (process.env.NODE_ENV === 'development' && details) {
      response.data = { details };
    }

    return res.status(statusCode).json(response);
  }

  static unauthorized(res: NextApiResponse, message: string = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  static forbidden(res: NextApiResponse, message: string = 'Forbidden') {
    return this.error(res, message, 403);
  }

  static notFound(res: NextApiResponse, message: string = 'Not found') {
    return this.error(res, message, 404);
  }

  static badRequest(res: NextApiResponse, message: string = 'Bad request') {
    return this.error(res, message, 400);
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}