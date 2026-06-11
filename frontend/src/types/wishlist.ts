export interface Wishlist {
  id: number;
  name: string;
  brand: string;
  color_scheme: string;
  expected_price: number | null;
  priority: number;
  notes: string | null;
}

export interface WishlistFormValues {
  name: string;
  brand: string;
  color_scheme: string;
  expected_price?: number | null;
  priority: number;
  notes?: string | null;
}
