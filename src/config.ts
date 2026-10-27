// 站点的所有可调项都在这里

export const site = {
  title: '霄の杂物间',
  subtitle: '摆烂类博客，写什么纯属兴趣( •̀ ω •́ )✧',
  description: '霄染的个人博客，记录学习笔记和一些碎碎念。',
  author: '霄染',
  github: 'xiaoranawa',
  avatar: '/img/avatar.webp',
  // 左侧大卡片用的高清头像
  avatarLarge: '/img/avatar-lg.webp',
  // 右栏最下面的装饰图，不想要就留空
  sticker: '/img/niko.webp',
  // 建站日期，用于「建站天数」和页脚年份
  since: '2026-10-27',
  postsPerPage: 8,
  memosPerPage: 10,
};

export const nav = [
  { text: '文章', href: '/', icon: 'files' },
  { text: '归档', href: '/archives/', icon: 'archive' },
  { text: '友链', href: '/friends/', icon: 'link' },
  { text: '朋友圈', href: '/circle/', icon: 'users-group' },
  { text: '闲言', href: '/memos/', icon: 'bubble-text' },
  { text: '关于', href: '/about/', icon: 'user' },
];

// 侧栏底部的小图标
export const sidebarLinks = [
  { name: '首页', href: '/', icon: 'home' },
  { name: 'GitHub', href: `https://github.com/${site.github}`, icon: 'brand-github' },
  { name: '订阅', href: '/rss.xml', icon: 'rss' },
];

// 左侧栏底部的徽章：萌备「异次元之旅」动图和无聊湾
export const badges = {
  travel: {
    // 带上 ?travel=on，到了那边会直接随机跳到一个成员站
    href: 'https://travel.moe/go.html?travel=on',
    tip: '随机前往一个 异次元之旅-跃迁 项目网站',
    notice: '即将跳转到「异次元之旅-跃迁」项目的成员博客，不保证跳转网站的安全性和可用性。',
    // 配色可选 default、pink、cyan、blue、green，深色模式会自动换成对应的深色版
    color: 'cyan',
  },
  // 不想要无聊湾徽章就改成 null
  boringbay: { tip: '一起来无聊' } as { tip: string } | null,
};

// 页脚头像两侧的圆形按钮，邮箱记得改成自己的
export const footerLinks = {
  left: [
    { name: '邮箱', href: 'mailto:351932317@qq.com', icon: 'mail' },
    { name: '订阅', href: '/rss.xml', icon: 'rss' },
  ],
  right: [
    { name: 'GitHub', href: `https://github.com/${site.github}`, icon: 'brand-github' },
    { name: '友链', href: '/friends/', icon: 'link' },
  ],
};

export const footer = {
  icp: { text: '萌ICP备20260081号', href: 'https://icp.gov.moe/?keyword=20260081' },
  license: {
    name: 'CC BY-NC-ND 4.0',
    href: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans',
  },
  // 页脚趴墙的小动物，图片来自 blog.bsgun.cn 的教程
  pet: { image: '/img/footer-animal.webp', ground: '/img/footer-ground.webp' },
};

export const background = {
  // 随机图 API，电脑端返回横图，手机端返回竖图
  api: 'https://api.yppp.net/api',
  blur: 4,
};

// 倒计时会自动挑最近的一个；MM-DD 表示每年重复
export const countdown = [
  { name: '元旦', date: '01-01' },
  { name: '春节', date: '2027-02-06' },
  { name: '春节', date: '2028-01-26' },
  { name: '劳动节', date: '05-01' },
  { name: '国庆节', date: '10-01' },
];

