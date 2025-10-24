import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
  console.error('❌ Supabase configuration error: Missing or invalid environment variables');
  console.error('Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly');
} else {
  console.log('✅ Supabase client initialized:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    redirectTo: import.meta.env.VITE_SITE_URL || 'https://nexusaisuite.com'
  },
  global: {
    headers: {
      'x-application-name': 'nexus-ai'
    }
  }
})

// Test Supabase connection on initialization
export const testSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', error.message)
      return false
    }
    console.log('✅ Supabase connection test successful')
    return true
  } catch (err) {
    console.error('❌ Supabase connection test error:', err)
    return false
  }
}

// Run connection test in development
if (import.meta.env.DEV) {
  testSupabaseConnection()
}

// Database types (you'll need to generate these from your Supabase schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at: string
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          joined_at?: string
          created_at?: string
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          email: string
          role: 'admin' | 'member' | 'viewer'
          invited_by: string
          token: string
          status: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at: string
          created_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          email: string
          role: 'admin' | 'member' | 'viewer'
          invited_by: string
          token: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at: string
          created_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          team_id?: string
          email?: string
          role?: 'admin' | 'member' | 'viewer'
          invited_by?: string
          token?: string
          status?: 'pending' | 'accepted' | 'declined' | 'expired'
          expires_at?: string
          created_at?: string
          accepted_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string
          priority: 'low' | 'medium' | 'high'
          team_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string
          priority?: 'low' | 'medium' | 'high'
          team_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string
          priority?: 'low' | 'medium' | 'high'
          team_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      // Nexus AI Tables
      ai_agents: {
        Row: {
          id: string
          name: string
          role: string
          description: string | null
          system_prompt: string
          model: any
          memory: any
          permissions: any
          status: string
          created_at: string
          updated_at: string
          last_activity: string
          metrics: any
          created_by: string
          team_id: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          description?: string | null
          system_prompt: string
          model?: any
          memory?: any
          permissions?: any
          status?: string
          created_at?: string
          updated_at?: string
          last_activity?: string
          metrics?: any
          created_by: string
          team_id: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          description?: string | null
          system_prompt?: string
          model?: any
          memory?: any
          permissions?: any
          status?: string
          created_at?: string
          updated_at?: string
          last_activity?: string
          metrics?: any
          created_by?: string
          team_id?: string
        }
      }
      workflows: {
        Row: {
          id: string
          name: string
          description: string | null
          nodes: any
          edges: any
          triggers: any
          status: string
          created_at: string
          updated_at: string
          created_by: string
          team_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          nodes?: any
          edges?: any
          triggers?: any
          status?: string
          created_at?: string
          updated_at?: string
          created_by: string
          team_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          nodes?: any
          edges?: any
          triggers?: any
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          team_id?: string
        }
      }
      api_connectors: {
        Row: {
          id: string
          name: string
          type: string
          config: any
          status: string
          last_sync: string | null
          permissions: any
          created_at: string
          updated_at: string
          created_by: string
          team_id: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          config?: any
          status?: string
          last_sync?: string | null
          permissions?: any
          created_at?: string
          updated_at?: string
          created_by: string
          team_id: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          config?: any
          status?: string
          last_sync?: string | null
          permissions?: any
          created_at?: string
          updated_at?: string
          created_by?: string
          team_id?: string
        }
      }
      rag_documents: {
        Row: {
          id: string
          title: string
          content: string
          source: string
          type: string
          embedding: any
          metadata: any
          created_at: string
          updated_at: string
          created_by: string
          team_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          source: string
          type: string
          embedding?: any
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by: string
          team_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          source?: string
          type?: string
          embedding?: any
          metadata?: any
          created_at?: string
          updated_at?: string
          created_by?: string
          team_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
