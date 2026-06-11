import axios from 'axios';

import type { Wishlist, WishlistFormValues } from '../types/wishlist';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchWishlists(
  colorScheme?: string,
  priority?: number,
): Promise<Wishlist[]> {
  const params: Record<string, string | number> = {};
  if (colorScheme) params.color_scheme = colorScheme;
  if (priority !== undefined) params.priority = priority;
  const { data } = await client.get<Wishlist[]>('/wishlists', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return data;
}

export async function fetchWishlist(id: number): Promise<Wishlist> {
  const { data } = await client.get<Wishlist>(`/wishlists/${id}`);
  return data;
}

export async function createWishlist(
  payload: WishlistFormValues,
): Promise<Wishlist> {
  const { data } = await client.post<Wishlist>('/wishlists', payload);
  return data;
}

export async function updateWishlist(
  id: number,
  payload: WishlistFormValues,
): Promise<Wishlist> {
  const { data } = await client.put<Wishlist>(`/wishlists/${id}`, payload);
  return data;
}

export async function deleteWishlist(id: number): Promise<void> {
  await client.delete(`/wishlists/${id}`);
}
