export interface Brand {
  id: number;
  name: string;
  origin: string | null;
  website: string | null;
  notes: string | null;
  keycap_count: number;
}

export interface BrandFormValues {
  name: string;
  origin?: string | null;
  website?: string | null;
  notes?: string | null;
}
