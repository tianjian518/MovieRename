// 导航菜单（MovieRename 精简版：仅保留重命名 / 整理 / TMDB 识别 / 存储配置）
export const SystemNavMenus = [
  {
    title: '仪表板',
    icon: 'mdi-home-outline',
    to: '/dashboard',
    header: '开始',
    admin: false,
    footer: true,
  },
  {
    title: '媒体库',
    icon: 'mdi-movie-open-outline',
    to: '/media',
    header: '整理',
    admin: false,
  },
  {
    title: '文件管理',
    icon: 'mdi-folder-multiple-outline',
    to: '/filemanager',
    header: '整理',
    admin: true,
  },
  {
    title: '浏览',
    icon: 'mdi-folder-outline',
    to: '/browse',
    header: '整理',
    admin: false,
  },
  {
    title: '个人资料',
    icon: 'mdi-account-circle',
    to: '/profile',
    header: '系统',
    admin: false,
  },
  {
    title: '设定',
    icon: 'mdi-cog',
    to: '/setting',
    header: '系统',
    admin: true,
  },
]

// 设定标签页（仅保留与重命名 / 整理相关的配置）
export const SettingTabs = [
  {
    title: '系统',
    icon: 'mdi-server-network',
    tab: 'system',
    description: '基础设置、媒体服务器（Emby、Jellyfin、Plex）',
  },
  {
    title: '存储 & 目录',
    icon: 'mdi-folder',
    tab: 'directory',
    description: '下载目录、媒体库目录、整理、刮削，以及 OpenList/Alist 等存储配置',
  },
  {
    title: '搜索 & 下载',
    icon: 'mdi-magnify',
    tab: 'search',
    description: '搜索数据源（TheMovieDb、豆瓣、Bangumi）',
  },
  {
    title: '词表',
    icon: 'mdi-file-word-box',
    tab: 'words',
    description: '自定义识别词、自定义制作组/字幕组、自定义占位符、文件整理屏蔽词',
  },
  {
    title: '关于',
    icon: 'mdi-information',
    tab: 'about',
    description: '软件版本',
  },
]

// 电影订阅标签页
export const SubscribeMovieTabs = [
  {
    title: '我的订阅',
    tab: 'mysub',
    icon: 'mdi-heart',
  },
  {
    title: '热门订阅',
    tab: 'popular',
    icon: 'mdi-fire',
  },
]

// 电视剧订阅标签页
export const SubscribeTvTabs = [
  {
    title: '我的订阅',
    tab: 'mysub',
    icon: 'mdi-heart',
  },
  {
    title: '热门订阅',
    tab: 'popular',
    icon: 'mdi-fire',
  },
  {
    title: '订阅分享',
    tab: 'share',
    icon: 'mdi-share-variant',
  },
]

// 插件标签页
export const PluginTabs = [
  {
    title: '我的插件',
    tab: 'installed',
    icon: 'mdi-puzzle',
  },
  {
    title: '插件市场',
    tab: 'market',
    icon: 'mdi-store',
  },
]

// 发现标签页
export const DiscoverTabs = [
  {
    title: 'TheMovieDb',
    tab: 'themoviedb',
    icon: 'themoviedb',
  },
  {
    title: '豆瓣',
    tab: 'douban',
    icon: 'douban',
  },
  {
    title: 'Bangumi',
    tab: 'bangumi',
    icon: 'bangumi',
  },
]
