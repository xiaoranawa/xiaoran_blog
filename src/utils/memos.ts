import { getCollection } from 'astro:content';

// 草稿只在本地预览时显示，新的排前面
export async function getMemos() {
  const memos = await getCollection('memos', ({ data }) => import.meta.env.DEV || !data.draft);
  return memos.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
