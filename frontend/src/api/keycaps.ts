import axios from 'axios';

import type { Keycap, KeycapFormValues } from '../types/keycap';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchKeycaps(colorScheme?: string): Promise<Keycap[]> {
  const { data } = await client.get<Keycap[]>('/keycaps', {
    params: colorScheme ? { color_scheme: colorScheme } : undefined,
  });
  return data;
}

export async function fetchKeycap(id: number): Promise<Keycap> {
  const { data } = await client.get<Keycap>(`/keycaps/${id}`);
  return data;
}

export async function createKeycap(payload: KeycapFormValues): Promise<Keycap> {
  const { data } = await client.post<Keycap>('/keycaps', payload);
  return data;
}

export async function updateKeycap(
  id: number,
  payload: KeycapFormValues,
): Promise<Keycap> {
  const { data } = await client.put<Keycap>(`/keycaps/${id}`, payload);
  return data;
}

export async function deleteKeycap(id: number): Promise<void> {
  await client.delete(`/keycaps/${id}`);
}
