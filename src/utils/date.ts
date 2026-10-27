// 日期一律按 UTC 取年月日，这样 frontmatter 里写的是几号就显示几号

const pad = (n: number) => String(n).padStart(2, '0');

export const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export function ymd(d: Date, sep = '-') {
  return [d.getUTCFullYear(), pad(d.getUTCMonth() + 1), pad(d.getUTCDate())].join(sep);
}

export function hm(d: Date) {
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function formatNumber(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// 从 YYYY-MM-DD 那天到今天是第几天，按访客本地时间算，当天算第 1 天
export function daysSince(day: string) {
  const start = new Date(`${day}T00:00:00`).getTime();
  return Math.max(1, Math.floor((Date.now() - start) / 86400000) + 1);
}
