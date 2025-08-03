// lib/database/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client per uso generale (browser + server)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client admin per operazioni server-side (bypassa RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Types per il database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          total_executions: number;
          favorite_language: string;
          settings: any;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          total_executions?: number;
          favorite_language?: string;
          settings?: any;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          total_executions?: number;
          favorite_language?: string;
          settings?: any;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string | null;
          session_token: string;
          is_anonymous: boolean;
          created_at: string;
          last_activity: string;
          executions_count: number;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_token: string;
          is_anonymous?: boolean;
          created_at?: string;
          last_activity?: string;
          executions_count?: number;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_token?: string;
          is_anonymous?: boolean;
          created_at?: string;
          last_activity?: string;
          executions_count?: number;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      code_files: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          filename: string;
          language: string;
          content: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
          execution_count: number;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          filename: string;
          language: string;
          content: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          execution_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          filename?: string;
          language?: string;
          content?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
          execution_count?: number;
        };
      };
      executions: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          code_file_id: string | null;
          language: string;
          code_snippet: string;
          success: boolean;
          output: string | null;
          error_message: string | null;
          execution_time_ms: number | null;
          execution_method: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          code_file_id?: string | null;
          language: string;
          code_snippet: string;
          success: boolean;
          output?: string | null;
          error_message?: string | null;
          execution_time_ms?: number | null;
          execution_method?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          code_file_id?: string | null;
          language?: string;
          code_snippet?: string;
          success?: boolean;
          output?: string | null;
          error_message?: string | null;
          execution_time_ms?: number | null;
          execution_method?: string;
          created_at?: string;
        };
      };
    };
  };
};

// Helper per ottenere client tipizzato
export const getSupabaseClient = () => supabase as any;
export const getSupabaseAdmin = () => supabaseAdmin as any;