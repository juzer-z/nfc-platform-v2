export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Role = "SUPER_ADMIN" | "HR_ADMIN" | "EMPLOYEE";

export type UserRoleRecord = {
  user_id: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileViewRecord = {
  id: string;
  profile_id: string;
  ip_address: string | null;
  user_agent: string | null;
  referer: string | null;
  viewed_at: string;
};

export type ProfileRecord = {
  id: string;
  slug: string;
  full_name: string;
  title: string | null;
  company: string | null;
  department: string | null;
  phone: string | null;
  whatsapp: string | null;
  email_public: string | null;
  website: string | null;
  linkedin: string | null;
  address: string | null;
  map_url: string | null;
  photo_url: string | null;
  company_logo_url: string | null;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRecord;
        Insert: Partial<ProfileRecord>;
        Update: Partial<ProfileRecord>;
        Relationships: [];
      };
      user_roles: {
        Row: UserRoleRecord;
        Insert: Partial<UserRoleRecord>;
        Update: Partial<UserRoleRecord>;
        Relationships: [];
      };
      profile_views: {
        Row: ProfileViewRecord;
        Insert: Partial<ProfileViewRecord>;
        Update: Partial<ProfileViewRecord>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role: Role;
    };
  };
};
