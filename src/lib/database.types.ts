
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "categories": {
                  Row: {
                    "id": string,"name": string,"type": string,"wallet_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name": string,"type": string,"wallet_id": string
                  }
                  Update: {
                    "id"?: string,"name"?: string,"type"?: string,"wallet_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_wallet_id_fkey"
      columns: ["wallet_id"]
isOneToOne: false
      referencedRelation: "wallets"
      referencedColumns: ["id"]
    }
                  ]
                },"invitations": {
                  Row: {
                    "id": string,"partner_email": string,"partner_name": string,"wallet_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"partner_email": string,"partner_name": string,"wallet_id"?: string | null
                  }
                  Update: {
                    "id"?: string,"partner_email"?: string,"partner_name"?: string,"wallet_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitations_wallet_id_fkey"
      columns: ["wallet_id"]
isOneToOne: true
      referencedRelation: "wallets"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "id": string,"name": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"name"?: string | null
                  }
                  Update: {
                    "id"?: string,"name"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"transactions": {
                  Row: {
                    "amount_minor": number,"category_id": string,"created_at": string,"created_by": string | null,"description": string,"id": string,"occurred_on": string,"wallet_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_minor": number,"category_id": string,"created_at"?: string,"created_by"?: string | null,"description": string,"id"?: string,"occurred_on": string,"wallet_id": string
                  }
                  Update: {
                    "amount_minor"?: number,"category_id"?: string,"created_at"?: string,"created_by"?: string | null,"description"?: string,"id"?: string,"occurred_on"?: string,"wallet_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "transactions_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "transactions_wallet_id_category_id_fkey"
      columns: ["wallet_id","category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["wallet_id","id"]
    },{
      foreignKeyName: "transactions_wallet_id_fkey"
      columns: ["wallet_id"]
isOneToOne: false
      referencedRelation: "wallets"
      referencedColumns: ["id"]
    }
                  ]
                },"wallets": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"owner_id": string,"partner_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"owner_id"?: string,"partner_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"owner_id"?: string,"partner_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wallets_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wallets_partner_id_fkey"
      columns: ["partner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_invitation":
{ Args: { "p_code": string }; Returns: string
                           },
"create_wallet":
{ Args: { "p_owner_name": string,"p_wallet_name": string }; Returns: string
                           },
"find_invitation":
{ Args: { "p_code": string }; Returns: {
              "owner_name": string,"partner_email": string,"partner_has_account": boolean,"partner_name": string,"wallet_name": string
            }[]
                           },
"is_wallet_member":
{ Args: { "p_wallet_id": string }; Returns: boolean
                           },
"is_wallet_owner":
{ Args: { "p_wallet_id": string }; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
