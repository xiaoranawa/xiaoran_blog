// 发一条闲言：npm run memo 内容
// 自动填好时间，接在 src/data/memos.yaml 末尾；长一点、要分段的直接去文件里改
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { beijingNow } from './time.mjs';

const content = process.argv.slice(2).join(' ').trim();
if (!content) {
  console.error('用法：npm run memo 内容');
  process.exit(1);
}

const { day, time } = beijingNow();
const file = fileURLToPath(new URL('../src/data/memos.yaml', import.meta.url));
// 还是空列表时先把 [] 去掉，再接上新的一条
const text = existsSync(file) ? readFileSync(file, 'utf-8').replace(/^\[\]\s*$/m, '').trimEnd() : '';
const entry = stringify([{ date: `${day} ${time}`, content }], { lineWidth: 0 });
writeFileSync(file, `${text && `${text}\n\n`}${entry}`);
console.log(`已发到 src/data/memos.yaml：${day} ${time} ${content}`);
