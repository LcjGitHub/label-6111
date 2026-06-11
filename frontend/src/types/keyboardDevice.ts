export interface KeyboardDevice {
  id: number;
  name: string;
  layout: string;
  switch_type: string;
  purchase_date: string;
  notes: string | null;
}

export interface KeyboardDeviceFormValues {
  name: string;
  layout: string;
  switch_type: string;
  purchase_date: string;
  notes?: string | null;
}
