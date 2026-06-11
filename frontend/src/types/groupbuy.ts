export interface GroupBuy {
  id: number;
  product_name: string;
  brand: string;
  platform: string;
  pre_sale_price: number | null;
  end_date: string;
  status: string;
  notes: string | null;
}

export interface GroupBuyFormValues {
  product_name: string;
  brand: string;
  platform: string;
  pre_sale_price?: number | null;
  end_date: string;
  status: string;
  notes?: string | null;
}

export const GROUPBUY_STATUS_OPTIONS = [
  { value: '待付款', label: '待付款' },
  { value: '已付款', label: '已付款' },
  { value: '已发货', label: '已发货' },
  { value: '已收货', label: '已收货' },
];

export const STATUS_COLORS: Record<string, string> = {
  '待付款': 'warning',
  '已付款': 'processing',
  '已发货': 'blue',
  '已收货': 'success',
};
