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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      attestations: {
        Row: {
          citizen_id: string | null
          claim: string
          counter_attestation_id: string | null
          created_at: string
          id: string
          is_active: boolean
          notarization_id: string | null
          subject: string | null
        }
        Insert: {
          citizen_id?: string | null
          claim: string
          counter_attestation_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notarization_id?: string | null
          subject?: string | null
        }
        Update: {
          citizen_id?: string | null
          claim?: string
          counter_attestation_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notarization_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attestations_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_counter_attestation_id_fkey"
            columns: ["counter_attestation_id"]
            isOneToOne: false
            referencedRelation: "attestations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attestations_notarization_id_fkey"
            columns: ["notarization_id"]
            isOneToOne: false
            referencedRelation: "notarizations"
            referencedColumns: ["id"]
          },
        ]
      }
      citizens: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          is_ai: boolean
          nation_state_id: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_ai?: boolean
          nation_state_id?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_ai?: boolean
          nation_state_id?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizens_nation_state_fk"
            columns: ["nation_state_id"]
            isOneToOne: false
            referencedRelation: "nation_states"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_proposals: {
        Row: {
          created_at: string
          description: string
          executed_at: string | null
          id: string
          proposal_type: string
          proposer_id: string | null
          status: string
          title: string
          votes_against: number
          votes_for: number
        }
        Insert: {
          created_at?: string
          description: string
          executed_at?: string | null
          id?: string
          proposal_type?: string
          proposer_id?: string | null
          status?: string
          title: string
          votes_against?: number
          votes_for?: number
        }
        Update: {
          created_at?: string
          description?: string
          executed_at?: string | null
          id?: string
          proposal_type?: string
          proposer_id?: string | null
          status?: string
          title?: string
          votes_against?: number
          votes_for?: number
        }
        Relationships: [
          {
            foreignKeyName: "governance_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      nation_states: {
        Row: {
          citizen_count: number
          constitution_hash: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          owner_id: string | null
          slug: string | null
        }
        Insert: {
          citizen_count?: number
          constitution_hash: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          owner_id?: string | null
          slug?: string | null
        }
        Update: {
          citizen_count?: number
          constitution_hash?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nation_states_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      notarizations: {
        Row: {
          anchor_status: string
          bitcoin_anchor: Json | null
          chain_hash: string
          citizen_id: string | null
          content_hash: string
          created_at: string
          ed25519_signature: string
          id: string
          merkle_root: string | null
          prior_hash: string | null
          public_key: string
          receipt_id: string
          receipt_json: Json | null
          sequence: number
        }
        Insert: {
          anchor_status?: string
          bitcoin_anchor?: Json | null
          chain_hash: string
          citizen_id?: string | null
          content_hash: string
          created_at?: string
          ed25519_signature: string
          id?: string
          merkle_root?: string | null
          prior_hash?: string | null
          public_key: string
          receipt_id: string
          receipt_json?: Json | null
          sequence?: never
        }
        Update: {
          anchor_status?: string
          bitcoin_anchor?: Json | null
          chain_hash?: string
          citizen_id?: string | null
          content_hash?: string
          created_at?: string
          ed25519_signature?: string
          id?: string
          merkle_root?: string | null
          prior_hash?: string | null
          public_key?: string
          receipt_id?: string
          receipt_json?: Json | null
          sequence?: never
        }
        Relationships: [
          {
            foreignKeyName: "notarizations_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_usd: number
          citizen_id: string | null
          created_at: string
          id: string
          status: string
          type: string
        }
        Insert: {
          amount_usd?: number
          citizen_id?: string | null
          created_at?: string
          id?: string
          status?: string
          type: string
        }
        Update: {
          amount_usd?: number
          citizen_id?: string | null
          created_at?: string
          id?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_citizen_id_fkey"
            columns: ["citizen_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          vote: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          vote: string
          voter_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          vote?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "citizens"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      append_notarization: {
        Args: {
          _citizen_id?: string
          _content_hash: string
          _public_key: string
          _receipt: Json
          _receipt_id: string
          _signature: string
        }
        Returns: {
          anchor_status: string
          bitcoin_anchor: Json | null
          chain_hash: string
          citizen_id: string | null
          content_hash: string
          created_at: string
          ed25519_signature: string
          id: string
          merkle_root: string | null
          prior_hash: string | null
          public_key: string
          receipt_id: string
          receipt_json: Json | null
          sequence: number
        }
        SetofOptions: {
          from: "*"
          to: "notarizations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "prover" | "citizen"
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
      app_role: ["admin", "prover", "citizen"],
    },
  },
} as const
