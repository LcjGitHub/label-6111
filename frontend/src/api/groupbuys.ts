import axios from 'axios';

import type { GroupBuy, GroupBuyFormValues } from '../types/groupbuy';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function fetchGroupBuys(
  status?: string,
  productName?: string,
): Promise<GroupBuy[]> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (productName) params.product_name = productName;
  const { data } = await client.get<GroupBuy[]>('/groupbuys', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
  return data;
}

export async function fetchGroupBuy(id: number): Promise<GroupBuy> {
  const { data } = await client.get<GroupBuy>(`/groupbuys/${id}`);
  return data;
}

export async function createGroupBuy(
  payload: GroupBuyFormValues,
): Promise<GroupBuy> {
  const { data } = await client.post<GroupBuy>('/groupbuys', payload);
  return data;
}

export async function updateGroupBuy(
  id: number,
  payload: GroupBuyFormValues,
): Promise<GroupBuy> {
  const { data } = await client.put<GroupBuy>(`/groupbuys/${id}`, payload);
  return data;
}

export async function deleteGroupBuy(id: number): Promise<void> {
  await client.delete(`/groupbuys/${id}`);
}
