// SEO数据服务 - 分离SEO逻辑
import { DataService } from './data-service'
import type { Metadata } from 'next'

const getCurrentSiteConfig = () => ({
  siteName: 'Growden',
  siteDescription: 'Free online games and entertainment',
  siteUrl: 'https://growden.net',
  siteLogo: '/favicon.svg',
  favicon: '/favicon.ico',
  keywords: ['games', 'online games', 'free games'],
  author: 'Growden',
  twitterHandle: '@growden',
  ogImage: '/og-image.jpg',
  ogTitle: 'Growden - Free Online Games',
  ogDescription: 'Play free online games at Growden',
})

export interface SeoSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  siteLogo: string
  favicon: string
  keywords: string[]
  author: string
  twitterHandle: string
  ogImage: string
  ogTitle: string
  ogDescription: string
  canonicalUrl?: string
  metaTags: {
    viewport: string
    themeColor: string
    appleMobileWebAppTitle?: string
    appleMobileWebAppCapable?: string
  }
  googleAnalyticsId?: string
  googleSearchConsoleId?: string
  yandexWebmasterToolsId?: string
  baiduWebmasterToolsId?: string
}

export class SeoService {
  static async generateMetadata(): Promise<Metadata> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()
      
      return {
        title: seoSettings.siteName,
        description: seoSettings.siteDescription,
        keywords: seoSettings.keywords,
        authors: [{ name: seoSettings.author }],
        generator: 'Next.js',
        metadataBase: new URL(seoSettings.siteUrl),
        alternates: {
          canonical: seoSettings.canonicalUrl || seoSettings.siteUrl,
        },
        openGraph: {
          title: seoSettings.ogTitle || seoSettings.siteName,
          description: seoSettings.ogDescription || seoSettings.siteDescription,
          url: seoSettings.siteUrl,
          siteName: seoSettings.siteName,
          images: [{
            url: seoSettings.ogImage,
            width: 1200,
            height: 630,
            alt: seoSettings.siteName,
          }],
          locale: 'en_US',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: seoSettings.ogTitle || seoSettings.siteName,
          description: seoSettings.ogDescription || seoSettings.siteDescription,
          site: seoSettings.twitterHandle,
          images: [seoSettings.ogImage],
        },
        icons: [
          {
            url: seoSettings.favicon,
            sizes: '32x32',
            type: 'image/x-icon',
          },
          {
            url: seoSettings.siteLogo,
            type: 'image/svg+xml',
          },
          {
            url: seoSettings.siteLogo,
            sizes: '180x180',
            rel: 'apple-touch-icon',
          }
        ],
        other: {
          'theme-color': seoSettings.metaTags.themeColor,
          ...(seoSettings.metaTags.appleMobileWebAppTitle && {
            'apple-mobile-web-app-title': seoSettings.metaTags.appleMobileWebAppTitle
          }),
          ...(seoSettings.metaTags.appleMobileWebAppCapable && {
            'mobile-web-app-capable': seoSettings.metaTags.appleMobileWebAppCapable
          }),
          ...(seoSettings.googleSearchConsoleId && {
            'google-site-verification': seoSettings.googleSearchConsoleId
          }),
        }
      }
    } catch (error) {
      console.error('Failed to generate metadata:', error)
      
      // 返回安全的默认metadata
      const defaultConfig = getCurrentSiteConfig()
      return {
        title: defaultConfig.siteName,
        description: defaultConfig.siteDescription,
        generator: 'Next.js',
        metadataBase: new URL(defaultConfig.siteUrl),
        alternates: {
          canonical: defaultConfig.siteUrl,
        },
      }
    }
  }
  
  static async getAnalyticsId(): Promise<string | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()
      
      // 只返回安全的GA ID，拒绝自定义脚本
      const gaId = seoSettings.googleAnalyticsId
      if (gaId && gaId.startsWith('G-') && gaId.length > 10) {
        return gaId
      }
      
      return null
    } catch (error) {
      console.error('Failed to get analytics ID:', error)
      return null
    }
  }
  
  static async getVerificationTags(): Promise<{
    yandex?: string
    baidu?: string
  }> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()
      
      return {
        ...(seoSettings.yandexWebmasterToolsId && { yandex: seoSettings.yandexWebmasterToolsId }),
        ...(seoSettings.baiduWebmasterToolsId && { baidu: seoSettings.baiduWebmasterToolsId })
      }
    } catch (error) {
      console.error('Failed to get verification tags:', error)
      return {}
    }
  }

  static async getCustomHeadTags(): Promise<string | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()
      
      const customTags = seoSettings.customHeadTags
      console.log('[DEBUG] Custom tags from settings:', customTags)
      if (!customTags || customTags.trim() === '') {
        console.log('[DEBUG] No custom tags found')
        return null
      }
      
      // 基本的安全检查 - 确保是合法的分析和验证代码
      const allowedDomains = [
        'plausible',
        'analytics.google.com',
        'googletagmanager.com', 
        'googlesyndication.com',
        'google-analytics.com',
        'hotjar.com',
        'mixpanel.com',
        'segment.com',
        'facebook.com',
        'twitter.com'
      ]
      
      const hasAllowedDomain = allowedDomains.some(domain => 
        customTags.toLowerCase().includes(domain.toLowerCase())
      )
      console.log('[DEBUG] Has allowed domain:', hasAllowedDomain)
      
      // 检查危险内容
      const dangerousPatterns = [
        'javascript:',
        'data:',
        'vbscript:',
        'onload=',
        'onerror=',
        'onclick=',
        'eval(',
        'document.write('
      ]
      
      const hasDangerousContent = dangerousPatterns.some(pattern =>
        customTags.toLowerCase().includes(pattern.toLowerCase())
      )
      console.log('[DEBUG] Has dangerous content:', hasDangerousContent)
      
      if (hasDangerousContent) {
        console.warn('Custom head tags rejected: contains dangerous content')
        return null
      }
      
      const hasScriptDefer = customTags.includes('<script defer')
      const hasScriptAsync = customTags.includes('<script async')
      const hasMeta = customTags.includes('<meta ')
      console.log('[DEBUG] Has script defer:', hasScriptDefer, 'Has script async:', hasScriptAsync, 'Has meta:', hasMeta)
      
      // 如果包含允许的域名或者看起来是标准的meta标签，则允许
      if (hasAllowedDomain || hasMeta || hasScriptDefer || hasScriptAsync) {
        console.log('[DEBUG] Custom head tags approved')
        return customTags
      }
      
      console.warn('Custom head tags rejected: no recognized analytics domain')
      return null
      
    } catch (error) {
      console.error('Failed to get custom head tags:', error)
      return null
    }
  }
}