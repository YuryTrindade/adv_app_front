export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          oab_cpf: string
          avatar_url: string | null
          created_at: string
          updated_at: string
          google_calendar_connected: boolean
          google_refresh_token: string | null
          google_calendar_id: string | null
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          oab_cpf: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          google_calendar_connected?: boolean
          google_refresh_token?: string | null
          google_calendar_id?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          oab_cpf?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          google_calendar_connected?: boolean
          google_refresh_token?: string | null
          google_calendar_id?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          cpf_cnpj: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          cpf_cnpj?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          cpf_cnpj?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          user_id: string
          client_id: string
          case_number: string
          court: string | null
          type: string
          subject: string
          status: string
          description: string | null
          filing_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          case_number: string
          court?: string | null
          type: string
          subject: string
          status: string
          description?: string | null
          filing_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string
          case_number?: string
          court?: string | null
          type?: string
          subject?: string
          status?: string
          description?: string | null
          filing_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hearings: {
        Row: {
          id: string
          user_id: string
          case_id: string
          title: string
          date: string
          location: string | null
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          case_id: string
          title: string
          date: string
          location?: string | null
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          case_id?: string
          title?: string
          date?: string
          location?: string | null
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      diligences: {
        Row: {
          id: string
          user_id: string
          case_id: string | null
          attorney_name: string
          attorney_oab: string
          attorney_phone: string
          attorney_email: string | null
          date: string
          court: string | null
          task_type: string
          task_description: string
          fee_amount: number | null
          status: string
          outcome: string | null
          documents: Json[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          case_id?: string | null
          attorney_name: string
          attorney_oab: string
          attorney_phone: string
          attorney_email?: string | null
          date: string
          court?: string | null
          task_type: string
          task_description: string
          fee_amount?: number | null
          status: string
          outcome?: string | null
          documents?: Json[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          case_id?: string | null
          attorney_name?: string
          attorney_oab?: string
          attorney_phone?: string
          attorney_email?: string | null
          date?: string
          court?: string | null
          task_type?: string
          task_description?: string
          fee_amount?: number | null
          status?: string
          outcome?: string | null
          documents?: Json[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export type Client = Database["public"]["Tables"]["clients"]["Row"]
export type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"]
export type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"]

export type Case = Database["public"]["Tables"]["cases"]["Row"]
export type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"]
export type CaseUpdate = Database["public"]["Tables"]["cases"]["Update"]

export type Hearing = Database["public"]["Tables"]["hearings"]["Row"]
export type HearingInsert = Database["public"]["Tables"]["hearings"]["Insert"]
export type HearingUpdate = Database["public"]["Tables"]["hearings"]["Update"]

export type Diligence = Database["public"]["Tables"]["diligences"]["Row"]
export type DiligenceInsert = Database["public"]["Tables"]["diligences"]["Insert"]
export type DiligenceUpdate = Database["public"]["Tables"]["diligences"]["Update"]
