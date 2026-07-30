// 导航菜单（MovieRename 精简版：仅保留重命名 / 整理 / TMDB 识别 / 存储配置）
export const SystemNavMenus = [
  {
    title: '文件管理',
    icon: 'mdi-folder-multiple-outline',
    to: '/filemanager',
    header: '开始',
    admin: true,
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
    title: '整理历史',
    icon: 'mdi-history',
    to: '/history',
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

// 设定标签页（MovieRename 仅保留「存储 & 目录」，用于下载/媒体库目录、整理、刮削，以及 OpenList/Alist 等存储配置）
export const SettingTabs = [
  {
    title: '存储 & 目录',
    icon: 'mdi-folder',
    tab: 'directory',
    description: '下载目录、媒体库目录、整理、刮削，以及 OpenList/Alist 等存储配置',
  },
]
