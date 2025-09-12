import { promises as fs } from 'fs'
import path from 'path'

interface SiteConfig {
  siteName: string
  siteDescription: string
  siteUrl: string
  author: string
  twitterHandle?: string
  ogImage: string
  favicon: string
  siteLogo: string
  keywords: string[]
  titleSuffix?: string
  metaTags: {
    themeColor: string
    appleMobileWebAppTitle?: string
    appleMobileWebAppCapable?: string
  }
}

let cachedConfig: SiteConfig | null = null

async function loadConfigFromFile(): Promise<SiteConfig> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seo-settings.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const seoData = JSON.parse(fileContent)
    
    // 从SEO设置中提取站点配置
    return {
      siteName: seoData.seoSettings.siteName,
      siteDescription: seoData.seoSettings.siteDescription,
      siteUrl: seoData.seoSettings.siteUrl,
      author: seoData.seoSettings.author,
      twitterHandle: seoData.seoSettings.twitterHandle,
      ogImage: seoData.seoSettings.ogImage,
      favicon: seoData.seoSettings.favicon,
      siteLogo: seoData.seoSettings.siteLogo,
      keywords: seoData.seoSettings.keywords,
      titleSuffix: seoData.seoSettings.titleSuffix,
      metaTags: seoData.seoSettings.metaTags
    }
  } catch (error) {
    console.error('Failed to load config from SEO settings:', error)
    // 返回默认配置作为后备
    return getDefaultConfig()
  }
}

function getDefaultConfig(): SiteConfig {
  return {
    siteName: 'GAMES',
    siteDescription: 'Best Online Gaming Platform - Play hundreds of free browser games',
    siteUrl: 'https://example.com',
    author: 'Gaming Platform',
    twitterHandle: '@gaming',
    ogImage: '/og-image.png',
    favicon: '/favicon.ico',
    siteLogo: '/logo.png',
    keywords: ['online games', 'browser games', 'free games', 'gaming platform'],
    titleSuffix: 'GAMES',
    metaTags: {
      themeColor: '#475569',
      appleMobileWebAppTitle: 'GAMES',
      appleMobileWebAppCapable: 'yes'
    }
  }
}

// 服务端使用
export async function getSiteConfig(): Promise<SiteConfig> {
  if (!cachedConfig) {
    cachedConfig = await loadConfigFromFile()
  }
  return cachedConfig
}

// 清除缓存（当配置更新时）
export function clearConfigCache(): void {
  cachedConfig = null
}

// 客户端使用的配置获取
export async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch('/api/config')
    if (response.ok) {
      return await response.json()
    }
    throw new Error('Failed to fetch config')
  } catch (error) {
    console.error('Failed to fetch site config:', error)
    return getDefaultConfig()
  }
}