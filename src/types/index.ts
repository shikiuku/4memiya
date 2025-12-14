export type AppUser = {
  id: string;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  status: 'draft' | 'on_sale' | 'sold_out';
  rank: number;
  luck_max: number;
  gacha_charas: number;
  badge_power: number;
  images: string[];
  tags: string[];
  description_points: string | null;
  description_recommend: string | null;
  created_at: string;
  updated_at: string;
};

export type AssessmentRule = {
  id: string;
  category: 'rank' | 'luck' | 'character_bonus';
  threshold_min: number;
  bonus_amount: number;
  character_name: string | null;
  is_active: boolean;
  created_at: string;
};

export type AppConfig = {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      app_users: {
        Row: AppUser;
        Insert: Omit<AppUser, 'id' | 'created_at'>;
        Update: Partial<Omit<AppUser, 'id' | 'created_at'>>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>;
      };
      assessment_rules: {
        Row: AssessmentRule;
        Insert: Omit<AssessmentRule, 'id' | 'created_at'>;
        Update: Partial<Omit<AssessmentRule, 'id' | 'created_at'>>;
      };
      app_config: {
        Row: AppConfig;
        Insert: Omit<AppConfig, 'updated_at'>;
        Update: Partial<Omit<AppConfig, 'updated_at'>>;
      };
    };
  };
};
