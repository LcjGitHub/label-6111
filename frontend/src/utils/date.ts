import dayjs from 'dayjs';

export function formatDateTime(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
}

export function formatDate(dateStr: string): string {
  return dayjs(dateStr).format('YYYY-MM-DD');
}
