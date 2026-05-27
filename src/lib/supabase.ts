import { createClient } from '@supabase/supabase-js'
import type { Case, CallLog, Reminder } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

export type Database = {
  public: {
    Tables: {
      cases: {
        Row: Case
        Insert: Omit<Case, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Case, 'id' | 'user_id'>>
      }
      call_logs: {
        Row: CallLog
        Insert: Omit<CallLog, 'id' | 'logged_at'> & { id?: string; logged_at?: string }
        Update: Partial<Omit<CallLog, 'id' | 'user_id' | 'case_id'>>
      }
      reminders: {
        Row: Reminder
        Insert: Omit<Reminder, 'id' | 'created_at' | 'sent'> & {
          id?: string
          created_at?: string
          sent?: boolean
        }
        Update: Partial<Omit<Reminder, 'id' | 'user_id' | 'case_id'>>
      }
    }
  }
}
