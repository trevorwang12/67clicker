import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET() {
  try {
    // 动态获取域名配置
    const seoSettings = await DataService.getSeoSettings()
    const baseUrl = seoSettings?.seoSettings?.siteUrl || 'https://growden.net'
    const now = new Date().toISOString().split('T')[0]

    // 获取游戏数据
    const games = await DataService.getGames()
    const categories = await DataService.getCategories()

    const gameUrls = games
      .filter((game: any) => game.isActive)
      .map((game: any) => ({
        url: `${baseUrl}/game/${game.id}`, // 修复：使用id而不是slug
        priority: '0.8',
        changefreq: 'weekly'
      }))
    
    const categoryUrls = categories
      .filter((category: any) => category.isActive)
      .map((category: any) => ({
        url: `${baseUrl}/category/${category.id}`, // 修复：使用id而不是slug
        priority: '0.7',
        changefreq: 'weekly'
      }))

    const allGameUrls = [...gameUrls, ...categoryUrls]

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allGameUrls.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating games sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}