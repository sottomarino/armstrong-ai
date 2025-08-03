// lib/database/services/sessionService.ts
import { supabase, supabaseAdmin } from '../supabase';
import { randomUUID } from 'crypto';

export interface SessionData {
  id: string;
  userId?: string;
  sessionToken: string;
  isAnonymous: boolean;
  createdAt: string;
  lastActivity: string;
  executionsCount: number;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionService {
  // Crea sessione anonima
  static async createAnonymousSession(
    ipAddress?: string,
    userAgent?: string
  ): Promise<SessionData | null> {
    try {
      const sessionToken = randomUUID();
      
      const { data, error } = await supabaseAdmin
        .from('sessions')
        .insert({
          session_token: sessionToken,
          is_anonymous: true,
          ip_address: ipAddress,
          user_agent: userAgent,
          executions_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating anonymous session:', error);
        return null;
      }

      return {
        id: data.id,
        sessionToken: data.session_token,
        isAnonymous: data.is_anonymous,
        createdAt: data.created_at,
        lastActivity: data.last_activity,
        executionsCount: data.executions_count,
        ipAddress: data.ip_address,
        userAgent: data.user_agent
      };
    } catch (error) {
      console.error('Session creation error:', error);
      return null;
    }
  }

  // Ottieni sessione da token
  static async getSessionByToken(sessionToken: string): Promise<SessionData | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        sessionToken: data.session_token,
        isAnonymous: data.is_anonymous,
        createdAt: data.created_at,
        lastActivity: data.last_activity,
        executionsCount: data.executions_count,
        ipAddress: data.ip_address,
        userAgent: data.user_agent
      };
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Aggiorna attività sessione
  static async updateSessionActivity(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('sessions')
        .update({
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      return !error;
    } catch (error) {
      console.error('Update session activity error:', error);
      return false;
    }
  }

  // Incrementa contatore esecuzioni
  static async incrementExecutions(sessionId: string): Promise<boolean> {
    try {
      // Prima ottieni il contatore attuale
      const { data: currentData, error: selectError } = await supabaseAdmin
        .from('sessions')
        .select('executions_count')
        .eq('id', sessionId)
        .single();

      if (selectError) {
        console.error('Error getting current executions count:', selectError);
        return false;
      }

      // Poi aggiorna con il valore incrementato
      const { error: updateError } = await supabaseAdmin
        .from('sessions')
        .update({
          executions_count: (currentData.executions_count || 0) + 1,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId);

      return !updateError;
    } catch (error) {
      console.error('Increment executions error:', error);
      return false;
    }
  }

  // Pulisci sessioni scadute (task di manutenzione)
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 7); // 7 giorni fa

      const { data, error } = await supabaseAdmin
        .from('sessions')
        .delete()
        .lt('last_activity', expiredDate.toISOString())
        .select('id');

      if (error) {
        console.error('Cleanup sessions error:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Cleanup error:', error);
      return 0;
    }
  }
}