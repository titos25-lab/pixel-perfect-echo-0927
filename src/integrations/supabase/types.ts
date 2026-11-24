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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      connection_requests: {
        Row: {
          accepted_at: string | null
          checkin_prompted_at: string | null
          created_at: string
          id: string
          initial_message: string
          receiver_checkin: string | null
          receiver_id: string
          sender_checkin: string | null
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          checkin_prompted_at?: string | null
          created_at?: string
          id?: string
          initial_message?: string
          receiver_checkin?: string | null
          receiver_id: string
          sender_checkin?: string | null
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          checkin_prompted_at?: string | null
          created_at?: string
          id?: string
          initial_message?: string
          receiver_checkin?: string | null
          receiver_id?: string
          sender_checkin?: string | null
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_journeys: {
        Row: {
          created_at: string
          id: string
          initiated_by: string
          partner_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          initiated_by: string
          partner_id: string
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          initiated_by?: string
          partner_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_journeys_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_journeys_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_posts: {
        Row: {
          author_id: string
          body: string
          couple_label: string
          created_at: string
          id: string
          journey_id: string
        }
        Insert: {
          author_id: string
          body: string
          couple_label?: string
          created_at?: string
          id?: string
          journey_id: string
        }
        Update: {
          author_id?: string
          body?: string
          couple_label?: string
          created_at?: string
          id?: string
          journey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "couple_posts_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "couple_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      member_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          mime_type: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          mime_type: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          mime_type?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_profiles: {
        Row: {
          age: number | null
          bio: string
          children_count: number | null
          church_name: string
          country: string
          created_at: string
          denomination: string
          display_name: string
          gender: string
          has_children: boolean
          height_cm: number | null
          is_active: boolean
          is_verified: boolean
          location: string
          ministry_area: string
          neighborhood: string
          occupation: string
          photo_path: string | null
          province: string
          relationship_goal: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          bio?: string
          children_count?: number | null
          church_name?: string
          country?: string
          created_at?: string
          denomination?: string
          display_name?: string
          gender?: string
          has_children?: boolean
          height_cm?: number | null
          is_active?: boolean
          is_verified?: boolean
          location?: string
          ministry_area?: string
          neighborhood?: string
          occupation?: string
          photo_path?: string | null
          province?: string
          relationship_goal?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          bio?: string
          children_count?: number | null
          church_name?: string
          country?: string
          created_at?: string
          denomination?: string
          display_name?: string
          gender?: string
          has_children?: boolean
          height_cm?: number | null
          is_active?: boolean
          is_verified?: boolean
          location?: string
          ministry_area?: string
          neighborhood?: string
          occupation?: string
          photo_path?: string | null
          province?: string
          relationship_goal?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          request_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          request_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "connection_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          bio: string
          category: string
          created_at: string
          display_name: string
          featured_until: string | null
          id: string
          is_demo: boolean
          is_featured: boolean
          is_published: boolean
          is_verified: boolean
          location: string
          photo_key: string
          public_phone: string
          specialty: string
          user_id: string | null
        }
        Insert: {
          bio?: string
          category?: string
          created_at?: string
          display_name: string
          featured_until?: string | null
          id?: string
          is_demo?: boolean
          is_featured?: boolean
          is_published?: boolean
          is_verified?: boolean
          location?: string
          photo_key?: string
          public_phone?: string
          specialty?: string
          user_id?: string | null
        }
        Update: {
          bio?: string
          category?: string
          created_at?: string
          display_name?: string
          featured_until?: string | null
          id?: string
          is_demo?: boolean
          is_featured?: boolean
          is_published?: boolean
          is_verified?: boolean
          location?: string
          photo_key?: string
          public_phone?: string
          specialty?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_path: string | null
          created_at: string
          full_name: string
          id: string
          location: string
          phone: string
        }
        Insert: {
          age?: number | null
          avatar_path?: string | null
          created_at?: string
          full_name?: string
          id: string
          location?: string
          phone?: string
        }
        Update: {
          age?: number | null
          avatar_path?: string | null
          created_at?: string
          full_name?: string
          id?: string
          location?: string
          phone?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          category: string
          created_at: string
          details: string
          id: string
          reported_user_id: string
          reporter_id: string
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: string
          id?: string
          reported_user_id: string
          reporter_id: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string
          id?: string
          reported_user_id?: string
          reporter_id?: string
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      choose_account_type: {
        Args: { account_type: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_couple_journey: {
        Args: { _journey_id: string }
        Returns: boolean
      }
      is_blocked_pair: {
        Args: { _first: string; _second: string }
        Returns: boolean
      }
      submit_connection_checkin: {
        Args: { _request_id: string; _response: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "client" | "professional" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["client", "professional", "admin"],
    },
  },
} as const
