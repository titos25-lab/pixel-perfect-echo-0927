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
      user_blocks: {
        Row: { id:string; blocker_id:string; blocked_id:string; created_at:string };
        Insert: { id?:string; blocker_id:string; blocked_id:string; created_at?:string };
        Update: { id?:string; blocker_id?:string; blocked_id?:string; created_at?:string };
        Relationships: [];
      };
      post_comments: {
        Row: { id:string; post_id:string; author_id:string; body:string; created_at:string };
        Insert: { id?:string; post_id:string; author_id:string; body:string; created_at?:string };
        Update: { id?:string; post_id?:string; author_id?:string; body?:string; created_at?:string };
        Relationships: [];
      };
      member_profiles: {
        Row: { user_id:string; display_name:string; age:number|null; gender:string; occupation:string; denomination:string; church_name:string; ministry_area:string; location:string; bio:string; relationship_goal:string; has_children:boolean; children_count:number|null; photo_path:string|null; is_active:boolean; is_verified:boolean; created_at:string; updated_at:string };
        Insert: { user_id:string; display_name?:string; age?:number|null; gender?:string; occupation?:string; denomination?:string; church_name?:string; ministry_area?:string; location?:string; bio?:string; relationship_goal?:string; has_children?:boolean; children_count?:number|null; photo_path?:string|null; is_active?:boolean; is_verified?:boolean; created_at?:string; updated_at?:string };
        Update: { user_id?:string; display_name?:string; age?:number|null; gender?:string; occupation?:string; denomination?:string; church_name?:string; ministry_area?:string; location?:string; bio?:string; relationship_goal?:string; photo_path?:string|null; is_active?:boolean; is_verified?:boolean; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      connection_requests: {
        Row: { id:string; sender_id:string; receiver_id:string; initial_message:string; status:string; accepted_at:string|null; sender_checkin:string|null; receiver_checkin:string|null; checkin_prompted_at:string|null; created_at:string; updated_at:string };
        Insert: { id?:string; sender_id:string; receiver_id:string; initial_message?:string; status?:string; sender_checkin?:string|null; receiver_checkin?:string|null; checkin_prompted_at?:string|null; created_at?:string; updated_at?:string };
        Update: { id?:string; sender_id?:string; receiver_id?:string; initial_message?:string; status?:string; sender_checkin?:string|null; receiver_checkin?:string|null; checkin_prompted_at?:string|null; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      messages: {
        Row: { id:string; request_id:string; sender_id:string; body:string; created_at:string; read_at:string|null };
        Insert: { id?:string; request_id:string; sender_id:string; body:string; created_at?:string; read_at?:string|null };
        Update: { id?:string; request_id?:string; sender_id?:string; body?:string; created_at?:string; read_at?:string|null };
        Relationships: [];
      };
      posts: {
        Row: { id:string; author_id:string; body:string; image_url:string|null; created_at:string; updated_at:string };
        Insert: { id?:string; author_id:string; body:string; image_url?:string|null; created_at?:string; updated_at?:string };
        Update: { id?:string; author_id?:string; body?:string; image_url?:string|null; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      post_likes: {
        Row: { id:string; post_id:string; user_id:string; created_at:string };
        Insert: { id?:string; post_id:string; user_id:string; created_at?:string };
        Update: { id?:string; post_id?:string; user_id?:string; created_at?:string };
        Relationships: [];
      };
      reports: {
        Row: { id:string; reporter_id:string; reported_user_id:string; category:string; details:string; status:string; reviewed_by:string|null; created_at:string; updated_at:string };
        Insert: { id?:string; reporter_id:string; reported_user_id:string; category:string; details?:string; status?:string; reviewed_by?:string|null; created_at?:string; updated_at?:string };
        Update: { id?:string; reporter_id?:string; reported_user_id?:string; category?:string; details?:string; status?:string; reviewed_by?:string|null; created_at?:string; updated_at?:string };
        Relationships: [];
      };
      couple_posts: {
        Row:{id:string;journey_id:string;author_id:string;couple_label:string;body:string;created_at:string};
        Insert:{id?:string;journey_id:string;author_id:string;couple_label?:string;body:string;created_at?:string};
        Update:{id?:string;journey_id?:string;author_id?:string;couple_label?:string;body?:string;created_at?:string};
        Relationships:[];
      };
      couple_journeys: {
        Row: { id:string; initiated_by:string; partner_id:string; status:string; started_at:string|null; created_at:string };
        Insert: { id?:string; initiated_by:string; partner_id:string; status?:string; started_at?:string|null; created_at?:string };
        Update: { id?:string; initiated_by?:string; partner_id?:string; status?:string; started_at?:string|null; created_at?:string };
        Relationships: [];
      };
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
      is_active_couple_journey: { Args: { _journey_id:string }; Returns: boolean }
      submit_connection_checkin: { Args: { _request_id:string; _response:string }; Returns: undefined }
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
