import axios from 'axios';

import type { KeyboardBuild, KeyboardBuildFormValues } from '../types/keyboardBuild';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchKeyboardBuilds(params?: {
  keyboard_name?: string;
  keycap_id?: number;
}): Promise<KeyboardBuild[]> {
  const { data } = await client.get<KeyboardBuild[]>('/keyboard-builds', { params });
  return data;
}

export async function fetchKeyboardBuild(id: number): Promise<KeyboardBuild> {
  const { data } = await client.get<KeyboardBuild>(`/keyboard-builds/${id}`);
  return data;
}

export async function createKeyboardBuild(payload: KeyboardBuildFormValues): Promise<KeyboardBuild> {
  const { data } = await client.post<KeyboardBuild>('/keyboard-builds', payload);
  return data;
}

export async function updateKeyboardBuild(
  id: number,
  payload: KeyboardBuildFormValues,
): Promise<KeyboardBuild> {
  const { data } = await client.put<KeyboardBuild>(`/keyboard-builds/${id}`, payload);
  return data;
}

export async function deleteKeyboardBuild(id: number): Promise<void> {
  await client.delete(`/keyboard-builds/${id}`);
}
