export type Citizen = {
  id: string;
  display_name: string | null;
  wallet_address: string | null;
  is_ai: boolean;
  territory: string | null;
  sufficiency_floor: string | null;
  nation_state_id: string | null;
  created_at: string;
};

export type NationState = {
  id: string;
  name: string;
  slug: string | null;
  tagline: string | null;
  territory: string | null;
  constitution_hash: string;
  constitution_text: string | null;
  receipt_id: string | null;
  citizen_count: number;
  created_at: string;
};
