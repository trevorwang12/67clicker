import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

// GET /api/sitemapindex - 返回sitemapindex.xml的内容
export async function GET() {
  try {
    // 动态获取域名配置
    const seoSettings = await DataService.getSeoSettings()
    const baseUrl = seoSettings?.seoSettings?.siteUrl || 'https://growden.net'
    const now = new Date().toISOString().split('T')[0]

    // 生成sitemap索引，包含所有子sitemap
    const sitemapIndexContent = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/api/sitemap/pages</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/api/sitemap/games</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`
    return new NextResponse(sitemapIndexContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
      }
    })

  } catch (error) {
    console.error('Error generating sitemapindex:', error)
    return new NextResponse('Error generating sitemap index', { status: 500 })
  }
}