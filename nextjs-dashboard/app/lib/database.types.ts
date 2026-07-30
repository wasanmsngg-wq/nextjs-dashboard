export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { created_at: string; user_id: string };
        Insert: { created_at?: string; user_id: string };
        Update: { created_at?: string; user_id?: string };
        Relationships: [];
      };
      customers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          image_url: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          image_url?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          image_url?: string;
          name?: string;
        };
        Relationships: [];
      };
      guest_imports: {
        Row: { export_id: string; imported_at: string; user_id: string };
        Insert: { export_id: string; imported_at?: string; user_id: string };
        Update: { export_id?: string; imported_at?: string; user_id?: string };
        Relationships: [];
      };
      revenue: {
        Row: { month: string; revenue: number };
        Insert: { month: string; revenue: number };
        Update: { month?: string; revenue?: number };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string;
          display_name: string;
          locale: "en" | "th";
          timezone: string;
          unit_system: "metric" | "us";
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string;
          locale?: "en" | "th";
          timezone?: string;
          unit_system?: "metric" | "us";
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          locale?: "en" | "th";
          timezone?: string;
          unit_system?: "metric" | "us";
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      health_check: { Args: Record<PropertyKey, never>; Returns: Json };
      import_guest_profile: {
        Args: {
          import_display_name: string;
          import_export_id: string;
          import_locale: string;
          import_timezone: string;
          import_unit_system: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
