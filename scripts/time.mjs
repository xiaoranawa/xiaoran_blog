// 现在的北京时间，拆成「2026-10-27」和「20:12:36」两段，和站点里日期的处理一致
export function beijingNow() {
  const now = new Date(Date.now() + 8 * 3600 * 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    day: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
    time: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`,
  };
}
