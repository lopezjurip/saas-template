export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      addresses_level0: {
        Row: {
          address_level0_created_at: string;
          address_level0_disabled_at: string | null;
          address_level0_hidden_at: string | null;
          address_level0_id: string;
          address_level0_name: string;
          address_level0_updated_at: string;
        };
        Insert: {
          address_level0_created_at?: string;
          address_level0_disabled_at?: string | null;
          address_level0_hidden_at?: string | null;
          address_level0_id: string;
          address_level0_name: string;
          address_level0_updated_at?: string;
        };
        Update: {
          address_level0_created_at?: string;
          address_level0_disabled_at?: string | null;
          address_level0_hidden_at?: string | null;
          address_level0_id?: string;
          address_level0_name?: string;
          address_level0_updated_at?: string;
        };
        Relationships: [];
      };
      addresses_level1: {
        Row: {
          address_level0_id: string;
          address_level1_created_at: string;
          address_level1_disabled_at: string | null;
          address_level1_hidden_at: string | null;
          address_level1_id: string;
          address_level1_name: string;
          address_level1_updated_at: string;
        };
        Insert: {
          address_level0_id: string;
          address_level1_created_at?: string;
          address_level1_disabled_at?: string | null;
          address_level1_hidden_at?: string | null;
          address_level1_id: string;
          address_level1_name: string;
          address_level1_updated_at?: string;
        };
        Update: {
          address_level0_id?: string;
          address_level1_created_at?: string;
          address_level1_disabled_at?: string | null;
          address_level1_hidden_at?: string | null;
          address_level1_id?: string;
          address_level1_name?: string;
          address_level1_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_addresses_level1_addresses_level0";
            columns: ["address_level0_id"];
            isOneToOne: false;
            referencedRelation: "addresses_level0";
            referencedColumns: ["address_level0_id"];
          },
        ];
      };
      addresses_level2: {
        Row: {
          address_level0_id: string;
          address_level1_id: string;
          address_level2_created_at: string;
          address_level2_disabled_at: string | null;
          address_level2_hidden_at: string | null;
          address_level2_id: string;
          address_level2_name: string;
          address_level2_updated_at: string;
        };
        Insert: {
          address_level0_id: string;
          address_level1_id: string;
          address_level2_created_at?: string;
          address_level2_disabled_at?: string | null;
          address_level2_hidden_at?: string | null;
          address_level2_id: string;
          address_level2_name: string;
          address_level2_updated_at?: string;
        };
        Update: {
          address_level0_id?: string;
          address_level1_id?: string;
          address_level2_created_at?: string;
          address_level2_disabled_at?: string | null;
          address_level2_hidden_at?: string | null;
          address_level2_id?: string;
          address_level2_name?: string;
          address_level2_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_addresses_level2_addresses_level1";
            columns: ["address_level0_id", "address_level1_id"];
            isOneToOne: false;
            referencedRelation: "addresses_level1";
            referencedColumns: ["address_level0_id", "address_level1_id"];
          },
        ];
      };
      addresses_level3: {
        Row: {
          address_level0_id: string;
          address_level1_id: string;
          address_level2_id: string;
          address_level3_created_at: string;
          address_level3_disabled_at: string | null;
          address_level3_hidden_at: string | null;
          address_level3_id: string;
          address_level3_name: string;
          address_level3_updated_at: string;
        };
        Insert: {
          address_level0_id: string;
          address_level1_id: string;
          address_level2_id: string;
          address_level3_created_at?: string;
          address_level3_disabled_at?: string | null;
          address_level3_hidden_at?: string | null;
          address_level3_id: string;
          address_level3_name: string;
          address_level3_updated_at?: string;
        };
        Update: {
          address_level0_id?: string;
          address_level1_id?: string;
          address_level2_id?: string;
          address_level3_created_at?: string;
          address_level3_disabled_at?: string | null;
          address_level3_hidden_at?: string | null;
          address_level3_id?: string;
          address_level3_name?: string;
          address_level3_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_addresses_level3_addresses_level2";
            columns: ["address_level0_id", "address_level1_id", "address_level2_id"];
            isOneToOne: false;
            referencedRelation: "addresses_level2";
            referencedColumns: ["address_level0_id", "address_level1_id", "address_level2_id"];
          },
        ];
      };
      organization_members: {
        Row: {
          organization_id: number;
          organization_member_created_at: string;
          organization_member_disabled_at: string | null;
          organization_member_role: Database["public"]["Enums"]["organization_member_role"];
          organization_member_updated_at: string;
          profile_id: string;
        };
        Insert: {
          organization_id: number;
          organization_member_created_at?: string;
          organization_member_disabled_at?: string | null;
          organization_member_role: Database["public"]["Enums"]["organization_member_role"];
          organization_member_updated_at?: string;
          profile_id: string;
        };
        Update: {
          organization_id?: number;
          organization_member_created_at?: string;
          organization_member_disabled_at?: string | null;
          organization_member_role?: Database["public"]["Enums"]["organization_member_role"];
          organization_member_updated_at?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      organizations: {
        Row: {
          organization_created_at: string;
          organization_disabled_at: string | null;
          organization_id: number;
          organization_name: string;
          organization_slug: string;
          organization_updated_at: string;
          tenant_id: number;
        };
        Insert: {
          organization_created_at?: string;
          organization_disabled_at?: string | null;
          organization_id?: number;
          organization_name: string;
          organization_slug: string;
          organization_updated_at?: string;
          tenant_id: number;
        };
        Update: {
          organization_created_at?: string;
          organization_disabled_at?: string | null;
          organization_id?: number;
          organization_name?: string;
          organization_slug?: string;
          organization_updated_at?: string;
          tenant_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["tenant_id"];
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      profiles: {
        Row: {
          profile_created_at: string;
          profile_disabled_at: string | null;
          profile_id: string;
          profile_name_full: string | null;
          profile_onboarded_at: string | null;
          profile_updated_at: string;
        };
        Insert: {
          profile_created_at?: string;
          profile_disabled_at?: string | null;
          profile_id: string;
          profile_name_full?: string | null;
          profile_onboarded_at?: string | null;
          profile_updated_at?: string;
        };
        Update: {
          profile_created_at?: string;
          profile_disabled_at?: string | null;
          profile_id?: string;
          profile_name_full?: string | null;
          profile_onboarded_at?: string | null;
          profile_updated_at?: string;
        };
        Relationships: [];
      };
      tenant_domains: {
        Row: {
          domain_created_at: string;
          domain_updated_at: string;
          domain_value: string;
          domain_verified_at: string | null;
          tenant_id: number;
        };
        Insert: {
          domain_created_at?: string;
          domain_updated_at?: string;
          domain_value: string;
          domain_verified_at?: string | null;
          tenant_id: number;
        };
        Update: {
          domain_created_at?: string;
          domain_updated_at?: string;
          domain_value?: string;
          domain_verified_at?: string | null;
          tenant_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["tenant_id"];
          },
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
      tenants: {
        Row: {
          tenant_created_at: string;
          tenant_disabled_at: string | null;
          tenant_id: number;
          tenant_name: string;
          tenant_slug: string;
          tenant_tier: Database["public"]["Enums"]["tenant_tier"];
          tenant_updated_at: string;
        };
        Insert: {
          tenant_created_at?: string;
          tenant_disabled_at?: string | null;
          tenant_id?: number;
          tenant_name: string;
          tenant_slug: string;
          tenant_tier?: Database["public"]["Enums"]["tenant_tier"];
          tenant_updated_at?: string;
        };
        Update: {
          tenant_created_at?: string;
          tenant_disabled_at?: string | null;
          tenant_id?: number;
          tenant_name?: string;
          tenant_slug?: string;
          tenant_tier?: Database["public"]["Enums"]["tenant_tier"];
          tenant_updated_at?: string;
        };
        Relationships: [];
      };
      webauthn_challenges: {
        Row: {
          profile_id: string | null;
          webauthn_challenge_created_at: string;
          webauthn_challenge_id: string;
          webauthn_challenge_value: string;
        };
        Insert: {
          profile_id?: string | null;
          webauthn_challenge_created_at?: string;
          webauthn_challenge_id?: string;
          webauthn_challenge_value: string;
        };
        Update: {
          profile_id?: string | null;
          webauthn_challenge_created_at?: string;
          webauthn_challenge_id?: string;
          webauthn_challenge_value?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webauthn_challenges_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      webauthn_credentials: {
        Row: {
          profile_id: string;
          webauthn_credential_aaguid: string;
          webauthn_credential_backup_state: string;
          webauthn_credential_created_at: string;
          webauthn_credential_device_type: string;
          webauthn_credential_external_id: string;
          webauthn_credential_friendly_name: string | null;
          webauthn_credential_id: string;
          webauthn_credential_last_used_at: string | null;
          webauthn_credential_public_key: string;
          webauthn_credential_sign_count: number;
          webauthn_credential_transports: string[];
          webauthn_credential_type: string;
          webauthn_credential_updated_at: string;
          webauthn_credential_user_verification_status: string;
        };
        Insert: {
          profile_id: string;
          webauthn_credential_aaguid?: string;
          webauthn_credential_backup_state: string;
          webauthn_credential_created_at?: string;
          webauthn_credential_device_type: string;
          webauthn_credential_external_id: string;
          webauthn_credential_friendly_name?: string | null;
          webauthn_credential_id?: string;
          webauthn_credential_last_used_at?: string | null;
          webauthn_credential_public_key: string;
          webauthn_credential_sign_count: number;
          webauthn_credential_transports: string[];
          webauthn_credential_type: string;
          webauthn_credential_updated_at?: string;
          webauthn_credential_user_verification_status: string;
        };
        Update: {
          profile_id?: string;
          webauthn_credential_aaguid?: string;
          webauthn_credential_backup_state?: string;
          webauthn_credential_created_at?: string;
          webauthn_credential_device_type?: string;
          webauthn_credential_external_id?: string;
          webauthn_credential_friendly_name?: string | null;
          webauthn_credential_id?: string;
          webauthn_credential_last_used_at?: string | null;
          webauthn_credential_public_key?: string;
          webauthn_credential_sign_count?: number;
          webauthn_credential_transports?: string[];
          webauthn_credential_type?: string;
          webauthn_credential_updated_at?: string;
          webauthn_credential_user_verification_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webauthn_credentials_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
    };
    Views: {
      tenants_organizations_profiles: {
        Row: {
          organization_created_at: string | null;
          organization_disabled_at: string | null;
          organization_id: number | null;
          organization_member_role: Database["public"]["Enums"]["organization_member_role"] | null;
          organization_name: string | null;
          organization_slug: string | null;
          organization_tenant_id: number | null;
          organization_updated_at: string | null;
          profile_id: string | null;
          tenant_created_at: string | null;
          tenant_disabled_at: string | null;
          tenant_id: number | null;
          tenant_name: string | null;
          tenant_slug: string | null;
          tenant_updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey";
            columns: ["organization_tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["tenant_id"];
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey";
            columns: ["organization_tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["tenant_id"];
          },
        ];
      };
    };
    Functions: {
      email_exists: { Args: { email_to_check: string }; Returns: boolean };
      email_has_passkey: { Args: { email_to_check: string }; Returns: boolean };
      health_current_timestamp: { Args: never; Returns: string };
      phone_exists: {
        Args: { default_code?: string; phone_to_check: string };
        Returns: boolean;
      };
      phone_normalize: {
        Args: { default_code?: string; value: string };
        Returns: string;
      };
      profile_id_by_email: { Args: { email_to_check: string }; Returns: string };
      user_auth_hook: { Args: { event: Json }; Returns: Json };
      viewer_is_concierge: { Args: never; Returns: boolean };
      viewer_organization_by_id: {
        Args: { target_organization_id: number };
        Returns: {
          organization_created_at: string;
          organization_disabled_at: string | null;
          organization_id: number;
          organization_name: string;
          organization_slug: string;
          organization_updated_at: string;
          tenant_id: number;
        };
        SetofOptions: {
          from: "*";
          to: "organizations";
          isOneToOne: true;
          isSetofReturn: true;
        };
      };
      viewer_organization_ids: {
        Args: {
          required_roles?: Database["public"]["Enums"]["organization_member_role"][];
        };
        Returns: number[];
      };
      viewer_organization_validate: {
        Args: {
          required_roles?: Database["public"]["Enums"]["organization_member_role"][];
          target_organization_id: number;
        };
        Returns: boolean;
      };
      viewer_organizations: {
        Args: never;
        Returns: {
          organization_created_at: string;
          organization_disabled_at: string | null;
          organization_id: number;
          organization_name: string;
          organization_slug: string;
          organization_updated_at: string;
          tenant_id: number;
        }[];
        SetofOptions: {
          from: "*";
          to: "organizations";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      viewer_profile: {
        Args: { strict?: boolean };
        Returns: {
          profile_created_at: string;
          profile_disabled_at: string | null;
          profile_id: string;
          profile_name_full: string | null;
          profile_onboarded_at: string | null;
          profile_updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "profiles";
          isOneToOne: true;
          isSetofReturn: true;
        };
      };
      viewer_profile_id: { Args: { strict?: boolean }; Returns: string };
      viewer_tenant_by_id: {
        Args: { target_tenant_id: number };
        Returns: {
          tenant_created_at: string;
          tenant_disabled_at: string | null;
          tenant_id: number;
          tenant_name: string;
          tenant_slug: string;
          tenant_tier: Database["public"]["Enums"]["tenant_tier"];
          tenant_updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "tenants";
          isOneToOne: true;
          isSetofReturn: true;
        };
      };
      viewer_tenant_ids: { Args: never; Returns: number[] };
      viewer_tenant_validate: {
        Args: { target_tenant_id: number };
        Returns: boolean;
      };
      viewer_tenants: {
        Args: never;
        Returns: {
          tenant_created_at: string;
          tenant_disabled_at: string | null;
          tenant_id: number;
          tenant_name: string;
          tenant_slug: string;
          tenant_tier: Database["public"]["Enums"]["tenant_tier"];
          tenant_updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "tenants";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
    };
    Enums: {
      organization_member_role: "employee" | "manager" | "accountant" | "owner";
      tenant_tier: "free" | "pro" | "enterprise";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      organization_member_role: ["employee", "manager", "accountant", "owner"],
      tenant_tier: ["free", "pro", "enterprise"],
    },
  },
} as const;
