export interface Keycap {
  id: number;
  name: string;
  brand: string;
  color_scheme: string;
  material: string;
  purchase_price: number | null;
  notes: string | null;
}

export interface KeycapFormValues {
  name: string;
  brand: string;
  color_scheme: string;
  material: string;
  purchase_price?: number | null;
  notes?: string | null;
}
