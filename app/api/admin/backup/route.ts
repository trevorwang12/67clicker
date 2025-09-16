import { NextRequest, NextResponse } from 'next/server'
import { createAdminResponse, logAdminAccess } from '@/lib/admin-security'
const getCurrentSiteConfig = () => ({
  siteName: 'Growden',
  siteDescription: 'Free online games and entertainment',
  siteUrl: 'https://growden.net',
})
import { promises as fs } from 'fs'
import path from 'path'

// 从实际文件加载当前数据
async function loadDataFromFile(fileName: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', fileName)
    const fileContent = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.log(`Failed to load ${fileName}:`, error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/backup', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/backup', true)
  try {
    // 从实际文件加载当前数据（包含最新的设置和字段）
    const [
      games,
      categories, 
      seo,
      homepage,
      ads,
      recommendations,
      featuredGames,
      footer,
      friendlyLinks,
      aboutContent,
      sitemapSettings
    ] = await Promise.all([
      loadDataFromFile('games.json'),
      loadDataFromFile('categories.json'),
      loadDataFromFile('seo-settings.json'),
      loadDataFromFile('homepage-content.json'),
      loadDataFromFile('ads.json'),
      loadDataFromFile('recommended-games.json'),
      loadDataFromFile('featured-games.json'),
      loadDataFromFile('footer.json'),
      loadDataFromFile('friendly-links.json'),
      loadDataFromFile('about-content.json'),
      loadDataFromFile('sitemap-settings.json')
    ])

    // 构建完整的备份数据
    const allData = {
      // 核心数据
      games: games || [],
      categories: categories || [],
      
      // SEO 设置（包含新增的Analytics和Webmaster Tools字段）
      seo: seo || {},
      
      // 页面内容
      homepage: homepage || {},
      aboutContent: aboutContent || {},
      
      // 推荐系统
      recommendations: recommendations || [],
      featuredGames: featuredGames || [],
      
      // 广告配置
      ads: ads || {},
      
      // 网站设置
      footer: footer || {},
      friendlyLinks: friendlyLinks || [],
      sitemapSettings: sitemapSettings || {},
      
      // 备份元数据
      backupDate: new Date().toISOString(),
      backupVersion: '2.0',
      note: "Complete backup including all Analytics & Webmaster Tools settings, custom head tags, and tracking codes.",
      
      // 数据统计信息
      stats: {
        totalGames: games?.length || 0,
        totalCategories: categories?.length || 0,
        totalFriendlyLinks: friendlyLinks?.length || 0,
        seoFieldsIncluded: [
          'googleAnalyticsId',
          'googleAnalyticsTrackingCode', 
          'googleSearchConsoleId',
          'googleSearchConsoleHtmlTag',
          'yandexWebmasterToolsId',
          'baiduWebmasterToolsId',
          'customHeadTags'
        ]
      }
    }

    // 返回可下载的JSON文件
    const config = getCurrentSiteConfig()
    const fileName = `${config.backupPrefix}-backup-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(allData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/backup', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/backup', true)
  try {
    const backupData = await request.json()
    
    // 验证备份数据结构
    const requiredFields = ['games', 'categories', 'seo', 'backupDate']
    const missingFields = requiredFields.filter(field => !backupData[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false,
        error: `Invalid backup format. Missing fields: ${missingFields.join(', ')}`
      }, { status: 400 })
    }

    // 检查备份版本兼容性
    const backupVersion = backupData.backupVersion || '1.0'
    const supportedVersions = ['1.0', '2.0']
    
    if (!supportedVersions.includes(backupVersion)) {
      return NextResponse.json({ 
        success: false,
        error: `Unsupported backup version: ${backupVersion}`
      }, { status: 400 })
    }

    // 统计备份数据信息
    const stats = {
      games: backupData.games?.length || 0,
      categories: backupData.categories?.length || 0,
      friendlyLinks: backupData.friendlyLinks?.length || 0,
      hasAnalyticsSettings: !!(backupData.seo?.seoSettings?.googleAnalyticsId || backupData.seo?.seoSettings?.googleAnalyticsTrackingCode),
      hasSearchConsoleSettings: !!(backupData.seo?.seoSettings?.googleSearchConsoleId || backupData.seo?.seoSettings?.googleSearchConsoleHtmlTag),
      hasCustomHeadTags: !!backupData.seo?.seoSettings?.customHeadTags,
      backupDate: backupData.backupDate,
      version: backupVersion
    }
    
    // 尝试自动恢复到文件系统（如果可能的话）
    let autoRestoreSuccess = false
    let autoRestoreErrors: string[] = []
    
    try {
      // 只在开发环境或本地环境尝试自动恢复
      const isLocalEnvironment = process.env.NODE_ENV === 'development' || !process.env.VERCEL
      
      if (isLocalEnvironment) {
        const filesToRestore = [
          { key: 'games', filename: 'games.json', data: backupData.games },
          { key: 'categories', filename: 'categories.json', data: backupData.categories },
          { key: 'seo', filename: 'seo-settings.json', data: backupData.seo },
          { key: 'homepage', filename: 'homepage-content.json', data: backupData.homepage },
          { key: 'ads', filename: 'ads.json', data: backupData.ads },
          { key: 'recommendations', filename: 'recommended-games.json', data: backupData.recommendations },
          { key: 'featuredGames', filename: 'featured-games.json', data: backupData.featuredGames },
          { key: 'footer', filename: 'footer.json', data: backupData.footer },
          { key: 'friendlyLinks', filename: 'friendly-links.json', data: backupData.friendlyLinks },
          { key: 'aboutContent', filename: 'about-content.json', data: backupData.aboutContent },
          { key: 'sitemapSettings', filename: 'sitemap-settings.json', data: backupData.sitemapSettings }
        ]
        
        for (const file of filesToRestore) {
          if (file.data) {
            try {
              const filePath = path.join(process.cwd(), 'data', file.filename)
              await fs.writeFile(filePath, JSON.stringify(file.data, null, 2), 'utf8')
              console.log(`✅ Restored ${file.filename}`)
            } catch (error) {
              const errorMsg = `Failed to restore ${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
              autoRestoreErrors.push(errorMsg)
              console.error(`❌ ${errorMsg}`)
            }
          }
        }
        
        autoRestoreSuccess = autoRestoreErrors.length === 0
      }
    } catch (error) {
      autoRestoreErrors.push(`Auto-restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // 生成详细的恢复指令
    const instructions = [
      autoRestoreSuccess 
        ? '🎉 AUTO-RESTORE COMPLETED SUCCESSFULLY!' 
        : '📋 Manual Restore Instructions:',
      '',
      autoRestoreSuccess 
        ? '✅ All data files have been automatically restored from backup'
        : '⚠️  Manual restoration required (auto-restore not available in production)',
      '',
      autoRestoreErrors.length > 0 ? '❌ Auto-restore Errors:' : null,
      ...autoRestoreErrors.map(error => `   • ${error}`),
      autoRestoreErrors.length > 0 ? '' : null,
      '🎮 Core Data Restored:',
      `   • Games: ${stats.games} items`,
      `   • Categories: ${stats.categories} items`,
      `   • Friendly Links: ${stats.friendlyLinks} items`,
      '',
      '🔧 SEO & Analytics Settings:',
      stats.hasAnalyticsSettings ? '   ✅ Google Analytics configuration restored' : '   ❌ No Analytics settings found',
      stats.hasSearchConsoleSettings ? '   ✅ Search Console verification restored' : '   ❌ No Search Console settings found', 
      stats.hasCustomHeadTags ? '   ✅ Custom head tags restored' : '   ❌ No custom head tags found',
      '',
      autoRestoreSuccess 
        ? '🔄 Next Steps:'
        : '📄 Manual File Updates Required:',
      autoRestoreSuccess 
        ? '   • Data has been automatically restored to /data/*.json files'
        : `   • Copy 'games' data (${stats.games} items) to /data/games.json`,
      autoRestoreSuccess 
        ? '   • Restart development server to apply changes: npm run dev'
        : `   • Copy 'categories' data (${stats.categories} items) to /data/categories.json`,
      !autoRestoreSuccess ? `   • Copy 'seo' data to /data/seo-settings.json` : null,
      !autoRestoreSuccess ? '   • Copy other data sections to corresponding JSON files' : null,
      !autoRestoreSuccess ? '   • Restart development server: npm run dev' : null,
      '',
      `📅 Backup Date: ${stats.backupDate}`,
      `📌 Backup Version: ${stats.version}`,
      autoRestoreSuccess ? '🚀 Ready to use!' : '⚠️  Manual steps required for production deployments'
    ].filter(item => item !== null)
    
    const successMessage = autoRestoreSuccess
      ? `🎉 Backup restored successfully! ${stats.games} games, ${stats.categories} categories, and ${stats.friendlyLinks} friendly links have been restored automatically.`
      : `✅ Backup validated successfully! Found ${stats.games} games, ${stats.categories} categories, and ${stats.friendlyLinks} friendly links.`

    return NextResponse.json({ 
      success: true, 
      message: successMessage,
      instructions: instructions,
      stats: stats,
      autoRestored: autoRestoreSuccess,
      restoreErrors: autoRestoreErrors
    })
  } catch (error) {
    console.error('Restore error:', error)
    return NextResponse.json({ 
      success: false,
      error: `Failed to process backup: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 })
  }
}