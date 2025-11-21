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
      aggregated_results: {
        Row: {
          avg_over_min_abs: number | null
          avg_over_min_pct: number | null
          avg_price: number | null
          created_at: string
          id: string
          max_over_min_abs: number | null
          max_over_min_pct: number | null
          max_price: number | null
          median_price: number | null
          min_price: number | null
          p10_price: number | null
          p90_price: number | null
          prices_total_count: number
          prices_used_count: number
          recommended_nmck: number | null
          request_id: string
        }
        Insert: {
          avg_over_min_abs?: number | null
          avg_over_min_pct?: number | null
          avg_price?: number | null
          created_at?: string
          id?: string
          max_over_min_abs?: number | null
          max_over_min_pct?: number | null
          max_price?: number | null
          median_price?: number | null
          min_price?: number | null
          p10_price?: number | null
          p90_price?: number | null
          prices_total_count?: number
          prices_used_count?: number
          recommended_nmck?: number | null
          request_id: string
        }
        Update: {
          avg_over_min_abs?: number | null
          avg_over_min_pct?: number | null
          avg_price?: number | null
          created_at?: string
          id?: string
          max_over_min_abs?: number | null
          max_over_min_pct?: number | null
          max_price?: number | null
          median_price?: number | null
          min_price?: number | null
          p10_price?: number | null
          p90_price?: number | null
          prices_total_count?: number
          prices_used_count?: number
          recommended_nmck?: number | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aggregated_results_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      analogs: {
        Row: {
          created_at: string
          id: string
          matched_by: string
          name: string
          normalized_params: Json | null
          request_id: string
          supplier_or_brand: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          matched_by?: string
          name: string
          normalized_params?: Json | null
          request_id: string
          supplier_or_brand?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          matched_by?: string
          name?: string
          normalized_params?: Json | null
          request_id?: string
          supplier_or_brand?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analogs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      characteristics: {
        Row: {
          created_at: string
          id: string
          name: string
          request_id: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          request_id: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          request_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "characteristics_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      gpt_logs: {
        Row: {
          created_at: string
          id: string
          prompt: string
          request_id: string | null
          response: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          request_id?: string | null
          response: string
          status: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          request_id?: string | null
          response?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "gpt_logs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          analog_id: string
          collected_at: string
          currency: string
          id: string
          is_excluded: boolean
          price: number
          source_id: string | null
          source_name: string
          source_url: string | null
        }
        Insert: {
          analog_id: string
          collected_at?: string
          currency?: string
          id?: string
          is_excluded?: boolean
          price: number
          source_id?: string | null
          source_name: string
          source_url?: string | null
        }
        Update: {
          analog_id?: string
          collected_at?: string
          currency?: string
          id?: string
          is_excluded?: boolean
          price?: number
          source_id?: string | null
          source_name?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_analog_id_fkey"
            columns: ["analog_id"]
            isOneToOne: false
            referencedRelation: "analogs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          category: string | null
          created_at: string
          description: string
          folder_id: string | null
          id: string
          quantity: number
          search_mode: Database["public"]["Enums"]["search_mode"]
          sources_selected: string[] | null
          status: Database["public"]["Enums"]["request_status"]
          title: string
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          folder_id?: string | null
          id?: string
          quantity: number
          search_mode?: Database["public"]["Enums"]["search_mode"]
          sources_selected?: string[] | null
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          folder_id?: string | null
          id?: string
          quantity?: number
          search_mode?: Database["public"]["Enums"]["search_mode"]
          sources_selected?: string[] | null
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          type?: string
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
      request_status: "draft" | "calculated" | "approved"
      search_mode: "STRICT" | "EXTENDED"
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
    Enums: {
      request_status: ["draft", "calculated", "approved"],
      search_mode: ["STRICT", "EXTENDED"],
    },
  },
} as const
