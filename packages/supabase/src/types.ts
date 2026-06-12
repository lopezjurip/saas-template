export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      addresses_level0: {
        Row: {
          address_level0_created_at: string;
          address_level0_disabled_at: string | null;
          address_level0_emoji: string | null;
          address_level0_hidden_at: string | null;
          address_level0_id: string;
          address_level0_name: string;
          address_level0_updated_at: string;
        };
        Insert: {
          address_level0_created_at?: string;
          address_level0_disabled_at?: string | null;
          address_level0_emoji?: string | null;
          address_level0_hidden_at?: string | null;
          address_level0_id: string;
          address_level0_name: string;
          address_level0_updated_at?: string;
        };
        Update: {
          address_level0_created_at?: string;
          address_level0_disabled_at?: string | null;
          address_level0_emoji?: string | null;
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
      agencies: {
        Row: {
          agency_created_at: string;
          agency_disabled_at: string | null;
          agency_id: string;
          agency_name: string;
          agency_slug: string;
          agency_updated_at: string;
        };
        Insert: {
          agency_created_at?: string;
          agency_disabled_at?: string | null;
          agency_id?: string;
          agency_name: string;
          agency_slug: string;
          agency_updated_at?: string;
        };
        Update: {
          agency_created_at?: string;
          agency_disabled_at?: string | null;
          agency_id?: string;
          agency_name?: string;
          agency_slug?: string;
          agency_updated_at?: string;
        };
        Relationships: [];
      };
      agencies_organizations_grants: {
        Row: {
          agencies_organizations_grant_created_at: string;
          agencies_organizations_grant_id: string;
          agency_id: string;
          organization_id: number | null;
          permission_id: string;
        };
        Insert: {
          agencies_organizations_grant_created_at?: string;
          agencies_organizations_grant_id?: string;
          agency_id: string;
          organization_id?: number | null;
          permission_id: string;
        };
        Update: {
          agencies_organizations_grant_created_at?: string;
          agencies_organizations_grant_id?: string;
          agency_id?: string;
          organization_id?: number | null;
          permission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agencies_organizations_grants_agency_id_fkey";
            columns: ["agency_id"];
            isOneToOne: false;
            referencedRelation: "agencies";
            referencedColumns: ["agency_id"];
          },
          {
            foreignKeyName: "agencies_organizations_grants_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "agencies_organizations_grants_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "agencies_organizations_grants_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["permission_id"];
          },
        ];
      };
      agency_memberships: {
        Row: {
          agency_id: string;
          agency_membership_accepted_at: string | null;
          agency_membership_created_at: string;
          agency_membership_id: number;
          agency_membership_rejected_at: string | null;
          agency_membership_revoked_at: string | null;
          agency_membership_updated_at: string;
          profile_id: string;
        };
        Insert: {
          agency_id: string;
          agency_membership_accepted_at?: string | null;
          agency_membership_created_at?: string;
          agency_membership_id?: number;
          agency_membership_rejected_at?: string | null;
          agency_membership_revoked_at?: string | null;
          agency_membership_updated_at?: string;
          profile_id: string;
        };
        Update: {
          agency_id?: string;
          agency_membership_accepted_at?: string | null;
          agency_membership_created_at?: string;
          agency_membership_id?: number;
          agency_membership_rejected_at?: string | null;
          agency_membership_revoked_at?: string | null;
          agency_membership_updated_at?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agency_memberships_agency_id_fkey";
            columns: ["agency_id"];
            isOneToOne: false;
            referencedRelation: "agencies";
            referencedColumns: ["agency_id"];
          },
          {
            foreignKeyName: "agency_memberships_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      organization_membership_permissions: {
        Row: {
          organization_membership_id: number;
          organization_membership_permission_created_at: string;
          permission_id: string;
        };
        Insert: {
          organization_membership_id: number;
          organization_membership_permission_created_at?: string;
          permission_id: string;
        };
        Update: {
          organization_membership_id?: number;
          organization_membership_permission_created_at?: string;
          permission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_membership_permiss_organization_membership_id_fkey";
            columns: ["organization_membership_id"];
            isOneToOne: false;
            referencedRelation: "organization_memberships";
            referencedColumns: ["organization_membership_id"];
          },
          {
            foreignKeyName: "organization_membership_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["permission_id"];
          },
        ];
      };
      organization_memberships: {
        Row: {
          organization_id: number;
          organization_membership_accepted_at: string | null;
          organization_membership_created_at: string;
          organization_membership_id: number;
          organization_membership_invite_address_level0_id: string | null;
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null;
          organization_membership_invite_document_value: string | null;
          organization_membership_invite_email: string | null;
          organization_membership_invite_expires_at: string | null;
          organization_membership_invite_phone: string | null;
          organization_membership_invite_token: string | null;
          organization_membership_rejected_at: string | null;
          organization_membership_revoked_at: string | null;
          organization_membership_updated_at: string;
          profile_id: string | null;
        };
        Insert: {
          organization_id: number;
          organization_membership_accepted_at?: string | null;
          organization_membership_created_at?: string;
          organization_membership_id?: number;
          organization_membership_invite_address_level0_id?: string | null;
          organization_membership_invite_document_kind?:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null;
          organization_membership_invite_document_value?: string | null;
          organization_membership_invite_email?: string | null;
          organization_membership_invite_expires_at?: string | null;
          organization_membership_invite_phone?: string | null;
          organization_membership_invite_token?: string | null;
          organization_membership_rejected_at?: string | null;
          organization_membership_revoked_at?: string | null;
          organization_membership_updated_at?: string;
          profile_id?: string | null;
        };
        Update: {
          organization_id?: number;
          organization_membership_accepted_at?: string | null;
          organization_membership_created_at?: string;
          organization_membership_id?: number;
          organization_membership_invite_address_level0_id?: string | null;
          organization_membership_invite_document_kind?:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null;
          organization_membership_invite_document_value?: string | null;
          organization_membership_invite_email?: string | null;
          organization_membership_invite_expires_at?: string | null;
          organization_membership_invite_phone?: string | null;
          organization_membership_invite_token?: string | null;
          organization_membership_rejected_at?: string | null;
          organization_membership_revoked_at?: string | null;
          organization_membership_updated_at?: string;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "organization_memberships_organization_membership_invite_ad_fkey";
            columns: ["organization_membership_invite_address_level0_id"];
            isOneToOne: false;
            referencedRelation: "addresses_level0";
            referencedColumns: ["address_level0_id"];
          },
          {
            foreignKeyName: "organization_memberships_profile_id_fkey";
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
      permission_presets: {
        Row: {
          organization_id: number | null;
          permission_preset_created_at: string;
          permission_preset_id: number;
          permission_preset_name: string;
          permission_preset_slugs: string[];
          permission_preset_updated_at: string;
        };
        Insert: {
          organization_id?: number | null;
          permission_preset_created_at?: string;
          permission_preset_id?: number;
          permission_preset_name: string;
          permission_preset_slugs: string[];
          permission_preset_updated_at?: string;
        };
        Update: {
          organization_id?: number | null;
          permission_preset_created_at?: string;
          permission_preset_id?: number;
          permission_preset_name?: string;
          permission_preset_slugs?: string[];
          permission_preset_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "permission_presets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["organization_id"];
          },
          {
            foreignKeyName: "permission_presets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "tenants_organizations_profiles";
            referencedColumns: ["organization_id"];
          },
        ];
      };
      permissions: {
        Row: {
          permission_created_at: string;
          permission_description: string | null;
          permission_id: string;
          permission_updated_at: string;
        };
        Insert: {
          permission_created_at?: string;
          permission_description?: string | null;
          permission_id: string;
          permission_updated_at?: string;
        };
        Update: {
          permission_created_at?: string;
          permission_description?: string | null;
          permission_id?: string;
          permission_updated_at?: string;
        };
        Relationships: [];
      };
      profile_identities: {
        Row: {
          address_level0_id: string;
          profile_id: string;
          profile_identity_created_at: string;
          profile_identity_disabled_at: string | null;
          profile_identity_document_kind: Database["public"]["Enums"]["profile_identity_document_kind"];
          profile_identity_document_value: string;
          profile_identity_id: string;
          profile_identity_updated_at: string;
        };
        Insert: {
          address_level0_id: string;
          profile_id: string;
          profile_identity_created_at?: string;
          profile_identity_disabled_at?: string | null;
          profile_identity_document_kind: Database["public"]["Enums"]["profile_identity_document_kind"];
          profile_identity_document_value: string;
          profile_identity_id?: string;
          profile_identity_updated_at?: string;
        };
        Update: {
          address_level0_id?: string;
          profile_id?: string;
          profile_identity_created_at?: string;
          profile_identity_disabled_at?: string | null;
          profile_identity_document_kind?: Database["public"]["Enums"]["profile_identity_document_kind"];
          profile_identity_document_value?: string;
          profile_identity_id?: string;
          profile_identity_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profile_identities_address_level0_id_fkey";
            columns: ["address_level0_id"];
            isOneToOne: false;
            referencedRelation: "addresses_level0";
            referencedColumns: ["address_level0_id"];
          },
          {
            foreignKeyName: "profile_identities_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      profile_webauthn_challenges: {
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
            foreignKeyName: "profile_webauthn_challenges_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
        ];
      };
      profile_webauthn_credentials: {
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
            foreignKeyName: "profile_webauthn_credentials_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
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
      reserved_slugs: {
        Row: {
          reserved_slug: string;
        };
        Insert: {
          reserved_slug: string;
        };
        Update: {
          reserved_slug?: string;
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
    };
    Views: {
      storage_organizations: {
        Row: {
          bucket_id: string | null;
          content_length: number | null;
          created_at: string | null;
          folder: string | null;
          metadata: Json | null;
          mimetype: string | null;
          name: string | null;
          organization_id: number | null;
          src: string | null;
          storage_organization_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          content_length?: never;
          created_at?: string | null;
          folder?: never;
          metadata?: Json | null;
          mimetype?: never;
          name?: string | null;
          organization_id?: never;
          src?: never;
          storage_organization_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          content_length?: never;
          created_at?: string | null;
          folder?: never;
          metadata?: Json | null;
          mimetype?: never;
          name?: string | null;
          organization_id?: never;
          src?: never;
          storage_organization_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      storage_profiles: {
        Row: {
          bucket_id: string | null;
          content_length: number | null;
          created_at: string | null;
          folder: string | null;
          metadata: Json | null;
          mimetype: string | null;
          name: string | null;
          profile_id: string | null;
          src: string | null;
          storage_profile_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          content_length?: never;
          created_at?: string | null;
          folder?: never;
          metadata?: Json | null;
          mimetype?: never;
          name?: string | null;
          profile_id?: never;
          src?: never;
          storage_profile_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          content_length?: never;
          created_at?: string | null;
          folder?: never;
          metadata?: Json | null;
          mimetype?: never;
          name?: string | null;
          profile_id?: never;
          src?: never;
          storage_profile_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      tenants_organizations_profiles: {
        Row: {
          organization_created_at: string | null;
          organization_disabled_at: string | null;
          organization_id: number | null;
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
            foreignKeyName: "organization_memberships_profile_id_fkey";
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
      cl_rut_normalize: { Args: { value: string }; Returns: string };
      cl_rut_validate: { Args: { value: string }; Returns: boolean };
      email_exists: { Args: { email_to_check: string }; Returns: boolean };
      email_has_passkey: { Args: { email_to_check: string }; Returns: boolean };
      email_has_password: { Args: { email_to_check: string }; Returns: boolean };
      health_current_timestamp: { Args: never; Returns: string };
      org_has_other_active_admin: {
        Args: {
          _excluded_organization_membership_id: number;
          _organization_id: number;
        };
        Returns: boolean;
      };
      organization_memberships_pending_by_document: {
        Args: {
          country: string;
          kind: Database["public"]["Enums"]["profile_identity_document_kind"];
          value: string;
        };
        Returns: {
          organization_id: number;
          organization_membership_id: number;
          organization_membership_invite_expires_at: string;
          organization_membership_invite_token: string;
          organization_name: string;
          tenant_id: number;
          tenant_name: string;
          tenant_slug: string;
        }[];
      };
      phone_exists: {
        Args: { default_code?: string; phone_to_check: string };
        Returns: boolean;
      };
      phone_has_passkey: {
        Args: { default_code?: string; phone_to_check: string };
        Returns: boolean;
      };
      phone_has_password: {
        Args: { default_code?: string; phone_to_check: string };
        Returns: boolean;
      };
      phone_normalize: {
        Args: { default_code?: string; value: string };
        Returns: string;
      };
      profile_id_by_email: { Args: { email_to_check: string }; Returns: string };
      profile_identity_resolve: {
        Args: {
          country: string;
          kind: Database["public"]["Enums"]["profile_identity_document_kind"];
          value: string;
        };
        Returns: string;
      };
      revoke_session: { Args: { session_id: string }; Returns: undefined };
      user_auth_hook: { Args: { event: Json }; Returns: Json };
      viewer_agencies: {
        Args: never;
        Returns: {
          agency_created_at: string;
          agency_disabled_at: string | null;
          agency_id: string;
          agency_name: string;
          agency_slug: string;
          agency_updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "agencies";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      viewer_agency_by_id: {
        Args: { agency_id: string };
        Returns: {
          agency_created_at: string;
          agency_disabled_at: string | null;
          agency_id: string;
          agency_name: string;
          agency_slug: string;
          agency_updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "agencies";
          isOneToOne: true;
          isSetofReturn: true;
        };
      };
      viewer_agency_by_slug: {
        Args: { agency_slug: string };
        Returns: {
          agency_created_at: string;
          agency_disabled_at: string | null;
          agency_id: string;
          agency_name: string;
          agency_slug: string;
          agency_updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "agencies";
          isOneToOne: true;
          isSetofReturn: true;
        };
      };
      viewer_agency_ids: { Args: never; Returns: string[] };
      viewer_agency_permission_org_ids: {
        Args: { permission_id: string };
        Returns: number[];
      };
      viewer_agency_tenant_ids: { Args: never; Returns: number[] };
      viewer_has_agency_permission: {
        Args: { organization_id: number; permission_id: string };
        Returns: boolean;
      };
      viewer_has_permission: {
        Args: { organization_id: number; permission_id: string };
        Returns: boolean;
      };
      viewer_is_agency_member: { Args: never; Returns: boolean };
      viewer_organization_by_id: {
        Args: { organization_id: number };
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
      viewer_organization_ids: { Args: never; Returns: number[] };
      viewer_organization_membership_accept: {
        Args: { organization_membership_id: number };
        Returns: {
          organization_id: number;
          organization_membership_accepted_at: string | null;
          organization_membership_created_at: string;
          organization_membership_id: number;
          organization_membership_invite_address_level0_id: string | null;
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null;
          organization_membership_invite_document_value: string | null;
          organization_membership_invite_email: string | null;
          organization_membership_invite_expires_at: string | null;
          organization_membership_invite_phone: string | null;
          organization_membership_invite_token: string | null;
          organization_membership_rejected_at: string | null;
          organization_membership_revoked_at: string | null;
          organization_membership_updated_at: string;
          profile_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      viewer_organization_membership_pending: {
        Args: never;
        Returns: {
          organization_id: number;
          organization_membership_accepted_at: string | null;
          organization_membership_created_at: string;
          organization_membership_id: number;
          organization_membership_invite_address_level0_id: string | null;
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null;
          organization_membership_invite_document_value: string | null;
          organization_membership_invite_email: string | null;
          organization_membership_invite_expires_at: string | null;
          organization_membership_invite_phone: string | null;
          organization_membership_invite_token: string | null;
          organization_membership_rejected_at: string | null;
          organization_membership_revoked_at: string | null;
          organization_membership_updated_at: string;
          profile_id: string | null;
        }[];
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      viewer_organization_membership_permissions: {
        Args: never;
        Returns: {
          organization_id: number;
          permission_id: string;
        }[];
      };
      viewer_organization_membership_reject: {
        Args: { organization_membership_id: number };
        Returns: {
          organization_id: number;
          organization_membership_accepted_at: string | null;
          organization_membership_created_at: string;
          organization_membership_id: number;
          organization_membership_invite_address_level0_id: string | null;
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null;
          organization_membership_invite_document_value: string | null;
          organization_membership_invite_email: string | null;
          organization_membership_invite_expires_at: string | null;
          organization_membership_invite_phone: string | null;
          organization_membership_invite_token: string | null;
          organization_membership_rejected_at: string | null;
          organization_membership_revoked_at: string | null;
          organization_membership_updated_at: string;
          profile_id: string | null;
        };
        SetofOptions: {
          from: "*";
          to: "organization_memberships";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      viewer_organization_validate: {
        Args: { organization_id: number };
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
      viewer_permission_org_ids: {
        Args: { permission_id: string };
        Returns: number[];
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
      viewer_sessions: {
        Args: never;
        Returns: {
          created_at: string;
          id: string;
          ip: string;
          not_after: string;
          refreshed_at: string;
          user_agent: string;
        }[];
      };
      viewer_tenant_by_id: {
        Args: { tenant_id: number };
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
      viewer_tenant_by_slug: {
        Args: { tenant_slug: string };
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
      viewer_tenant_validate: { Args: { tenant_id: number }; Returns: boolean };
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
      profile_identity_document_kind: "nin" | "passport";
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
      profile_identity_document_kind: ["nin", "passport"],
      tenant_tier: ["free", "pro", "enterprise"],
    },
  },
} as const;
