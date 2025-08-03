// lib/database/services/codeFileService.ts
import { supabaseAdmin } from '../supabase';

export interface CodeFileData {
  id?: string;
  userId?: string;
  sessionId?: string;
  filename: string;
  language: string;
  content: string;
  description?: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
  executionCount: number;
}

export class CodeFileService {
  // Salva file di codice
  static async saveCodeFile(file: CodeFileData): Promise<string | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('code_files')
        .insert({
          user_id: file.userId,
          session_id: file.sessionId,
          filename: file.filename,
          language: file.language,
          content: file.content,
          description: file.description,
          is_public: file.isPublic
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving code file:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Save code file error:', error);
      return null;
    }
  }

  // Ottieni file per sessione
  static async getSessionFiles(sessionId: string): Promise<CodeFileData[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('code_files')
        .select('*')
        .eq('session_id', sessionId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error getting session files:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        sessionId: item.session_id,
        filename: item.filename,
        language: item.language,
        content: item.content,
        description: item.description,
        isPublic: item.is_public,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        executionCount: item.execution_count
      }));
    } catch (error) {
      console.error('Get session files error:', error);
      return [];
    }
  }

  // Aggiorna file
  static async updateCodeFile(
    fileId: string,
    updates: Partial<CodeFileData>
  ): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.filename) updateData.filename = updates.filename;
      if (updates.content) updateData.content = updates.content;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
      
      updateData.updated_at = new Date().toISOString();

      const { error } = await supabaseAdmin
        .from('code_files')
        .update(updateData)
        .eq('id', fileId);

      return !error;
    } catch (error) {
      console.error('Update code file error:', error);
      return false;
    }
  }

  // Incrementa contatore esecuzioni file
  static async incrementFileExecutions(fileId: string): Promise<boolean> {
    try {
      // Prima ottieni il contatore attuale
      const { data: currentData, error: selectError } = await supabaseAdmin
        .from('code_files')
        .select('execution_count')
        .eq('id', fileId)
        .single();

      if (selectError) {
        console.error('Error getting current execution count:', selectError);
        return false;
      }

      // Poi aggiorna con il valore incrementato
      const { error: updateError } = await supabaseAdmin
        .from('code_files')
        .update({
          execution_count: (currentData.execution_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      return !updateError;
    } catch (error) {
      console.error('Increment file executions error:', error);
      return false;
    }
  }

  // Elimina file
  static async deleteCodeFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('code_files')
        .delete()
        .eq('id', fileId);

      return !error;
    } catch (error) {
      console.error('Delete code file error:', error);
      return false;
    }
  }

  // File pubblici (per discovery)
  static async getPublicFiles(
    language?: string,
    limit: number = 20
  ): Promise<CodeFileData[]> {
    try {
      let query = supabaseAdmin
        .from('code_files')
        .select('*')
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (language) {
        query = query.eq('language', language);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting public files:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        sessionId: item.session_id,
        filename: item.filename,
        language: item.language,
        content: item.content,
        description: item.description,
        isPublic: item.is_public,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        executionCount: item.execution_count
      }));
    } catch (error) {
      console.error('Get public files error:', error);
      return [];
    }
  }
}