import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET() {
  try {
    // 动态获取域名配置
    const seoSettings = await DataService.getSeoSettings()
    const baseUrl = seoSettings?.seoSettings?.siteUrl || 'https://growden.net'
    const now = new Date().toISOString().split('T')[0]
    
    // 静态页面
    const staticPages = [
      { url: baseUrl, priority: '1.0', changefreq: 'daily' },
      { url: `${baseUrl}/about`, priority: '0.8', changefreq: 'monthly' },
      { url: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
      { url: `${baseUrl}/privacy`, priority: '0.5', changefreq: 'yearly' },
      { url: `${baseUrl}/terms`, priority: '0.5', changefreq: 'yearly' },
      { url: `${baseUrl}/hot-games`, priority: '0.9', changefreq: 'daily' },
      { url: `${baseUrl}/new-games`, priority: '0.9', changefreq: 'daily' }
    ]

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
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
    console.error('Error generating pages sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}