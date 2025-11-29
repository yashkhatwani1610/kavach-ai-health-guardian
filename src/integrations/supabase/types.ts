export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      environment: {
        Row: {
          air_quality: number | null
          co2: number | null
          created_at: string | null
          gas_level: number | null
          humidity: number | null
          id: string
          noise_level: number | null
          pm10: number | null
          pm25: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          air_quality?: number | null
          co2?: number | null
          created_at?: string | null
          gas_level?: number | null
          humidity?: number | null
          id?: string
          noise_level?: number | null
          pm10?: number | null
          pm25?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          air_quality?: number | null
          co2?: number | null
          created_at?: string | null
          gas_level?: number | null
          humidity?: number | null
          id?: string
          noise_level?: number | null
          pm10?: number | null
          pm25?: number | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
      parents: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string | null
          relation_type: string | null
          user_id: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          relation_type?: string | null
          user_id?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          relation_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parents_user id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          file_url: string | null
          id: string
          report_type: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          file_url?: string | null
          id?: string
          report_type?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          file_url?: string | null
          id?: string
          report_type?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sensor_logs: {
        Row: {
          id: string
          raw_data: string | null
          recorded_at: string | null
          sensor_type: string | null
          user_id: string | null
          value: string | null
        }
        Insert: {
          id?: string
          raw_data?: string | null
          recorded_at?: string | null
          sensor_type?: string | null
          user_id?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          raw_data?: string | null
          recorded_at?: string | null
          sensor_type?: string | null
          user_id?: string | null
          value?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          age: string | null
          city: string | null
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          age?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          age?: string | null
          city?: string | null
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      vitals: {
        Row: {
          bp: string | null
          created_at: string | null
          heart_rate: number | null
          id: string
          respiration_rate: number | null
          spo2: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          bp?: string | null
          created_at?: string | null
          heart_rate?: number | null
          id?: string
          respiration_rate?: number | null
          spo2?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          bp?: string | null
          created_at?: string | null
          heart_rate?: number | null
          id?: string
          respiration_rate?: number | null
          spo2?: number | null
          temperature?: number | null
          user_id?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
