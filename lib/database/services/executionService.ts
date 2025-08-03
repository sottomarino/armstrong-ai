// lib/database/services/executionService.ts
import { supabaseAdmin } from '../supabase';

export interface ExecutionData {
  id?: string;
  userId?: string;
  sessionId?: string;
  codeFileId?: string;
  language: string;
  codeSnippet: string;
  success: boolean;
  output?: string;
  errorMessage?: string;
  executionTimeMs?: number;
  executionMethod: 'local' | 'docker' | 'simulation';
  createdAt?: string;
}

export interface ExecutionStats {
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  languageBreakdown: Record<string, number>;
  methodBreakdown: Record<string, number>;
}

export class ExecutionService {
  // Salva esecuzione
  static async saveExecution(execution: ExecutionData): Promise<string | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('executions')
        .insert({
          user_id: execution.userId,
          session_id: execution.sessionId,
          code_file_id: execution.codeFileId,
          language: execution.language,
          code_snippet: execution.codeSnippet,
          success: execution.success,
          output: execution.output,
          error_message: execution.errorMessage,
          execution_time_ms: execution.executionTimeMs,
          execution_method: execution.executionMethod
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving execution:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Save execution error:', error);
      return null;
    }
  }

  // Ottieni esecuzioni per sessione
  static async getSessionExecutions(
    sessionId: string,
    limit: number = 10
  ): Promise<ExecutionData[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('executions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting session executions:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        sessionId: item.session_id,
        codeFileId: item.code_file_id,
        language: item.language,
        codeSnippet: item.code_snippet,
        success: item.success,
        output: item.output,
        errorMessage: item.error_message,
        executionTimeMs: item.execution_time_ms,
        executionMethod: item.execution_method as any,
        createdAt: item.created_at
      }));
    } catch (error) {
      console.error('Get session executions error:', error);
      return [];
    }
  }

  // Statistiche esecuzione
  static async getExecutionStats(
    sessionId?: string,
    userId?: string,
    timeRange?: string
  ): Promise<ExecutionStats> {
    try {
      let query = supabaseAdmin
        .from('executions')
        .select('language, success, execution_time_ms, execution_method, created_at');

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (timeRange) {
        const date = new Date();
        switch (timeRange) {
          case '24h':
            date.setHours(date.getHours() - 24);
            break;
          case '7d':
            date.setDate(date.getDate() - 7);
            break;
          case '30d':
            date.setDate(date.getDate() - 30);
            break;
        }
        query = query.gte('created_at', date.toISOString());
      }

      const { data, error } = await query;

      if (error || !data) {
        return {
          totalExecutions: 0,
          successRate: 0,
          avgExecutionTime: 0,
          languageBreakdown: {},
          methodBreakdown: {}
        };
      }

      const totalExecutions = data.length;
      const successfulExecutions = data.filter(e => e.success).length;
      const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
      
      const executionTimes = data
        .filter(e => e.execution_time_ms)
        .map(e => e.execution_time_ms);
      const avgExecutionTime = executionTimes.length > 0 
        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length 
        : 0;

      const languageBreakdown: Record<string, number> = {};
      const methodBreakdown: Record<string, number> = {};

      data.forEach(execution => {
        languageBreakdown[execution.language] = (languageBreakdown[execution.language] || 0) + 1;
        methodBreakdown[execution.execution_method] = (methodBreakdown[execution.execution_method] || 0) + 1;
      });

      return {
        totalExecutions,
        successRate,
        avgExecutionTime,
        languageBreakdown,
        methodBreakdown
      };
    } catch (error) {
      console.error('Get execution stats error:', error);
      return {
        totalExecutions: 0,
        successRate: 0,
        avgExecutionTime: 0,
        languageBreakdown: {},
        methodBreakdown: {}
      };
    }
  }

  // Top linguaggi utilizzati (globale)
  static async getTopLanguages(limit: number = 5): Promise<Array<{language: string, count: number}>> {
    try {
      const { data, error } = await supabaseAdmin
        .from('executions')
        .select('language')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Ultimi 30 giorni

      if (error || !data) {
        return [];
      }

      const languageCount: Record<string, number> = {};
      data.forEach(item => {
        languageCount[item.language] = (languageCount[item.language] || 0) + 1;
      });

      return Object.entries(languageCount)
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Get top languages error:', error);
      return [];
    }
  }
}