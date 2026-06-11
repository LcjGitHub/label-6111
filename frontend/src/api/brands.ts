import axios from 'axios';

import type { Brand, BrandFormValues } from '../types/brand';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchBrands(name?: string): Promise<Brand[]> {
  const { data } = await client.get<Brand[]>('/brands', {
    params: name ? { name } : undefined,
  });
  return data;
}

export async function fetchBrand(id: number): Promise<Brand> {
  const { data } = await client.get<Brand>(`/brands/${id}`);
  return data;
}

export async function createBrand(payload: BrandFormValues): Promise<Brand> {
  const { data } = await client.post<Brand>('/brands', payload);
  return data;
}

export async function updateBrand(
  id: number,
  payload: BrandFormValues,
): Promise<Brand> {
  const { data } = await client.put<Brand>(`/brands/${id}`, payload);
  return data;
}

export async function deleteBrand(id: number): Promise<void> {
  await client.delete(`/brands/${id}`);
}
