export interface Brand {
  id: number;
  name: string;
  origin: string | null;
  website: string | null;
  notes: string | null;
}

export interface BrandFormValues {
  name: string;
  origin?: string | null;
  website?: string | null;
  notes?: string | null;
}
