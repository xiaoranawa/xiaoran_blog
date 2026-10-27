export interface Friend {
  name: string;
  url: string;
  avatar?: string;
  desc?: string;
}

export const friendGroups: { title: string; desc?: string; items: Friend[] }[] = [
  {
    title: '朋友们',
    desc: '欢迎来交换友链～',
    items: [
      {
        name: 'Mo的记事簿',
        url: 'https://blog.xiowo.net/',
        avatar: 'https://blog.xiowo.net/img/avatar.png',
        desc: '万年鸽王，哈哈OvO',
      },
    ],
  },
  {
    title: '设计参考',
    desc: '本站的样式和小挂件参考了这些站点，感谢！',
    items: [
      {
        name: '鸢栀的仓库',
        url: 'https://yuazhi.cn/',
        avatar: 'https://cdn.rjjr.cn/assets/IMG_0235.PNG',
        desc: '每天写下自己的喜好',
      },
      {
        name: '落憾',
        url: 'https://blog.luoh.org/',
        avatar: 'https://cdn2.elh.dpdns.org/picture/2025/57bd486ead4f5b34a28aea7f160a70ae.avif',
        desc: '落人间，破三弦，忆李仙',
      },
      {
        name: '梦爱吃鱼',
        url: 'https://blog.bsgun.cn/',
        avatar: 'https://oss-cdn.bsgun.cn/logo/avatar.256.png',
        desc: '不负心灵，不负今生。',
      },
      {
        name: 'Mo的记事簿',
        url: 'https://blog.xiowo.net/',
        avatar: 'https://blog.xiowo.net/img/avatar.png',
        desc: '万年鸽王，哈哈OvO',
      },
    ],
  },
];