// 右上角欢迎框：显示访客从哪个网站点进来，再按访客当地时间挑一句，from <= 小时 < to
export const welcome = {
  duration: 8000,
  // 博主所在城市，「欢迎来访」卡片用它算访客离你多远；不想显示距离就改成 null
  home: { name: '深圳', lat: 22.543, lng: 114.058 } as { name: string; lat: number; lng: number } | null,
  // 来源网站显示成什么名字，没列出的显示域名；友链里的站会自动用朋友的名字
  sites: {
    'baidu.com': '百度',
    'google.com': '谷歌',
    'google.com.hk': '谷歌',
    'bing.com': '必应',
    'sogou.com': '搜狗',
    'so.com': '360 搜索',
    'sm.cn': '神马搜索',
    'duckduckgo.com': 'DuckDuckGo',
    'github.com': 'GitHub',
    'bilibili.com': '哔哩哔哩',
    'zhihu.com': '知乎',
    'weibo.com': '微博',
    'x.com': 'X',
    'travellings.cn': '开往',
  } as Record<string, string>,
  greetings: [
    { from: 0, to: 5, text: '夜深了，早点休息，熬夜会变成熊猫的~' },
    { from: 5, to: 7, text: '起这么早！早起的鸟儿有虫吃~' },
    { from: 7, to: 9, text: '早上好！记得吃早饭哦~' },
    { from: 9, to: 11, text: '上午好！一天之计在于晨，冲鸭~' },
    { from: 11, to: 13, text: '中午了，该弄什么吃好呢~~' },
    { from: 13, to: 14, text: '吃饱了犯困？眯一会儿再继续吧~' },
    { from: 14, to: 17, text: '下午好！来杯下午茶提提神~' },
    { from: 17, to: 19, text: '傍晚啦，晚饭吃点好的犒劳自己~' },
    { from: 19, to: 22, text: '晚上好！忙完了就放松一下吧~' },
    { from: 22, to: 24, text: '夜色渐深，洗洗准备睡觉吧~' },
  ],
};

// 右下角的时间胶囊：按访客当地时间从屏幕右边弹出一句，同一时段有好几句就随机挑，from <= 小时 < to
export const timeTip = {
  delay: 1500, // 打开页面后多久弹出，单位毫秒
  duration: 6000, // 停留多久
  tips: [
    { from: 0, to: 2, texts: ['新的一天已经开始啦，昨天的烦恼就留在昨天吧 🌙', '夜猫子集合！这个点的网上冲浪最安静 🦉'] },
    { from: 2, to: 5, texts: ['这个点还醒着，是在赶 ddl 还是睡不着呀 😵', '天都快亮了，再不睡就能直接吃早饭了 🌌'] },
    { from: 5, to: 7, texts: ['天刚蒙蒙亮，出门记得多穿件衣服 🌅', '比闹钟还早醒，今天一定会很顺 🍀'] },
    { from: 7, to: 9, texts: ['通勤路上看博客？小心坐过站哦 🚇', '闹钟响了几遍才起的？老实交代 ⏰'] },
    { from: 9, to: 11, texts: ['先来杯咖啡，再慢慢进入状态 ☕', '上午脑子最清醒，适合干点正事 💡'] },
    { from: 11, to: 13, texts: ['饭点到了，先去干饭，博客又不会跑 🍚', '外卖还没到？那就再看一篇文章吧 🛵'] },
    { from: 13, to: 15, texts: ['午后的阳光刚刚好，发会儿呆也没关系 ☀️', '午休结束，伸个懒腰再开工 🙆'] },
    { from: 15, to: 16, texts: ['三点几嘞，饮茶先啦 🍵', '下午三点，摸鱼的黄金时间 🐟'] },
    { from: 16, to: 17, texts: ['坐久了起来走两步，顺便看看窗外 🚶', '再坚持一下，快到下班放学时间了 ⌛'] },
    { from: 17, to: 19, texts: ['回家路上注意安全，到家再慢慢看 🚲', '抬头看看天，今天的晚霞说不定很好看 🌇'] },
    { from: 19, to: 21, texts: ['晚饭吃了吗？吃饱了才有力气摸鱼 🍲', '晚上的风最舒服，出门散散步也不错 🌃'] },
    { from: 21, to: 23, texts: ['再看一篇就睡，真的就一篇 📖', '夜深人静，最适合听着歌写点东西 🎧'] },
    { from: 23, to: 24, texts: ['快到明天了，今天也辛苦啦 💤', '零点前睡觉的人，第二天运气会变好（大概）✨'] },
  ],
};

// 评论用 Giscus，评论存在 GitHub Discussions 里。到 https://giscus.app 填好仓库，
// 把生成的 repo、repoId、category、categoryId 抄过来；没填全就不显示评论区
export const comments = {
  repo: '', // 比如 'xiaoranawa/blog'，要是公开仓库，并且开了 Discussions、装了 giscus 应用
  repoId: '',
  category: 'Announcements',
  categoryId: '',
};

// 朋友圈的数据接口，就是 rss-server 文件夹里那个 Go 服务，订阅哪些博客在它的 config.json 里配
export const circleApi = 'https://rss.xiaoowo.top/api/circle';

// 访问统计用 Vercount，和不蒜子兼容；不蒜子的接口经常挂（2026-10 测过返回 502）
export const counterScript = 'https://events.vercount.one/js';

export const archiveCardMonths = 8;
