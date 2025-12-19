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
  seq_id: number;
};



export type AppConfig = {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
};

export type Tag = {
  id: string;
  name: string;
  created_at: string;
};

export type Review = {
  id: number;
  star: number;
  comment: string | null;
  game_title: string | null;
  manual_stock_no: string | null;
  manual_price: number | null;
  review_date: string | null;
  /**
   * Published status. If false, it's a pending user submission or draft.
   */
  is_published: boolean;
  user_id: string | null;
  user?: {
    username: string;
  } | null;
  created_at: string;
};

export type AssessmentRule = {
  id: string;
  rule_type: 'range' | 'boolean';
  category: string;
  label: string | null;
  threshold: number | null;
  price_adjustment: number;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'>;
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>;
      };
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
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  };
};

