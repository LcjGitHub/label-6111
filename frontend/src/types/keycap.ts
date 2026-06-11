export interface Keycap {
  id: number;
  name: string;
  brand: string;
  color_scheme: string;
  material: string;
  purchase_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  keyboard_build_count: number;
}

export interface KeycapFormValues {
  name: string;
  brand: string;
  color_scheme: string;
  material: string;
  purchase_price?: number | null;
  notes?: string | null;
}

export interface GroupCount {
  name: string;
  count: number;
}

export interface KeycapStats {
  total_count: number;
  total_purchase_price: number;
  avg_purchase_price: number | null;
  priced_count: number;
  by_brand: GroupCount[];
  by_material: GroupCount[];
}
