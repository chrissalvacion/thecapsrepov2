export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string | null
          created_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          access_code: string | null
          team_name: string | null
          proponents: Json
          program: string | null
          class_code: string | null
          email: string | null
          contact_num: string | null
          adviser: string | null
          created_at: string
        }
        Insert: {
          id: string
          access_code?: string | null
          team_name?: string | null
          proponents?: Json
          program?: string | null
          class_code?: string | null
          email?: string | null
          contact_num?: string | null
          adviser?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          access_code?: string | null
          team_name?: string | null
          proponents?: Json
          program?: string | null
          class_code?: string | null
          email?: string | null
          contact_num?: string | null
          adviser?: string | null
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          team_id: string | null
          project_title: string | null
          school_year: string | null
          description: string | null
          objectives: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id: string
          team_id?: string | null
          project_title?: string | null
          school_year?: string | null
          description?: string | null
          objectives?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          project_title?: string | null
          school_year?: string | null
          description?: string | null
          objectives?: string | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      defenses: {
        Row: {
          id: string
          team_id: string | null
          defense_type: string | null
          defense_date: string | null
          defense_time: string | null
          panelists: Json
          recommendations: string
          suggestions: string
          status: string | null
          created_at: string
        }
        Insert: {
          id: string
          team_id?: string | null
          defense_type?: string | null
          defense_date?: string | null
          defense_time?: string | null
          panelists?: Json
          recommendations?: string
          suggestions?: string
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          defense_type?: string | null
          defense_date?: string | null
          defense_time?: string | null
          panelists?: Json
          recommendations?: string
          suggestions?: string
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "defenses_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          id: string
          team_id: string | null
          issues: string | null
          recommendations: string | null
          created_at: string
        }
        Insert: {
          id: string
          team_id?: string | null
          issues?: string | null
          recommendations?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string | null
          issues?: string | null
          recommendations?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      panelists: {
        Row: {
          id: string
          name: string | null
          designation: string | null
          position: string | null
          email: string | null
          contact: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          designation?: string | null
          position?: string | null
          email?: string | null
          contact?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          designation?: string | null
          position?: string | null
          email?: string | null
          contact?: string | null
          created_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database }
    ? PublicTableNameOrOptions
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName & keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])]
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions]
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database }
    ? PublicTableNameOrOptions
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName & keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]]["Insert"]
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions]["Insert"]
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database }
    ? PublicTableNameOrOptions
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName & keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]]["Update"]
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions]["Update"]
    : never
