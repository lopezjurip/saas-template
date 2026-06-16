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
      addresses_level0: {
        Row: {
          address_level0_created_at: string
          address_level0_disabled_at: string | null
          address_level0_emoji: string | null
          address_level0_hidden_at: string | null
          address_level0_id: string
          address_level0_name: string
          address_level0_updated_at: string
        }
        Insert: {
          address_level0_created_at?: string
          address_level0_disabled_at?: string | null
          address_level0_emoji?: string | null
          address_level0_hidden_at?: string | null
          address_level0_id: string
          address_level0_name: string
          address_level0_updated_at?: string
        }
        Update: {
          address_level0_created_at?: string
          address_level0_disabled_at?: string | null
          address_level0_emoji?: string | null
          address_level0_hidden_at?: string | null
          address_level0_id?: string
          address_level0_name?: string
          address_level0_updated_at?: string
        }
        Relationships: []
      }
      addresses_level1: {
        Row: {
          address_level0_id: string
          address_level1_created_at: string
          address_level1_disabled_at: string | null
          address_level1_hidden_at: string | null
          address_level1_id: string
          address_level1_name: string
          address_level1_updated_at: string
        }
        Insert: {
          address_level0_id: string
          address_level1_created_at?: string
          address_level1_disabled_at?: string | null
          address_level1_hidden_at?: string | null
          address_level1_id: string
          address_level1_name: string
          address_level1_updated_at?: string
        }
        Update: {
          address_level0_id?: string
          address_level1_created_at?: string
          address_level1_disabled_at?: string | null
          address_level1_hidden_at?: string | null
          address_level1_id?: string
          address_level1_name?: string
          address_level1_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_addresses_level1_addresses_level0"
            columns: ["address_level0_id"]
            isOneToOne: false
            referencedRelation: "addresses_level0"
            referencedColumns: ["address_level0_id"]
          },
        ]
      }
      addresses_level2: {
        Row: {
          address_level0_id: string
          address_level1_id: string
          address_level2_created_at: string
          address_level2_disabled_at: string | null
          address_level2_hidden_at: string | null
          address_level2_id: string
          address_level2_name: string
          address_level2_updated_at: string
        }
        Insert: {
          address_level0_id: string
          address_level1_id: string
          address_level2_created_at?: string
          address_level2_disabled_at?: string | null
          address_level2_hidden_at?: string | null
          address_level2_id: string
          address_level2_name: string
          address_level2_updated_at?: string
        }
        Update: {
          address_level0_id?: string
          address_level1_id?: string
          address_level2_created_at?: string
          address_level2_disabled_at?: string | null
          address_level2_hidden_at?: string | null
          address_level2_id?: string
          address_level2_name?: string
          address_level2_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_addresses_level2_addresses_level1"
            columns: ["address_level0_id", "address_level1_id"]
            isOneToOne: false
            referencedRelation: "addresses_level1"
            referencedColumns: ["address_level0_id", "address_level1_id"]
          },
        ]
      }
      addresses_level3: {
        Row: {
          address_level0_id: string
          address_level1_id: string
          address_level2_id: string
          address_level3_created_at: string
          address_level3_disabled_at: string | null
          address_level3_hidden_at: string | null
          address_level3_id: string
          address_level3_name: string
          address_level3_updated_at: string
        }
        Insert: {
          address_level0_id: string
          address_level1_id: string
          address_level2_id: string
          address_level3_created_at?: string
          address_level3_disabled_at?: string | null
          address_level3_hidden_at?: string | null
          address_level3_id: string
          address_level3_name: string
          address_level3_updated_at?: string
        }
        Update: {
          address_level0_id?: string
          address_level1_id?: string
          address_level2_id?: string
          address_level3_created_at?: string
          address_level3_disabled_at?: string | null
          address_level3_hidden_at?: string | null
          address_level3_id?: string
          address_level3_name?: string
          address_level3_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_addresses_level3_addresses_level2"
            columns: [
              "address_level0_id",
              "address_level1_id",
              "address_level2_id",
            ]
            isOneToOne: false
            referencedRelation: "addresses_level2"
            referencedColumns: [
              "address_level0_id",
              "address_level1_id",
              "address_level2_id",
            ]
          },
        ]
      }
      agencies: {
        Row: {
          agency_created_at: string
          agency_disabled_at: string | null
          agency_id: number
          agency_name: string
          agency_slug: string
          agency_updated_at: string
        }
        Insert: {
          agency_created_at?: string
          agency_disabled_at?: string | null
          agency_id?: number
          agency_name: string
          agency_slug: string
          agency_updated_at?: string
        }
        Update: {
          agency_created_at?: string
          agency_disabled_at?: string | null
          agency_id?: number
          agency_name?: string
          agency_slug?: string
          agency_updated_at?: string
        }
        Relationships: []
      }
      agencies_organizations_grants: {
        Row: {
          agencies_organizations_grant_created_at: string
          agencies_organizations_grant_id: string
          agency_id: number
          organization_id: number | null
          permission_id: string
        }
        Insert: {
          agencies_organizations_grant_created_at?: string
          agencies_organizations_grant_id?: string
          agency_id: number
          organization_id?: number | null
          permission_id: string
        }
        Update: {
          agencies_organizations_grant_created_at?: string
          agencies_organizations_grant_id?: string
          agency_id?: number
          organization_id?: number | null
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agencies_organizations_grants_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agencies_organizations_grants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agencies_organizations_grants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agencies_organizations_grants_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["permission_id"]
          },
        ]
      }
      agency_memberships: {
        Row: {
          agency_id: number
          agency_membership_accepted_at: string | null
          agency_membership_created_at: string
          agency_membership_id: number
          agency_membership_rejected_at: string | null
          agency_membership_revoked_at: string | null
          agency_membership_updated_at: string
          profile_id: string
        }
        Insert: {
          agency_id: number
          agency_membership_accepted_at?: string | null
          agency_membership_created_at?: string
          agency_membership_id?: number
          agency_membership_rejected_at?: string | null
          agency_membership_revoked_at?: string | null
          agency_membership_updated_at?: string
          profile_id: string
        }
        Update: {
          agency_id?: number
          agency_membership_accepted_at?: string | null
          agency_membership_created_at?: string
          agency_membership_id?: number
          agency_membership_rejected_at?: string | null
          agency_membership_revoked_at?: string | null
          agency_membership_updated_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_memberships_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      agent_action_log: {
        Row: {
          action_idempotency_key: string | null
          action_status: string
          agency_id: number | null
          agent_action_created_at: string
          agent_action_log_id: string
          conversation_message_id: string
          organization_id: number | null
          profile_id: string
          tool_input: Json
          tool_name: string
          tool_output: Json | null
        }
        Insert: {
          action_idempotency_key?: string | null
          action_status: string
          agency_id?: number | null
          agent_action_created_at?: string
          agent_action_log_id?: string
          conversation_message_id: string
          organization_id?: number | null
          profile_id: string
          tool_input?: Json
          tool_name: string
          tool_output?: Json | null
        }
        Update: {
          action_idempotency_key?: string | null
          action_status?: string
          agency_id?: number | null
          agent_action_created_at?: string
          agent_action_log_id?: string
          conversation_message_id?: string
          organization_id?: number | null
          profile_id?: string
          tool_input?: Json
          tool_name?: string
          tool_output?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_action_log_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agent_action_log_conversation_message_id_fkey"
            columns: ["conversation_message_id"]
            isOneToOne: false
            referencedRelation: "conversation_messages"
            referencedColumns: ["conversation_message_id"]
          },
          {
            foreignKeyName: "agent_action_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_action_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "agent_action_log_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      conversation_message_deliveries: {
        Row: {
          conversation_message_delivery_id: string
          conversation_message_id: string
          delivery_created_at: string
          delivery_error: string | null
          delivery_sent_at: string | null
          delivery_status: string
          message_channel: Database["public"]["Enums"]["message_channel"]
          provider_message_id: string | null
          reply_token: string | null
        }
        Insert: {
          conversation_message_delivery_id?: string
          conversation_message_id: string
          delivery_created_at?: string
          delivery_error?: string | null
          delivery_sent_at?: string | null
          delivery_status?: string
          message_channel: Database["public"]["Enums"]["message_channel"]
          provider_message_id?: string | null
          reply_token?: string | null
        }
        Update: {
          conversation_message_delivery_id?: string
          conversation_message_id?: string
          delivery_created_at?: string
          delivery_error?: string | null
          delivery_sent_at?: string | null
          delivery_status?: string
          message_channel?: Database["public"]["Enums"]["message_channel"]
          provider_message_id?: string | null
          reply_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_message_deliveries_conversation_message_id_fkey"
            columns: ["conversation_message_id"]
            isOneToOne: false
            referencedRelation: "conversation_messages"
            referencedColumns: ["conversation_message_id"]
          },
        ]
      }
      conversation_messages: {
        Row: {
          conversation_id: string
          conversation_message_id: string
          conversation_topic_slug: string | null
          message_author: string
          message_body: string | null
          message_channel: Database["public"]["Enums"]["message_channel"] | null
          message_created_at: string
          message_direction: string
          message_idempotency_key: string | null
          message_payload: Json
          message_priority:
            | Database["public"]["Enums"]["notification_priority"]
            | null
          message_read_at: string | null
          message_signature_verified: boolean
        }
        Insert: {
          conversation_id: string
          conversation_message_id?: string
          conversation_topic_slug?: string | null
          message_author: string
          message_body?: string | null
          message_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          message_created_at?: string
          message_direction: string
          message_idempotency_key?: string | null
          message_payload?: Json
          message_priority?:
            | Database["public"]["Enums"]["notification_priority"]
            | null
          message_read_at?: string | null
          message_signature_verified?: boolean
        }
        Update: {
          conversation_id?: string
          conversation_message_id?: string
          conversation_topic_slug?: string | null
          message_author?: string
          message_body?: string | null
          message_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          message_created_at?: string
          message_direction?: string
          message_idempotency_key?: string | null
          message_payload?: Json
          message_priority?:
            | Database["public"]["Enums"]["notification_priority"]
            | null
          message_read_at?: string | null
          message_signature_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "conversation_messages_conversation_topic_slug_fkey"
            columns: ["conversation_topic_slug"]
            isOneToOne: false
            referencedRelation: "conversation_topics"
            referencedColumns: ["conversation_topic_slug"]
          },
        ]
      }
      conversation_topics: {
        Row: {
          conversation_topic_created_at: string
          conversation_topic_description: string
          conversation_topic_disabled_at: string | null
          conversation_topic_kind: Database["public"]["Enums"]["notification_kind"]
          conversation_topic_name: string
          conversation_topic_priority: Database["public"]["Enums"]["notification_priority"]
          conversation_topic_slug: string
          conversation_topic_updated_at: string
        }
        Insert: {
          conversation_topic_created_at?: string
          conversation_topic_description: string
          conversation_topic_disabled_at?: string | null
          conversation_topic_kind?: Database["public"]["Enums"]["notification_kind"]
          conversation_topic_name: string
          conversation_topic_priority?: Database["public"]["Enums"]["notification_priority"]
          conversation_topic_slug: string
          conversation_topic_updated_at?: string
        }
        Update: {
          conversation_topic_created_at?: string
          conversation_topic_description?: string
          conversation_topic_disabled_at?: string | null
          conversation_topic_kind?: Database["public"]["Enums"]["notification_kind"]
          conversation_topic_name?: string
          conversation_topic_priority?: Database["public"]["Enums"]["notification_priority"]
          conversation_topic_slug?: string
          conversation_topic_updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agency_id: number | null
          conversation_created_at: string
          conversation_id: string
          conversation_kind: string
          conversation_last_message_at: string
          conversation_resolution: Json | null
          conversation_resolved_at: string | null
          conversation_resolved_channel:
            | Database["public"]["Enums"]["message_channel"]
            | null
          conversation_status: string
          conversation_subject: string | null
          conversation_updated_at: string
          organization_id: number | null
          profile_id: string
          tenant_id: number | null
        }
        Insert: {
          agency_id?: number | null
          conversation_created_at?: string
          conversation_id?: string
          conversation_kind?: string
          conversation_last_message_at?: string
          conversation_resolution?: Json | null
          conversation_resolved_at?: string | null
          conversation_resolved_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          conversation_status?: string
          conversation_subject?: string | null
          conversation_updated_at?: string
          organization_id?: number | null
          profile_id: string
          tenant_id?: number | null
        }
        Update: {
          agency_id?: number | null
          conversation_created_at?: string
          conversation_id?: string
          conversation_kind?: string
          conversation_last_message_at?: string
          conversation_resolution?: Json | null
          conversation_resolved_at?: string | null
          conversation_resolved_channel?:
            | Database["public"]["Enums"]["message_channel"]
            | null
          conversation_status?: string
          conversation_subject?: string | null
          conversation_updated_at?: string
          organization_id?: number | null
          profile_id?: string
          tenant_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      organization_membership_permissions: {
        Row: {
          organization_membership_id: number
          organization_membership_permission_created_at: string
          permission_id: string
        }
        Insert: {
          organization_membership_id: number
          organization_membership_permission_created_at?: string
          permission_id: string
        }
        Update: {
          organization_membership_id?: number
          organization_membership_permission_created_at?: string
          permission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_membership_permiss_organization_membership_id_fkey"
            columns: ["organization_membership_id"]
            isOneToOne: false
            referencedRelation: "organization_memberships"
            referencedColumns: ["organization_membership_id"]
          },
          {
            foreignKeyName: "organization_membership_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["permission_id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          organization_id: number
          organization_membership_accepted_at: string | null
          organization_membership_created_at: string
          organization_membership_id: number
          organization_membership_invite_address_level0_id: string | null
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null
          organization_membership_invite_document_value: string | null
          organization_membership_invite_email: string | null
          organization_membership_invite_expires_at: string | null
          organization_membership_invite_phone: string | null
          organization_membership_invite_token: string | null
          organization_membership_rejected_at: string | null
          organization_membership_revoked_at: string | null
          organization_membership_updated_at: string
          profile_id: string | null
        }
        Insert: {
          organization_id: number
          organization_membership_accepted_at?: string | null
          organization_membership_created_at?: string
          organization_membership_id?: number
          organization_membership_invite_address_level0_id?: string | null
          organization_membership_invite_document_kind?:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null
          organization_membership_invite_document_value?: string | null
          organization_membership_invite_email?: string | null
          organization_membership_invite_expires_at?: string | null
          organization_membership_invite_phone?: string | null
          organization_membership_invite_token?: string | null
          organization_membership_rejected_at?: string | null
          organization_membership_revoked_at?: string | null
          organization_membership_updated_at?: string
          profile_id?: string | null
        }
        Update: {
          organization_id?: number
          organization_membership_accepted_at?: string | null
          organization_membership_created_at?: string
          organization_membership_id?: number
          organization_membership_invite_address_level0_id?: string | null
          organization_membership_invite_document_kind?:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null
          organization_membership_invite_document_value?: string | null
          organization_membership_invite_email?: string | null
          organization_membership_invite_expires_at?: string | null
          organization_membership_invite_phone?: string | null
          organization_membership_invite_token?: string | null
          organization_membership_rejected_at?: string | null
          organization_membership_revoked_at?: string | null
          organization_membership_updated_at?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_membership_invite_ad_fkey"
            columns: ["organization_membership_invite_address_level0_id"]
            isOneToOne: false
            referencedRelation: "addresses_level0"
            referencedColumns: ["address_level0_id"]
          },
          {
            foreignKeyName: "organization_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      organizations: {
        Row: {
          organization_created_at: string
          organization_disabled_at: string | null
          organization_id: number
          organization_name: string
          organization_slug: string
          organization_updated_at: string
          tenant_id: number
        }
        Insert: {
          organization_created_at?: string
          organization_disabled_at?: string | null
          organization_id?: number
          organization_name: string
          organization_slug: string
          organization_updated_at?: string
          tenant_id: number
        }
        Update: {
          organization_created_at?: string
          organization_disabled_at?: string | null
          organization_id?: number
          organization_name?: string
          organization_slug?: string
          organization_updated_at?: string
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      permission_presets: {
        Row: {
          organization_id: number | null
          permission_preset_created_at: string
          permission_preset_id: number
          permission_preset_name: string
          permission_preset_slugs: string[]
          permission_preset_updated_at: string
        }
        Insert: {
          organization_id?: number | null
          permission_preset_created_at?: string
          permission_preset_id?: number
          permission_preset_name: string
          permission_preset_slugs: string[]
          permission_preset_updated_at?: string
        }
        Update: {
          organization_id?: number | null
          permission_preset_created_at?: string
          permission_preset_id?: number
          permission_preset_name?: string
          permission_preset_slugs?: string[]
          permission_preset_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_presets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "permission_presets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      permissions: {
        Row: {
          permission_created_at: string
          permission_description: string | null
          permission_id: string
          permission_updated_at: string
        }
        Insert: {
          permission_created_at?: string
          permission_description?: string | null
          permission_id: string
          permission_updated_at?: string
        }
        Update: {
          permission_created_at?: string
          permission_description?: string | null
          permission_id?: string
          permission_updated_at?: string
        }
        Relationships: []
      }
      profile_contacts: {
        Row: {
          contact_value: string
          contact_verified_at: string | null
          message_channel: Database["public"]["Enums"]["message_channel"]
          profile_contact_created_at: string
          profile_contact_id: string
          profile_contact_updated_at: string
          profile_id: string
        }
        Insert: {
          contact_value: string
          contact_verified_at?: string | null
          message_channel: Database["public"]["Enums"]["message_channel"]
          profile_contact_created_at?: string
          profile_contact_id?: string
          profile_contact_updated_at?: string
          profile_id: string
        }
        Update: {
          contact_value?: string
          contact_verified_at?: string | null
          message_channel?: Database["public"]["Enums"]["message_channel"]
          profile_contact_created_at?: string
          profile_contact_id?: string
          profile_contact_updated_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_contacts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profile_identities: {
        Row: {
          address_level0_id: string
          profile_id: string
          profile_identity_created_at: string
          profile_identity_disabled_at: string | null
          profile_identity_document_kind: Database["public"]["Enums"]["profile_identity_document_kind"]
          profile_identity_document_value: string
          profile_identity_id: string
          profile_identity_updated_at: string
        }
        Insert: {
          address_level0_id: string
          profile_id: string
          profile_identity_created_at?: string
          profile_identity_disabled_at?: string | null
          profile_identity_document_kind: Database["public"]["Enums"]["profile_identity_document_kind"]
          profile_identity_document_value: string
          profile_identity_id?: string
          profile_identity_updated_at?: string
        }
        Update: {
          address_level0_id?: string
          profile_id?: string
          profile_identity_created_at?: string
          profile_identity_disabled_at?: string | null
          profile_identity_document_kind?: Database["public"]["Enums"]["profile_identity_document_kind"]
          profile_identity_document_value?: string
          profile_identity_id?: string
          profile_identity_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_identities_address_level0_id_fkey"
            columns: ["address_level0_id"]
            isOneToOne: false
            referencedRelation: "addresses_level0"
            referencedColumns: ["address_level0_id"]
          },
          {
            foreignKeyName: "profile_identities_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profile_push_subscriptions: {
        Row: {
          auth: string
          endpoint: string
          p256dh: string
          profile_id: string
          profile_push_subscription_created_at: string
          profile_push_subscription_id: string
          profile_push_subscription_updated_at: string
        }
        Insert: {
          auth: string
          endpoint: string
          p256dh: string
          profile_id: string
          profile_push_subscription_created_at?: string
          profile_push_subscription_id?: string
          profile_push_subscription_updated_at?: string
        }
        Update: {
          auth?: string
          endpoint?: string
          p256dh?: string
          profile_id?: string
          profile_push_subscription_created_at?: string
          profile_push_subscription_id?: string
          profile_push_subscription_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_push_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profile_topic_channels: {
        Row: {
          conversation_topic_slug: string
          enabled: boolean
          message_channel: Database["public"]["Enums"]["message_channel"]
          profile_id: string
          profile_topic_channel_created_at: string
          profile_topic_channel_updated_at: string
        }
        Insert: {
          conversation_topic_slug: string
          enabled?: boolean
          message_channel: Database["public"]["Enums"]["message_channel"]
          profile_id: string
          profile_topic_channel_created_at?: string
          profile_topic_channel_updated_at?: string
        }
        Update: {
          conversation_topic_slug?: string
          enabled?: boolean
          message_channel?: Database["public"]["Enums"]["message_channel"]
          profile_id?: string
          profile_topic_channel_created_at?: string
          profile_topic_channel_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_topic_channels_conversation_topic_slug_fkey"
            columns: ["conversation_topic_slug"]
            isOneToOne: false
            referencedRelation: "conversation_topics"
            referencedColumns: ["conversation_topic_slug"]
          },
          {
            foreignKeyName: "profile_topic_channels_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      profiles: {
        Row: {
          profile_created_at: string
          profile_disabled_at: string | null
          profile_id: string
          profile_name_full: string | null
          profile_onboarded_at: string | null
          profile_updated_at: string
        }
        Insert: {
          profile_created_at?: string
          profile_disabled_at?: string | null
          profile_id: string
          profile_name_full?: string | null
          profile_onboarded_at?: string | null
          profile_updated_at?: string
        }
        Update: {
          profile_created_at?: string
          profile_disabled_at?: string | null
          profile_id?: string
          profile_name_full?: string | null
          profile_onboarded_at?: string | null
          profile_updated_at?: string
        }
        Relationships: []
      }
      reserved_slugs: {
        Row: {
          reserved_slug: string
        }
        Insert: {
          reserved_slug: string
        }
        Update: {
          reserved_slug?: string
        }
        Relationships: []
      }
      tenant_domains: {
        Row: {
          domain_created_at: string
          domain_updated_at: string
          domain_value: string
          domain_verified_at: string | null
          tenant_id: number
        }
        Insert: {
          domain_created_at?: string
          domain_updated_at?: string
          domain_value: string
          domain_verified_at?: string | null
          tenant_id: number
        }
        Update: {
          domain_created_at?: string
          domain_updated_at?: string
          domain_value?: string
          domain_verified_at?: string | null
          tenant_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      tenants: {
        Row: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }
        Insert: {
          tenant_created_at?: string
          tenant_disabled_at?: string | null
          tenant_id?: number
          tenant_name: string
          tenant_onboarded_at?: string | null
          tenant_slug: string
          tenant_tier?: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at?: string
        }
        Update: {
          tenant_created_at?: string
          tenant_disabled_at?: string | null
          tenant_id?: number
          tenant_name?: string
          tenant_onboarded_at?: string | null
          tenant_slug?: string
          tenant_tier?: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          assigned_agency_id: number | null
          assigned_profile_id: string | null
          conversation_id: string
          organization_id: number | null
          tenant_id: number
          ticket_claimed_at: string | null
          ticket_created_at: string
          ticket_id: string
          ticket_priority: Database["public"]["Enums"]["notification_priority"]
          ticket_resolved_at: string | null
          ticket_status: Database["public"]["Enums"]["ticket_status"]
          ticket_subject: string
          ticket_updated_at: string
        }
        Insert: {
          assigned_agency_id?: number | null
          assigned_profile_id?: string | null
          conversation_id: string
          organization_id?: number | null
          tenant_id: number
          ticket_claimed_at?: string | null
          ticket_created_at?: string
          ticket_id?: string
          ticket_priority?: Database["public"]["Enums"]["notification_priority"]
          ticket_resolved_at?: string | null
          ticket_status?: Database["public"]["Enums"]["ticket_status"]
          ticket_subject: string
          ticket_updated_at?: string
        }
        Update: {
          assigned_agency_id?: number | null
          assigned_profile_id?: string | null
          conversation_id?: string
          organization_id?: number | null
          tenant_id?: number
          ticket_claimed_at?: string | null
          ticket_created_at?: string
          ticket_id?: string
          ticket_priority?: Database["public"]["Enums"]["notification_priority"]
          ticket_resolved_at?: string | null
          ticket_status?: Database["public"]["Enums"]["ticket_status"]
          ticket_subject?: string
          ticket_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_agency_id_fkey"
            columns: ["assigned_agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "tickets_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "tickets_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
    }
    Views: {
      storage_agencies: {
        Row: {
          agency_id: number | null
          bucket_id: string | null
          content_length: number | null
          created_at: string | null
          folder: string | null
          metadata: Json | null
          mimetype: string | null
          name: string | null
          src: string | null
          storage_agency_id: string | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: never
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          src?: never
          storage_agency_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: never
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          src?: never
          storage_agency_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      storage_organizations: {
        Row: {
          bucket_id: string | null
          content_length: number | null
          created_at: string | null
          folder: string | null
          metadata: Json | null
          mimetype: string | null
          name: string | null
          organization_id: number | null
          src: string | null
          storage_organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          organization_id?: never
          src?: never
          storage_organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          organization_id?: never
          src?: never
          storage_organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      storage_profiles: {
        Row: {
          bucket_id: string | null
          content_length: number | null
          created_at: string | null
          folder: string | null
          metadata: Json | null
          mimetype: string | null
          name: string | null
          profile_id: string | null
          src: string | null
          storage_profile_id: string | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          profile_id?: never
          src?: never
          storage_profile_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          profile_id?: never
          src?: never
          storage_profile_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      storage_tenants: {
        Row: {
          bucket_id: string | null
          content_length: number | null
          created_at: string | null
          folder: string | null
          metadata: Json | null
          mimetype: string | null
          name: string | null
          src: string | null
          storage_tenant_id: string | null
          tenant_id: number | null
          updated_at: string | null
        }
        Insert: {
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          src?: never
          storage_tenant_id?: string | null
          tenant_id?: never
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string | null
          content_length?: never
          created_at?: string | null
          folder?: never
          metadata?: Json | null
          mimetype?: never
          name?: string | null
          src?: never
          storage_tenant_id?: string | null
          tenant_id?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      tenants_organizations_profiles: {
        Row: {
          organization_created_at: string | null
          organization_disabled_at: string | null
          organization_id: number | null
          organization_name: string | null
          organization_slug: string | null
          organization_tenant_id: number | null
          organization_updated_at: string | null
          profile_id: string | null
          tenant_created_at: string | null
          tenant_disabled_at: string | null
          tenant_id: number | null
          tenant_name: string | null
          tenant_slug: string | null
          tenant_updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["organization_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["tenant_id"]
          },
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["organization_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants_organizations_profiles"
            referencedColumns: ["tenant_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string | null
          ip: string | null
          not_after: string | null
          refreshed_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          ip?: never
          not_after?: string | null
          refreshed_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          ip?: never
          not_after?: string | null
          refreshed_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      agency_membership_invite: {
        Args: { agency_id: number; caller_id: string; profile_id: string }
        Returns: number
      }
      agency_membership_respond: {
        Args: { agency_membership_id: number; response: string }
        Returns: number
      }
      agency_membership_update: {
        Args: {
          agency_id: number
          agency_membership_id: number
          caller_id: string
          operation: string
        }
        Returns: number
      }
      agent_action_claim: {
        Args: {
          conversation_message_id: string
          idempotency_key: string
          organization_id?: number
          profile_id: string
          tool_input: Json
          tool_name: string
        }
        Returns: {
          claimed: boolean
          prior_output: Json
          prior_status: string
        }[]
      }
      agent_action_complete: {
        Args: { idempotency_key: string; status: string; tool_output?: Json }
        Returns: undefined
      }
      caller_has_permission: {
        Args: {
          caller_profile_id: string
          organization_id: number
          permission_id: string
        }
        Returns: boolean
      }
      cl_rut_normalize: { Args: { value: string }; Returns: string }
      cl_rut_validate: { Args: { value: string }; Returns: boolean }
      conversation_archive: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      conversation_emit: {
        Args: {
          agency_id?: number
          body?: string
          conversation_id?: string
          organization_id?: number
          payload?: Json
          recipient_profile_id: string
          slug: string
          subject?: string
        }
        Returns: {
          out_conversation_id: string
          out_conversation_message_id: string
        }[]
      }
      conversation_ingest_inbound: {
        Args: {
          body: string
          channel: Database["public"]["Enums"]["message_channel"]
          conversation_id: string
          payload: Json
          profile_id: string
          provider_message_id: string
          signature_verified?: boolean
        }
        Returns: {
          out_agency_id: number
          out_already_resolved: boolean
          out_conversation_id: string
          out_conversation_message_id: string
          out_organization_id: number
          out_profile_id: string
          out_tenant_id: number
        }[]
      }
      conversation_mark_read: {
        Args: { message_ids: string[] }
        Returns: number
      }
      conversation_outbound_archive: {
        Args: { msg_id: number }
        Returns: boolean
      }
      conversation_outbound_delete: {
        Args: { msg_id: number }
        Returns: boolean
      }
      conversation_outbound_read: {
        Args: { qty: number; vt: number }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      conversation_post_user_message: {
        Args: { body: string; conversation_id: string; payload?: Json }
        Returns: string
      }
      conversation_resolve: {
        Args: {
          channel: Database["public"]["Enums"]["message_channel"]
          p_conversation_id: string
          resolution?: Json
        }
        Returns: undefined
      }
      email_exists: { Args: { email_to_check: string }; Returns: boolean }
      email_has_password: { Args: { email_to_check: string }; Returns: boolean }
      health_current_timestamp: { Args: never; Returns: string }
      org_has_other_active_admin: {
        Args: {
          _excluded_organization_membership_id: number
          _organization_id: number
        }
        Returns: boolean
      }
      organization_memberships_pending_by_document: {
        Args: {
          country: string
          kind: Database["public"]["Enums"]["profile_identity_document_kind"]
          value: string
        }
        Returns: {
          organization_id: number
          organization_membership_id: number
          organization_membership_invite_expires_at: string
          organization_membership_invite_token: string
          organization_name: string
          tenant_id: number
          tenant_name: string
          tenant_slug: string
        }[]
      }
      phone_exists: {
        Args: { default_code?: string; phone_to_check: string }
        Returns: boolean
      }
      phone_has_password: {
        Args: { default_code?: string; phone_to_check: string }
        Returns: boolean
      }
      phone_normalize: {
        Args: { default_code?: string; value: string }
        Returns: string
      }
      profile_identity_resolve: {
        Args: {
          country: string
          kind: Database["public"]["Enums"]["profile_identity_document_kind"]
          value: string
        }
        Returns: string
      }
      revoke_session: { Args: { session_id: string }; Returns: undefined }
      ticket_claim: { Args: { p_ticket_id: string }; Returns: undefined }
      ticket_escalate: {
        Args: {
          p_conversation_id: string
          priority?: Database["public"]["Enums"]["notification_priority"]
          subject: string
        }
        Returns: string
      }
      ticket_escalate_as: {
        Args: {
          caller_id: string
          p_conversation_id: string
          priority?: Database["public"]["Enums"]["notification_priority"]
          subject: string
        }
        Returns: string
      }
      ticket_resolve: {
        Args: { p_ticket_id: string; resolution?: Json }
        Returns: undefined
      }
      user_auth_hook: { Args: { event: Json }; Returns: Json }
      viewer_agencies: {
        Args: never
        Returns: {
          agency_created_at: string
          agency_disabled_at: string | null
          agency_id: number
          agency_name: string
          agency_slug: string
          agency_updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "agencies"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_agency_by_id: {
        Args: { agency_id: number }
        Returns: {
          agency_created_at: string
          agency_disabled_at: string | null
          agency_id: number
          agency_name: string
          agency_slug: string
          agency_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "agencies"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_agency_by_slug: {
        Args: { agency_slug: string }
        Returns: {
          agency_created_at: string
          agency_disabled_at: string | null
          agency_id: number
          agency_name: string
          agency_slug: string
          agency_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "agencies"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_agency_create: {
        Args: { agency_name: string; agency_slug: string }
        Returns: {
          agency_created_at: string
          agency_disabled_at: string | null
          agency_id: number
          agency_name: string
          agency_slug: string
          agency_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "agencies"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_agency_ids: { Args: never; Returns: number[] }
      viewer_agency_permission_org_ids: {
        Args: { permission_id: string }
        Returns: number[]
      }
      viewer_agency_team: {
        Args: { agency_id: number }
        Returns: {
          agency_membership_accepted_at: string
          agency_membership_created_at: string
          agency_membership_id: number
          agency_membership_rejected_at: string
          agency_membership_revoked_at: string
          email: string
          profile_id: string
          profile_name_full: string
        }[]
      }
      viewer_agency_tenant_ids: { Args: never; Returns: number[] }
      viewer_conversation_messages: {
        Args: { p_conversation_id: string }
        Returns: {
          conversation_id: string
          conversation_message_id: string
          conversation_topic_slug: string | null
          message_author: string
          message_body: string | null
          message_channel: Database["public"]["Enums"]["message_channel"] | null
          message_created_at: string
          message_direction: string
          message_idempotency_key: string | null
          message_payload: Json
          message_priority:
            | Database["public"]["Enums"]["notification_priority"]
            | null
          message_read_at: string | null
          message_signature_verified: boolean
        }[]
        SetofOptions: {
          from: "*"
          to: "conversation_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_conversations: {
        Args: {
          include_archived?: boolean
          p_agency_id?: number
          p_organization_id?: number
          p_scope?: string
        }
        Returns: {
          agency_id: number | null
          conversation_created_at: string
          conversation_id: string
          conversation_kind: string
          conversation_last_message_at: string
          conversation_resolution: Json | null
          conversation_resolved_at: string | null
          conversation_resolved_channel:
            | Database["public"]["Enums"]["message_channel"]
            | null
          conversation_status: string
          conversation_subject: string | null
          conversation_updated_at: string
          organization_id: number | null
          profile_id: string
          tenant_id: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "conversations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_has_agency_permission: {
        Args: { organization_id: number; permission_id: string }
        Returns: boolean
      }
      viewer_has_permission: {
        Args: { organization_id: number; permission_id: string }
        Returns: boolean
      }
      viewer_has_tenant_permission: {
        Args: { permission_id: string; tenant_id: number }
        Returns: boolean
      }
      viewer_is_agency_member: { Args: never; Returns: boolean }
      viewer_organization_by_id: {
        Args: { organization_id: number }
        Returns: {
          organization_created_at: string
          organization_disabled_at: string | null
          organization_id: number
          organization_name: string
          organization_slug: string
          organization_updated_at: string
          tenant_id: number
        }
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_organization_create: {
        Args: {
          organization_name: string
          organization_slug: string
          tenant_id: number
        }
        Returns: {
          organization_created_at: string
          organization_disabled_at: string | null
          organization_id: number
          organization_name: string
          organization_slug: string
          organization_updated_at: string
          tenant_id: number
        }
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_organization_external_agencies: {
        Args: { organization_id: number }
        Returns: {
          active_affiliates: number
          agency_id: number
          agency_name: string
          agency_slug: string
          granted_here: boolean
          is_global: boolean
        }[]
      }
      viewer_organization_ids: { Args: never; Returns: number[] }
      viewer_organization_membership_accept: {
        Args: { organization_membership_id: number }
        Returns: {
          organization_id: number
          organization_membership_accepted_at: string | null
          organization_membership_created_at: string
          organization_membership_id: number
          organization_membership_invite_address_level0_id: string | null
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null
          organization_membership_invite_document_value: string | null
          organization_membership_invite_email: string | null
          organization_membership_invite_expires_at: string | null
          organization_membership_invite_phone: string | null
          organization_membership_invite_token: string | null
          organization_membership_rejected_at: string | null
          organization_membership_revoked_at: string | null
          organization_membership_updated_at: string
          profile_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "organization_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      viewer_organization_membership_pending: {
        Args: never
        Returns: {
          organization_id: number
          organization_membership_accepted_at: string | null
          organization_membership_created_at: string
          organization_membership_id: number
          organization_membership_invite_address_level0_id: string | null
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null
          organization_membership_invite_document_value: string | null
          organization_membership_invite_email: string | null
          organization_membership_invite_expires_at: string | null
          organization_membership_invite_phone: string | null
          organization_membership_invite_token: string | null
          organization_membership_rejected_at: string | null
          organization_membership_revoked_at: string | null
          organization_membership_updated_at: string
          profile_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "organization_memberships"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_organization_membership_permissions: {
        Args: never
        Returns: {
          organization_id: number
          permission_id: string
        }[]
      }
      viewer_organization_membership_reject: {
        Args: { organization_membership_id: number }
        Returns: {
          organization_id: number
          organization_membership_accepted_at: string | null
          organization_membership_created_at: string
          organization_membership_id: number
          organization_membership_invite_address_level0_id: string | null
          organization_membership_invite_document_kind:
            | Database["public"]["Enums"]["profile_identity_document_kind"]
            | null
          organization_membership_invite_document_value: string | null
          organization_membership_invite_email: string | null
          organization_membership_invite_expires_at: string | null
          organization_membership_invite_phone: string | null
          organization_membership_invite_token: string | null
          organization_membership_rejected_at: string | null
          organization_membership_revoked_at: string | null
          organization_membership_updated_at: string
          profile_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "organization_memberships"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      viewer_organization_validate: {
        Args: { organization_id: number }
        Returns: boolean
      }
      viewer_organizations: {
        Args: never
        Returns: {
          organization_created_at: string
          organization_disabled_at: string | null
          organization_id: number
          organization_name: string
          organization_slug: string
          organization_updated_at: string
          tenant_id: number
        }[]
        SetofOptions: {
          from: "*"
          to: "organizations"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_permission_org_ids: {
        Args: { permission_id: string }
        Returns: number[]
      }
      viewer_permission_tenant_ids: {
        Args: { permission_id: string }
        Returns: number[]
      }
      viewer_profile: {
        Args: { strict?: boolean }
        Returns: {
          profile_created_at: string
          profile_disabled_at: string | null
          profile_id: string
          profile_name_full: string | null
          profile_onboarded_at: string | null
          profile_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_profile_id: { Args: { strict?: boolean }; Returns: string }
      viewer_sessions: {
        Args: never
        Returns: {
          created_at: string | null
          id: string | null
          ip: string | null
          not_after: string | null
          refreshed_at: string | null
          user_agent: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "user_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_tenant_by_id: {
        Args: { tenant_id: number }
        Returns: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_tenant_by_slug: {
        Args: { tenant_slug: string }
        Returns: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_tenant_create: {
        Args: { tenant_name: string; tenant_slug: string }
        Returns: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_tenant_ids: { Args: never; Returns: number[] }
      viewer_tenant_onboarding_finish: {
        Args: { tenant_id: number }
        Returns: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_tenant_update: {
        Args: { tenant_id: number; tenant_name: string }
        Returns: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: true
          isSetofReturn: true
        }
      }
      viewer_tenant_validate: { Args: { tenant_id: number }; Returns: boolean }
      viewer_tenants: {
        Args: never
        Returns: {
          tenant_created_at: string
          tenant_disabled_at: string | null
          tenant_id: number
          tenant_name: string
          tenant_onboarded_at: string | null
          tenant_slug: string
          tenant_tier: Database["public"]["Enums"]["tenant_tier"]
          tenant_updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "tenants"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      viewer_unread_count: {
        Args: {
          p_agency_id?: number
          p_organization_id?: number
          p_scope?: string
        }
        Returns: number
      }
    }
    Enums: {
      message_channel: "in_app" | "email" | "web_push" | "whatsapp" | "sms"
      notification_kind: "info" | "warn" | "fatal" | "error" | "debug" | "log"
      notification_priority: "low" | "medium" | "high" | "critical"
      profile_identity_document_kind: "nin" | "passport"
      tenant_tier: "free" | "pro" | "enterprise"
      ticket_status: "open" | "claimed" | "in_progress" | "resolved" | "closed"
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
      message_channel: ["in_app", "email", "web_push", "whatsapp", "sms"],
      notification_kind: ["info", "warn", "fatal", "error", "debug", "log"],
      notification_priority: ["low", "medium", "high", "critical"],
      profile_identity_document_kind: ["nin", "passport"],
      tenant_tier: ["free", "pro", "enterprise"],
      ticket_status: ["open", "claimed", "in_progress", "resolved", "closed"],
    },
  },
} as const

