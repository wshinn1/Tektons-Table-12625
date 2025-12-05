export interface Tenant {
  id: string;
  subdomain: string;
  full_name: string;
  email: string;
  bio?: string;
  profile_image_url?: string;
  mission_organization?: string;
  location?: string;
  ministry_focus?: string;
  primary_color: string;
  language: string;
  referral_code: string;
  referred_by_tenant_id?: string;
  referral_count: number;
  platform_fee_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface SupportTier {
  id: string;
  tenant_id: string;
  name: string;
  amount: number;
  description?: string;
  benefits?: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Supporter {
  id: string;
  tenant_id: string;
  email: string;
  full_name?: string;
  stripe_customer_id?: string;
  total_donated: number;
  is_recurring: boolean;
  recurring_amount?: number;
  last_donation_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  tenant_id: string;
  supporter_id: string;
  stripe_payment_intent_id?: string;
  amount: number;
  platform_fee: number;
  stripe_fee?: number;
  tip_amount: number;
  supporter_covered_stripe_fee: boolean;
  is_recurring: boolean;
  status: string;
  created_at: string;
}
