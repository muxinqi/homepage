/** 站点里所有日期都用同一种写法：ISO 风格，不依赖读者的地区设置。 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export function isoDate(date: Date): string {
  return date.toISOString();
}
