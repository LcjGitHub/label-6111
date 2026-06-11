import axios from 'axios';

import type {
  KeyboardDevice,
  KeyboardDeviceFormValues,
} from '../types/keyboardDevice';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchKeyboardDevices(params?: {
  layout?: string;
  switch_type?: string;
  name?: string;
}): Promise<KeyboardDevice[]> {
  const { data } = await client.get<KeyboardDevice[]>('/keyboard-devices', {
    params,
  });
  return data;
}

export async function fetchKeyboardDevice(id: number): Promise<KeyboardDevice> {
  const { data } = await client.get<KeyboardDevice>(`/keyboard-devices/${id}`);
  return data;
}

export async function createKeyboardDevice(
  payload: KeyboardDeviceFormValues,
): Promise<KeyboardDevice> {
  const { data } = await client.post<KeyboardDevice>(
    '/keyboard-devices',
    payload,
  );
  return data;
}

export async function updateKeyboardDevice(
  id: number,
  payload: KeyboardDeviceFormValues,
): Promise<KeyboardDevice> {
  const { data } = await client.put<KeyboardDevice>(
    `/keyboard-devices/${id}`,
    payload,
  );
  return data;
}

export async function deleteKeyboardDevice(id: number): Promise<void> {
  await client.delete(`/keyboard-devices/${id}`);
}
