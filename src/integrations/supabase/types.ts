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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bd_catalogo_entidades: {
        Row: {
          cod_entidad: string
          entidad: string | null
          updated_at: string
        }
        Insert: {
          cod_entidad: string
          entidad?: string | null
          updated_at?: string
        }
        Update: {
          cod_entidad?: string
          entidad?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bd_catalogo_indicadores: {
        Row: {
          cod_indicador: string
          dimension: string | null
          fuente: string | null
          indicador: string | null
          periodicidad: string | null
          seccion: string | null
          unidad_medida: string | null
          updated_at: string
        }
        Insert: {
          cod_indicador: string
          dimension?: string | null
          fuente?: string | null
          indicador?: string | null
          periodicidad?: string | null
          seccion?: string | null
          unidad_medida?: string | null
          updated_at?: string
        }
        Update: {
          cod_indicador?: string
          dimension?: string | null
          fuente?: string | null
          indicador?: string | null
          periodicidad?: string | null
          seccion?: string | null
          unidad_medida?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bd_datos_cache: {
        Row: {
          anio: number | null
          categoria: string | null
          categoria_2: string | null
          cod_entidad: string
          cod_indicador: string
          created_at: string
          fecha_actualizacion: string | null
          id: number
          valor: number | null
        }
        Insert: {
          anio?: number | null
          categoria?: string | null
          categoria_2?: string | null
          cod_entidad: string
          cod_indicador: string
          created_at?: string
          fecha_actualizacion?: string | null
          id?: number
          valor?: number | null
        }
        Update: {
          anio?: number | null
          categoria?: string | null
          categoria_2?: string | null
          cod_entidad?: string
          cod_indicador?: string
          created_at?: string
          fecha_actualizacion?: string | null
          id?: number
          valor?: number | null
        }
        Relationships: []
      }
      bd_sync_meta: {
        Row: {
          error_message: string | null
          id: number
          last_file_id: string | null
          last_file_name: string | null
          last_sync_at: string | null
          rows_ingested: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          error_message?: string | null
          id?: number
          last_file_id?: string | null
          last_file_name?: string | null
          last_sync_at?: string | null
          rows_ingested?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          error_message?: string | null
          id?: number
          last_file_id?: string | null
          last_file_name?: string | null
          last_sync_at?: string | null
          rows_ingested?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          categoria: string | null
          color: string | null
          created_at: string
          description: string | null
          end_date: string | null
          hora: string | null
          id: string
          lugar: string | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          hora?: string | null
          id?: string
          lugar?: string | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          hora?: string | null
          id?: string
          lugar?: string | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dama_catalog: {
        Row: {
          cod_indicador: string
          created_at: string
          dimension: string | null
          fuente: string | null
          indicador: string
          periodicidad: string | null
          seccion: string | null
          unidad_medida: string | null
          updated_at: string
        }
        Insert: {
          cod_indicador: string
          created_at?: string
          dimension?: string | null
          fuente?: string | null
          indicador: string
          periodicidad?: string | null
          seccion?: string | null
          unidad_medida?: string | null
          updated_at?: string
        }
        Update: {
          cod_indicador?: string
          created_at?: string
          dimension?: string | null
          fuente?: string | null
          indicador?: string
          periodicidad?: string | null
          seccion?: string | null
          unidad_medida?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dama_data: {
        Row: {
          anio: number
          categoria: string | null
          categoria_2: string | null
          cod_entidad: string
          cod_indicador: string
          created_at: string
          fecha_actualizacion: string | null
          id: string
          updated_at: string
          valor: number | null
        }
        Insert: {
          anio: number
          categoria?: string | null
          categoria_2?: string | null
          cod_entidad: string
          cod_indicador: string
          created_at?: string
          fecha_actualizacion?: string | null
          id?: string
          updated_at?: string
          valor?: number | null
        }
        Update: {
          anio?: number
          categoria?: string | null
          categoria_2?: string | null
          cod_entidad?: string
          cod_indicador?: string
          created_at?: string
          fecha_actualizacion?: string | null
          id?: string
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      dama_entities: {
        Row: {
          cod_entidad: string
          created_at: string
          entidad: string
          updated_at: string
        }
        Insert: {
          cod_entidad: string
          created_at?: string
          entidad: string
          updated_at?: string
        }
        Update: {
          cod_entidad?: string
          created_at?: string
          entidad?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category_id: string | null
          created_at: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "document_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      eap_historical_indicators: {
        Row: {
          created_at: string
          id: string
          indicator_name: string
          updated_at: string
          value: number | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_name: string
          updated_at?: string
          value?: number | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          indicator_name?: string
          updated_at?: string
          value?: number | null
          year?: number
        }
        Relationships: []
      }
      education_beneficiaries: {
        Row: {
          categoria: string | null
          created_at: string
          departamento: string
          id: string
          programa: string
          updated_at: string
          valor: number | null
          year: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          departamento: string
          id?: string
          programa: string
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          departamento?: string
          id?: string
          programa?: string
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Relationships: []
      }
      education_indicators: {
        Row: {
          categoria: string | null
          categoria_2: string | null
          categoria_3: string | null
          created_at: string
          cumplimiento: number | null
          departamento: string | null
          descripcion: string | null
          id: string
          indicador: string
          meta: number | null
          municipio: string | null
          seccion: string
          unidad: string | null
          updated_at: string
          valor: number | null
          year: number
        }
        Insert: {
          categoria?: string | null
          categoria_2?: string | null
          categoria_3?: string | null
          created_at?: string
          cumplimiento?: number | null
          departamento?: string | null
          descripcion?: string | null
          id?: string
          indicador: string
          meta?: number | null
          municipio?: string | null
          seccion: string
          unidad?: string | null
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Update: {
          categoria?: string | null
          categoria_2?: string | null
          categoria_3?: string | null
          created_at?: string
          cumplimiento?: number | null
          departamento?: string | null
          descripcion?: string | null
          id?: string
          indicador?: string
          meta?: number | null
          municipio?: string | null
          seccion?: string
          unidad?: string | null
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Relationships: []
      }
      entrepreneurship_indicators: {
        Row: {
          created_at: string
          id: string
          indicator_name: string
          updated_at: string
          value: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicator_name: string
          updated_at?: string
          value: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          indicator_name?: string
          updated_at?: string
          value?: number
          year?: number
        }
        Relationships: []
      }
      financial_execution_monthly: {
        Row: {
          category: string
          created_at: string
          executed: number
          execution_percentage: number
          id: string
          is_parent: boolean
          month: number
          month_name: string
          parent_category: string | null
          pending: number
          project_name: string
          reference_date: string
          saldo_inicial: number
          updated_at: string
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          executed?: number
          execution_percentage?: number
          id?: string
          is_parent?: boolean
          month: number
          month_name: string
          parent_category?: string | null
          pending?: number
          project_name: string
          reference_date: string
          saldo_inicial?: number
          updated_at?: string
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          executed?: number
          execution_percentage?: number
          id?: string
          is_parent?: boolean
          month?: number
          month_name?: string
          parent_category?: string | null
          pending?: number
          project_name?: string
          reference_date?: string
          saldo_inicial?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      library_publications: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          display_order: number | null
          external_url: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_order?: number | null
          external_url: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          display_order?: number | null
          external_url?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      map_locations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      mcv_indicators: {
        Row: {
          base: string | null
          categoria: string | null
          cod_entidad: string | null
          cod_indicador: string
          created_at: string
          dato: number | null
          entidad: string
          fuente: string | null
          id: string
          indicador: string
          mes_trimestre: string | null
          periodicidad: string | null
          seccion: string
          unidad_medida: string | null
          updated_at: string
          year: number
        }
        Insert: {
          base?: string | null
          categoria?: string | null
          cod_entidad?: string | null
          cod_indicador: string
          created_at?: string
          dato?: number | null
          entidad: string
          fuente?: string | null
          id?: string
          indicador: string
          mes_trimestre?: string | null
          periodicidad?: string | null
          seccion: string
          unidad_medida?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          base?: string | null
          categoria?: string | null
          cod_entidad?: string | null
          cod_indicador?: string
          created_at?: string
          dato?: number | null
          entidad?: string
          fuente?: string | null
          id?: string
          indicador?: string
          mes_trimestre?: string | null
          periodicidad?: string | null
          seccion?: string
          unidad_medida?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      operating_expenses_monthly: {
        Row: {
          budget: number
          category: string
          created_at: string
          difference: number
          display_order: number | null
          executed: number
          execution_percentage: number
          id: string
          is_parent: boolean
          item_name: string
          month: number
          month_name: string
          parent_category: string | null
          reference_date: string
          subcategory: string | null
          updated_at: string
          year: number
        }
        Insert: {
          budget?: number
          category: string
          created_at?: string
          difference?: number
          display_order?: number | null
          executed?: number
          execution_percentage?: number
          id?: string
          is_parent?: boolean
          item_name: string
          month: number
          month_name: string
          parent_category?: string | null
          reference_date: string
          subcategory?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          budget?: number
          category?: string
          created_at?: string
          difference?: number
          display_order?: number | null
          executed?: number
          execution_percentage?: number
          id?: string
          is_parent?: boolean
          item_name?: string
          month?: number
          month_name?: string
          parent_category?: string | null
          reference_date?: string
          subcategory?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      participants: {
        Row: {
          base: string
          categoria: string | null
          cod_entidad: string | null
          created_at: string
          departamento: string
          entidad: string | null
          id: string
          programa: string
          seccion: string
          updated_at: string
          valor: number | null
          year: number
        }
        Insert: {
          base: string
          categoria?: string | null
          cod_entidad?: string | null
          created_at?: string
          departamento: string
          entidad?: string | null
          id?: string
          programa: string
          seccion: string
          updated_at?: string
          valor?: number | null
          year: number
        }
        Update: {
          base?: string
          categoria?: string | null
          cod_entidad?: string | null
          created_at?: string
          departamento?: string
          entidad?: string | null
          id?: string
          programa?: string
          seccion?: string
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rural_beneficiaries: {
        Row: {
          base: string | null
          categoria: string | null
          cod_entidad: string | null
          created_at: string
          departamento: string | null
          entidad: string | null
          id: string
          programa: string | null
          seccion: string
          updated_at: string
          valor: number | null
          year: number
        }
        Insert: {
          base?: string | null
          categoria?: string | null
          cod_entidad?: string | null
          created_at?: string
          departamento?: string | null
          entidad?: string | null
          id?: string
          programa?: string | null
          seccion: string
          updated_at?: string
          valor?: number | null
          year: number
        }
        Update: {
          base?: string | null
          categoria?: string | null
          cod_entidad?: string | null
          created_at?: string
          departamento?: string | null
          entidad?: string | null
          id?: string
          programa?: string | null
          seccion?: string
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Relationships: []
      }
      rural_development_indicators: {
        Row: {
          categoria: string | null
          created_at: string
          cumplimiento: number | null
          id: string
          indicador: string
          meta: number | null
          seccion: string
          unidad_medida: string | null
          updated_at: string
          valor: number | null
          year: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          cumplimiento?: number | null
          id?: string
          indicador: string
          meta?: number | null
          seccion: string
          unidad_medida?: string | null
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          cumplimiento?: number | null
          id?: string
          indicador?: string
          meta?: number | null
          seccion?: string
          unidad_medida?: string | null
          updated_at?: string
          valor?: number | null
          year?: number
        }
        Relationships: []
      }
      social_investment: {
        Row: {
          budget_2025: number
          category: string
          created_at: string
          executed: number
          execution_percentage: number
          id: string
          is_parent: boolean
          parent_category: string | null
          pending: number
          project_name: string
          updated_at: string
        }
        Insert: {
          budget_2025: number
          category: string
          created_at?: string
          executed?: number
          execution_percentage?: number
          id?: string
          is_parent?: boolean
          parent_category?: string | null
          pending?: number
          project_name: string
          updated_at?: string
        }
        Update: {
          budget_2025?: number
          category?: string
          created_at?: string
          executed?: number
          execution_percentage?: number
          id?: string
          is_parent?: boolean
          parent_category?: string | null
          pending?: number
          project_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_investment_historical: {
        Row: {
          created_at: string
          id: string
          tipo: string
          updated_at: string
          valor: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          tipo: string
          updated_at?: string
          valor?: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          tipo?: string
          updated_at?: string
          valor?: number
          year?: number
        }
        Relationships: []
      }
      special_projects_indicators: {
        Row: {
          base: string | null
          categoria: string
          cod_entidad: string | null
          cod_indicador: string
          created_at: string
          dato: number | null
          entidad: string | null
          fuente: string | null
          id: string
          indicador: string
          mes_trimestre: string | null
          periodicidad: string | null
          seccion: string
          unidad_medida: string | null
          updated_at: string
          year: number
        }
        Insert: {
          base?: string | null
          categoria: string
          cod_entidad?: string | null
          cod_indicador: string
          created_at?: string
          dato?: number | null
          entidad?: string | null
          fuente?: string | null
          id?: string
          indicador: string
          mes_trimestre?: string | null
          periodicidad?: string | null
          seccion: string
          unidad_medida?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          base?: string | null
          categoria?: string
          cod_entidad?: string | null
          cod_indicador?: string
          created_at?: string
          dato?: number | null
          entidad?: string | null
          fuente?: string | null
          id?: string
          indicador?: string
          mes_trimestre?: string | null
          periodicidad?: string | null
          seccion?: string
          unidad_medida?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      strategic_indicators: {
        Row: {
          accumulated_percentage: number | null
          accumulated_value: number | null
          achievement_2023: number | null
          achievement_2024: number | null
          achievement_2025: number | null
          annual_goal: number | null
          area: Database["public"]["Enums"]["indicator_area"]
          created_at: string
          id: string
          indicator_name: string
          keyword: string | null
          unit: Database["public"]["Enums"]["indicator_unit"]
          updated_at: string
          year: number
        }
        Insert: {
          accumulated_percentage?: number | null
          accumulated_value?: number | null
          achievement_2023?: number | null
          achievement_2024?: number | null
          achievement_2025?: number | null
          annual_goal?: number | null
          area: Database["public"]["Enums"]["indicator_area"]
          created_at?: string
          id?: string
          indicator_name: string
          keyword?: string | null
          unit: Database["public"]["Enums"]["indicator_unit"]
          updated_at?: string
          year?: number
        }
        Update: {
          accumulated_percentage?: number | null
          accumulated_value?: number | null
          achievement_2023?: number | null
          achievement_2024?: number | null
          achievement_2025?: number | null
          annual_goal?: number | null
          area?: Database["public"]["Enums"]["indicator_area"]
          created_at?: string
          id?: string
          indicator_name?: string
          keyword?: string | null
          unit?: Database["public"]["Enums"]["indicator_unit"]
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      catalogo_entidades: {
        Row: {
          cod_entidad: string | null
          entidad: string | null
        }
        Insert: {
          cod_entidad?: string | null
          entidad?: string | null
        }
        Update: {
          cod_entidad?: string | null
          entidad?: string | null
        }
        Relationships: []
      }
      catalogo_indicadores: {
        Row: {
          cod_indicador: string | null
          dimension: string | null
          fuente: string | null
          indicador: string | null
          periodicidad: string | null
          seccion: string | null
          unidad_medida: string | null
        }
        Insert: {
          cod_indicador?: string | null
          dimension?: string | null
          fuente?: string | null
          indicador?: string | null
          periodicidad?: string | null
          seccion?: string | null
          unidad_medida?: string | null
        }
        Update: {
          cod_indicador?: string | null
          dimension?: string | null
          fuente?: string | null
          indicador?: string | null
          periodicidad?: string | null
          seccion?: string | null
          unidad_medida?: string | null
        }
        Relationships: []
      }
      datos_maestros: {
        Row: {
          anio: number | null
          categoria: string | null
          categoria_2: string | null
          cod_entidad: string | null
          cod_indicador: string | null
          fecha_actualizacion: string | null
          valor: number | null
        }
        Insert: {
          anio?: number | null
          categoria?: string | null
          categoria_2?: string | null
          cod_entidad?: string | null
          cod_indicador?: string | null
          fecha_actualizacion?: string | null
          valor?: number | null
        }
        Update: {
          anio?: number | null
          categoria?: string | null
          categoria_2?: string | null
          cod_entidad?: string | null
          cod_indicador?: string | null
          fecha_actualizacion?: string | null
          valor?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sync_legacy_from_dama: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
      indicator_area:
        | "Educación"
        | "Emprendimiento"
        | "Desarrollo rural"
        | "Proyectos especiales"
        | "Estrategia"
        | "Comunicaciones"
        | "Financiero"
        | "Contexto socioeconómico"
        | "Innovación"
        | "Cooperación"
      indicator_unit: "Porcentaje" | "Unidades" | "Pesos"
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
      app_role: ["admin", "user"],
      indicator_area: [
        "Educación",
        "Emprendimiento",
        "Desarrollo rural",
        "Proyectos especiales",
        "Estrategia",
        "Comunicaciones",
        "Financiero",
        "Contexto socioeconómico",
        "Innovación",
        "Cooperación",
      ],
      indicator_unit: ["Porcentaje", "Unidades", "Pesos"],
    },
  },
} as const
