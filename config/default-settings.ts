// @deprecated 此文件已弃用，请使用 /lib/config-service.ts
// 默认网站配置 - 所有新网站的通用模板
export const DEFAULT_SITE_CONFIG = {
  // 基本站点信息
  siteName: 'GAMES',
  siteDescription: 'Best Online Gaming Platform - Play hundreds of free browser games',
  siteUrl: 'https://example.com', // 需要替换为实际域名
  author: 'Gaming Platform',
  
  // 社交媒体
  twitterHandle: '@gaming',
  
  // SEO 图片
  ogImage: '/og-image.png',
  favicon: '/favicon.ico',
  siteLogo: '/logo.png',
  
  // 默认关键词
  keywords: ['online games', 'browser games', 'free games', 'gaming platform'],
  
  // Meta 标签
  metaTags: {
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#475569',
    appleMobileWebAppTitle: 'GAMES',
    appleMobileWebAppCapable: 'yes'
  },
  
  // 备份文件名前缀
  backupPrefix: 'gaming-site',
  
  // 默认页面标题后缀
  titleSuffix: 'GAMES'
}

// 用于快速配置新网站的函数
export function createSiteConfig(overrides: Partial<typeof DEFAULT_SITE_CONFIG>) {
  return {
    ...DEFAULT_SITE_CONFIG,
    ...overrides
  }
}

// Rule34dle 特定配置
export const RULE34DLE_CONFIG = createSiteConfig({
  siteName: 'Rule34dle',
  siteDescription: 'Rule34dle - Free Online Games Platform',
  siteUrl: 'https://rule34dle.net',
  author: 'Rule34dle Team',
  twitterHandle: '@rule34dle',
  backupPrefix: 'rule34dle',
  titleSuffix: 'Rule34dle'
})

// 获取当前活跃配置（从环境变量或默认使用 Rule34dle）
export function getCurrentSiteConfig() {
  // 可以通过环境变量切换不同的配置
  const configName = process.env.SITE_CONFIG || 'rule34dle'
  
  switch (configName) {
    case 'rule34dle':
      return RULE34DLE_CONFIG
    case 'generic':
    default:
      return DEFAULT_SITE_CONFIG
  }
}