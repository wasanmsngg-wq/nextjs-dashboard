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
      exercises: {
        Row: {
          archived_at: string | null;
          category: string;
          created_at: string;
          equipment: string;
          id: string;
          name: string | null;
          name_en: string | null;
          name_th: string | null;
          system_key: string | null;
          tracking_mode: Database["public"]["Enums"]["exercise_tracking_mode"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          archived_at?: string | null;
          category?: string;
          created_at?: string;
          equipment?: string;
          id?: string;
          name?: string | null;
          name_en?: string | null;
          name_th?: string | null;
          system_key?: string | null;
          tracking_mode: Database["public"]["Enums"]["exercise_tracking_mode"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
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
      workout_templates: {
        Row: {
          archived_at: string | null;
          created_at: string;
          id: string;
          name: string;
          notes: string;
          updated_at: string;
          user_id: string;
          version: number;
        };
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          notes?: string;
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["workout_templates"]["Insert"]
        >;
        Relationships: [];
      };
      workout_template_exercises: {
        Row: {
          created_at: string;
          exercise_id: string;
          id: string;
          position: number;
          template_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_id: string;
          id: string;
          position: number;
          template_id: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["workout_template_exercises"]["Insert"]
        >;
        Relationships: [];
      };
      workout_template_sets: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          target_distance_meters: number | null;
          target_duration_seconds: number | null;
          target_load_grams: number | null;
          target_reps: number | null;
          target_rpe: number | null;
          template_exercise_id: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workout_template_sets"]["Row"],
          "created_at"
        > & { created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["workout_template_sets"]["Insert"]
        >;
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          completed_at: string | null;
          id: string;
          notes: string;
          started_at: string;
          status: Database["public"]["Enums"]["workout_session_status"];
          template_id: string | null;
          template_name_snapshot: string | null;
          updated_at: string;
          user_id: string;
          version: number;
        };
        Insert: {
          completed_at?: string | null;
          id?: string;
          notes?: string;
          started_at?: string;
          status?: Database["public"]["Enums"]["workout_session_status"];
          template_id?: string | null;
          template_name_snapshot?: string | null;
          updated_at?: string;
          user_id: string;
          version?: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["workout_sessions"]["Insert"]
        >;
        Relationships: [];
      };
      workout_session_exercises: {
        Row: {
          canceled_at: string | null;
          cancellation_reason: string | null;
          completed: boolean;
          created_at: string;
          exercise_id: string | null;
          exercise_name_snapshot: string;
          id: string;
          position: number;
          session_id: string;
          status: Database["public"]["Enums"]["workout_session_exercise_status"];
          tracking_mode: Database["public"]["Enums"]["exercise_tracking_mode"];
        };
        Insert: Omit<
          Database["public"]["Tables"]["workout_session_exercises"]["Row"],
          "created_at"
        > & { created_at?: string };
        Update: Partial<
          Database["public"]["Tables"]["workout_session_exercises"]["Insert"]
        >;
        Relationships: [];
      };
      workout_sets: {
        Row: {
          completed: boolean;
          created_at: string;
          distance_meters: number | null;
          duration_seconds: number | null;
          elapsed_seconds: number;
          id: string;
          load_grams: number | null;
          notes: string;
          position: number;
          reps: number | null;
          rpe: number | null;
          session_exercise_id: string;
          target_distance_meters: number | null;
          target_duration_seconds: number | null;
          target_load_grams: number | null;
          target_reps: number | null;
          target_rpe: number | null;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["workout_sets"]["Row"],
          "created_at" | "updated_at"
        > & { created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["workout_sets"]["Insert"]>;
        Relationships: [];
      };
      workout_mutations: {
        Row: {
          applied_at: string;
          mutation_id: string;
          resulting_version: number;
          session_id: string | null;
          user_id: string;
        };
        Insert: Database["public"]["Tables"]["workout_mutations"]["Row"];
        Update: Partial<
          Database["public"]["Tables"]["workout_mutations"]["Insert"]
        >;
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
      save_workout_template: {
        Args: {
          requested_exercises: Json;
          requested_name: string;
          requested_notes: string;
          requested_template_id: string;
        };
        Returns: string;
      };
      duplicate_workout_template: {
        Args: {
          requested_name: string;
          requested_template_id: string;
          source_template_id: string;
        };
        Returns: string;
      };
      start_workout: {
        Args: {
          requested_session_id: string;
          requested_template_id?: string | null;
        };
        Returns: string;
      };
      add_workout_exercise: {
        Args: {
          requested_exercise_id: string;
          requested_session_exercise_id: string;
          requested_session_id: string;
          requested_set_ids: string[];
        };
        Returns: boolean;
      };
      remove_workout_exercise: {
        Args: {
          requested_expected_version: number;
          requested_session_exercise_id: string;
          requested_session_id: string;
        };
        Returns: number;
      };
      cancel_workout_exercise: {
        Args: {
          requested_expected_version: number;
          requested_reason: string;
          requested_session_exercise_id: string;
          requested_session_id: string;
        };
        Returns: number;
      };
      save_workout_set: {
        Args: {
          requested_completed: boolean;
          requested_distance_meters: number | null;
          requested_duration_seconds: number | null;
          requested_elapsed_seconds: number;
          requested_expected_version: number;
          requested_load_grams: number | null;
          requested_mutation_id: string;
          requested_notes: string;
          requested_reps: number | null;
          requested_rpe: number | null;
          requested_session_id: string;
          requested_set_id: string;
        };
        Returns: number;
      };
      complete_workout: {
        Args: { requested_mutation_id: string; requested_session_id: string };
        Returns: boolean;
      };
      discard_workout: {
        Args: { requested_session_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      exercise_tracking_mode:
        "reps_load" | "reps" | "duration" | "distance_duration";
      workout_session_status: "in_progress" | "completed";
      workout_session_exercise_status: "active" | "canceled";
    };
    CompositeTypes: Record<string, never>;
  };
};
