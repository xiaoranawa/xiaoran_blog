// 仿 GitHub 默认头像：5x5 左右对称的格子，颜色由字符串哈希决定
// 色相只在蓝、紫、粉之间挑，和站点的主色搭一些，不会冒出荧光绿

export function identicon(seed: string) {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  const hue = 200 + ((Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) % 140);
  const cells: [number, number][] = [];
  for (let i = 0; i < 15; i++) {
    if (((h >>> i) & 1) === 0) continue;
    const col = Math.floor(i / 5);
    const row = i % 5;
    cells.push([col, row]);
    if (col < 2) cells.push([4 - col, row]);
  }
  return { hue, cells };
}
