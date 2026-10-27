import { site } from '../config';
import { daysSince } from '../utils/date';
import banner from './banner.txt?raw';

// 打开 F12 控制台就能看到；页面加载时打一次，站内换页不会重复
const accent = getComputedStyle(document.documentElement).getPropertyValue('--c-accent').trim() || '#5765c7';
const strong = `color: ${accent}; font-weight: bold`;
console.log(
  `%c${banner.trimEnd()}%c\n------ 你正在访问 ${site.title} 的博客\n------ 本站已上线 %c${daysSince(site.since)}%c 天\n------ 你已打开F12控制台模式，不要胡乱操作！`,
  strong,
  '',
  strong,
  '',
);
