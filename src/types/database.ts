// Hand-written to match supabase/migrations/001_initial_schema.sql.
//
// NEEDS REGENERATION once a real Supabase project exists — replace this file
// by running (see docs/SUPABASE_SETUP.md):
//
//   npx supabase gen types typescript --project-id <project-ref> > src/types/database.ts
//
// Until then, keep this file's shape in sync by hand whenever the migration
// changes.

export type UserRole = 'customer' | 'rider' | 'laundry_owner' | 'admin';
export type LaundryApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PricingUnit = 'per_kg' | 'per_item' | 'flat';
export type OrderStatus =
  | 'pending'
  | 'rider_assigned'
  | 'picked_up'
  | 'at_laundry'
  | 'washing'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';
export type PaymentMethodType = 'cash' | 'card' | 'wallet';
export type PaymentStatusType = 'pending' | 'paid' | 'failed' | 'refunded';
export type NotificationType = 'order_update' | 'promotion' | 'system';
export type PreferredLanguage = 'en' | 'km';
export type ThemePreference = 'light' | 'dark';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          preferred_language: PreferredLanguage;
          theme_preference: ThemePreference;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        // No client Insert type: rows are created only by the
        // handle_new_user trigger on auth.users.
        Insert: never;
        Update: Partial<{
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          preferred_language: PreferredLanguage;
          theme_preference: ThemePreference;
        }>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address_line: string;
          delivery_instructions: string | null;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          address_line: string;
          delivery_instructions?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
        };
        Update: Partial<{
          label: string;
          address_line: string;
          delivery_instructions: string | null;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
        }>;
        Relationships: [];
      };
      laundries: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string | null;
          phone: string | null;
          address_line: string | null;
          latitude: number | null;
          longitude: number | null;
          rating_average: number;
          rating_count: number;
          is_open: boolean;
          approval_status: LaundryApprovalStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string | null;
          phone?: string | null;
          address_line?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_open?: boolean;
          approval_status?: LaundryApprovalStatus;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          phone: string | null;
          address_line: string | null;
          latitude: number | null;
          longitude: number | null;
          is_open: boolean;
          approval_status: LaundryApprovalStatus;
        }>;
        Relationships: [];
      };
      laundry_services: {
        Row: {
          id: string;
          laundry_id: string;
          name: string;
          description: string | null;
          price: number;
          pricing_unit: PricingUnit;
          estimated_duration_minutes: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          laundry_id: string;
          name: string;
          description?: string | null;
          price: number;
          pricing_unit?: PricingUnit;
          estimated_duration_minutes?: number | null;
          is_active?: boolean;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          price: number;
          pricing_unit: PricingUnit;
          estimated_duration_minutes: number | null;
          is_active: boolean;
        }>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          laundry_id: string;
          pickup_rider_id: string | null;
          delivery_rider_id: string | null;
          address_label: string | null;
          address_line: string;
          address_latitude: number | null;
          address_longitude: number | null;
          delivery_instructions: string | null;
          status: OrderStatus;
          pickup_scheduled_at: string | null;
          notes: string | null;
          subtotal: number;
          pickup_fee: number;
          delivery_fee: number;
          discount: number;
          total: number;
          payment_method: PaymentMethodType;
          payment_status: PaymentStatusType;
          created_at: string;
          updated_at: string;
        };
        // Not wired into the app in this phase — no client Insert/Update yet.
        Insert: never;
        Update: never;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          service_id: string | null;
          service_name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: OrderStatus;
          changed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          related_order_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: never;
        Update: Partial<{
          is_read: boolean;
        }>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          amount: number;
          method: PaymentMethodType;
          status: PaymentStatusType;
          provider_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          laundry_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          laundry_id: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      set_default_address: {
        Args: { p_address_id: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      laundry_approval_status: LaundryApprovalStatus;
      pricing_unit: PricingUnit;
      order_status: OrderStatus;
      payment_method_type: PaymentMethodType;
      payment_status_type: PaymentStatusType;
      notification_type: NotificationType;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type AddressRow = Database['public']['Tables']['addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
export type AddressUpdate = Database['public']['Tables']['addresses']['Update'];
export type LaundryRow = Database['public']['Tables']['laundries']['Row'];
export type LaundryServiceRow = Database['public']['Tables']['laundry_services']['Row'];
