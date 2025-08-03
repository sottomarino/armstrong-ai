// pages/api/sessions/[sessionId]/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { apiWrapper } from '../../../../lib/middleware/apiWrapper';
import { ApiResponseHandler } from '../../../../lib/utils/apiResponse';
import { ExecutionService } from '../../../../lib/database/services/executionService';
import { SessionService } from '../../../../lib/database/services/sessionService';

async function sessionStatsHandler(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  const { timeRange = '24h' } = req.query;

  if (!sessionId || typeof sessionId !== 'string') {
    return ApiResponseHandler.badRequest(res, 'Session ID is required');
  }

  try {
    // Verifica sessione
    const session = await SessionService.getSessionByToken(sessionId);
    if (!session) {
      return ApiResponseHandler.notFound(res, 'Session not found');
    }

    // Ottieni statistiche
    const stats = await ExecutionService.getExecutionStats(
      session.id,
      undefined,
      timeRange as string
    );

    // Ottieni esecuzioni recenti per timeline
    const recentExecutions = await ExecutionService.getSessionExecutions(session.id, 10);

    // Calcola insights
    const insights = generateInsights(stats, recentExecutions);

    return ApiResponseHandler.success(res, {
      sessionId: session.id,
      timeRange,
      statistics: {
        overview: {
          totalExecutions: stats.totalExecutions,
          successRate: Math.round(stats.successRate * 100) / 100,
          avgExecutionTime: Math.round(stats.avgExecutionTime),
          sessionDuration: calculateSessionDuration(session.createdAt, session.lastActivity)
        },
        languages: Object.entries(stats.languageBreakdown)
          .map(([language, count]) => ({
            language,
            count,
            percentage: Math.round((count / stats.totalExecutions) * 100)
          }))
          .sort((a, b) => b.count - a.count),
        methods: Object.entries(stats.methodBreakdown)
          .map(([method, count]) => ({
            method,
            count,
            percentage: Math.round((count / stats.totalExecutions) * 100)
          }))
          .sort((a, b) => b.count - a.count),
        timeline: recentExecutions.slice(0, 5).map(execution => ({
          timestamp: execution.createdAt,
          language: execution.language,
          success: execution.success,
          executionTime: execution.executionTimeMs
        }))
      },
      insights: insights,
      armstrong: {
        message: "📈 Armstrong Analytics ready! Your coding journey analyzed! 🤖",
        performance: getPerformanceMessage(stats.successRate, stats.avgExecutionTime),
        recommendation: getRecommendation(stats.languageBreakdown, stats.successRate)
      }
    }, 'Session statistics retrieved successfully');

  } catch (error) {
    console.error('Session stats error:', error);
    return ApiResponseHandler.error(res, 'Failed to retrieve session statistics', 500);
  }
}

function calculateSessionDuration(createdAt: string, lastActivity: string): string {
  const created = new Date(createdAt);
  const last = new Date(lastActivity);
  const diffMs = last.getTime() - created.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function generateInsights(stats: any, recentExecutions: any[]): string[] {
  const insights: string[] = [];
  
  if (stats.successRate > 90) {
    insights.push("🎯 Excellent success rate! You're coding like a pro!");
  } else if (stats.successRate > 70) {
    insights.push("👍 Good success rate! Keep practicing to improve!");
  } else {
    insights.push("💪 Room for improvement! Don't give up, every error is learning!");
  }
  
  if (stats.avgExecutionTime < 100) {
    insights.push("⚡ Lightning fast executions! Your code is efficient!");
  } else if (stats.avgExecutionTime > 1000) {
    insights.push("🐌 Consider optimizing your code for faster execution!");
  }
  
  const topLanguage = Object.entries(stats.languageBreakdown).sort(([,a], [,b]) => (b as number) - (a as number))[0];
  if (topLanguage) {
    insights.push(`🚀 ${topLanguage[0]} seems to be your favorite language!`);
  }
  
  if (recentExecutions.length >= 5) {
    insights.push("🔥 You're on a coding streak! Keep it up!");
  }
  
  return insights;
}

function getPerformanceMessage(successRate: number, avgTime: number): string {
  if (successRate > 90 && avgTime < 200) {
    return "🏆 EXCELLENT - You're a coding champion!";
  } else if (successRate > 70 && avgTime < 500) {
    return "🎯 GOOD - Solid coding performance!";
  } else if (successRate > 50) {
    return "📈 IMPROVING - Keep practicing!";
  } else {
    return "💪 LEARNING - Every expert was once a beginner!";
  }
}

function getRecommendation(languageBreakdown: Record<string, number>, successRate: number): string {
  const languages = Object.keys(languageBreakdown);
  
  if (languages.length === 1) {
    return `Try exploring other languages like ${languages[0] === 'javascript' ? 'Python' : 'JavaScript'}!`;
  } else if (successRate < 70) {
    return "Focus on understanding error messages - they're your debugging friends!";
  } else {
    return "You're doing great! Try building more complex projects!";
  }
}

export default apiWrapper(sessionStatsHandler, {
  methods: ['GET'],
  rateLimit: true
});