import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { createAdminResponse, logAdminAccess } from '@/lib/admin-security'
import { clearConfigCache } from '@/lib/config-service'

interface SEOSettings {
  id: string
  siteName: string
  siteDescription: string
  siteUrl: string
  siteLogo: string
  favicon: string
  keywords: string[]
  author: string
  twitterHandle?: string
  ogImage: string
  ogTitle?: string
  ogDescription?: string
  robotsTxt: string
  structuredData: {
    enabled: boolean
    organizationType: 'Organization' | 'WebSite' | 'LocalBusiness'
    organizationName?: string
    organizationUrl?: string
    organizationLogo?: string
    sameAs?: string[]
  }
  googleAnalyticsId?: string
  googleAnalyticsTrackingCode?: string
  googleSearchConsoleId?: string
  googleSearchConsoleHtmlTag?: string
  bingWebmasterToolsId?: string
  yandexWebmasterToolsId?: string
  baiduWebmasterToolsId?: string
  customHeadTags?: string
  metaTags: {
    viewport: string
    themeColor: string
    msapplicationTileColor?: string
    appleMobileWebAppTitle?: string
    appleMobileWebAppCapable?: string
  }
  canonicalUrl?: string
  alternateLanguages?: Array<{
    lang: string
    url: string
  }>
  updatedAt: string
  createdAt: string
}

interface GamePageSEO {
  titleTemplate: string
  descriptionTemplate: string
  keywordsTemplate: string
  enableBreadcrumbs: boolean
  enableRichSnippets: boolean
  enableOpenGraph: boolean
  enableTwitterCards: boolean
}

interface CategoryPageSEO {
  titleTemplate: string
  descriptionTemplate: string
  keywordsTemplate: string
  enablePagination: boolean
}

interface SEOData {
  seoSettings: SEOSettings
  gamePageSEO: GamePageSEO
  categoryPageSEO: CategoryPageSEO
}

// 内存中的SEO数据，服务重启后会恢复默认值
let seoData: SEOData = getDefaultSEOData()

// 从文件加载最新数据
async function loadFromFile(): Promise<SEOData> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seo-settings.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const loadedData = JSON.parse(fileContent)
    console.log('SEO data loaded from file:', filePath)
    return loadedData
  } catch (error) {
    console.log('Failed to load SEO data from file, using default:', error)
    return getDefaultSEOData()
  }
}

// 将数据保存到 JSON 文件
async function saveToFile(data: SEOData) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seo-settings.json')
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    console.log('Data saved to file:', filePath)
  } catch (error) {
    console.error('Failed to save data to file:', error)
    // 不抛出错误，让内存更新继续进行
  }
}

function getDefaultSEOData(): SEOData {
  const now = new Date().toISOString()
  return {
    seoSettings: {
      id: 'main-seo-settings',
      siteName: 'GAMES',
      siteDescription: 'Best Online Gaming Platform - Play hundreds of free browser games',
      siteUrl: 'https://yourgamesite.com',
      siteLogo: '/placeholder-logo.png',
      favicon: '/favicon.ico',
      keywords: [
        'online games',
        'browser games',
        'free games',
        'HTML5 games',
        'web games',
        'casual games',
        'arcade games'
      ],
      author: 'Gaming Platform',
      twitterHandle: '@yourgames',
      ogImage: '/og-image.png',
      ogTitle: 'GAMES - Best Free Online Games',
      ogDescription: 'Play the best free online games. No download required!',
      robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://yourgamesite.com/sitemap.xml`,
      structuredData: {
        enabled: true,
        organizationType: 'WebSite',
        organizationName: 'GAMES',
        organizationUrl: 'https://yourgamesite.com',
        organizationLogo: '/placeholder-logo.png',
        sameAs: [
          'https://twitter.com/yourgames',
          'https://facebook.com/yourgames'
        ]
      },
      metaTags: {
        viewport: 'width=device-width, initial-scale=1.0',
        themeColor: '#475569',
        appleMobileWebAppTitle: 'GAMES',
        appleMobileWebAppCapable: 'yes'
      },
      createdAt: now,
      updatedAt: now
    },
    gamePageSEO: {
      titleTemplate: '{gameName} - Play Free Online | {siteName}',
      descriptionTemplate: 'Play {gameName} for free online! {gameDescription} No download required - start playing now!',
      keywordsTemplate: '{gameName}, {category}, free game, online game, browser game',
      enableBreadcrumbs: true,
      enableRichSnippets: true,
      enableOpenGraph: true,
      enableTwitterCards: true
    },
    categoryPageSEO: {
      titleTemplate: '{categoryName} Games - Free Online | {siteName}',
      descriptionTemplate: 'Play the best {categoryName} games for free! Discover hundreds of exciting {categoryName} games.',
      keywordsTemplate: '{categoryName} games, free {categoryName}, online {categoryName}',
      enablePagination: true
    }
  }
}

export async function GET() {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/seo', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/seo', true)
  try {
    seoData = await loadFromFile()
    return NextResponse.json(seoData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SEO settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/seo', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/seo', true)
  try {
    // Load latest data from file before making changes
    seoData = await loadFromFile()
    
    const { seoSettings } = await request.json()
    
    // 直接更新整个seoSettings
    seoData.seoSettings = {
      ...seoData.seoSettings,
      ...seoSettings,
      updatedAt: new Date().toISOString()
    }
    
    await saveToFile(seoData)
    clearConfigCache()
    return NextResponse.json(seoData)
  } catch (error) {
    console.error('Failed to update SEO settings:', error)
    return NextResponse.json({ error: 'Failed to update SEO settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/seo', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/seo', true)
  try {
    // Load latest data from file before making changes
    seoData = await loadFromFile()
    
    const { type, updates } = await request.json()
    
    if (type === 'seoSettings') {
      seoData.seoSettings = {
        ...seoData.seoSettings,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    } else if (type === 'gamePageSEO') {
      seoData.gamePageSEO = {
        ...seoData.gamePageSEO,
        ...updates
      }
    } else if (type === 'categoryPageSEO') {
      seoData.categoryPageSEO = {
        ...seoData.categoryPageSEO,
        ...updates
      }
    } else {
      return NextResponse.json({ error: 'Invalid update type' }, { status: 400 })
    }
    
    await saveToFile(seoData)
    // 清除配置缓存，确保前端能获取到最新配置
    clearConfigCache()
    return NextResponse.json(seoData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update SEO settings' }, { status: 500 })
  }
}