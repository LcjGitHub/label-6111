export interface KeyboardBuild {
  id: number;
  keyboard_name: string;
  keycap_id: number;
  keycap_name: string;
  keycap_color_scheme: string;
  install_date: string;
  notes: string | null;
}

export interface KeyboardBuildFormValues {
  keyboard_name: string;
  keycap_id: number;
  install_date: string;
  notes?: string | null;
}
