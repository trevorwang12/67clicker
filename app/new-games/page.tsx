import type { Metadata } from 'next'
import NewGamesClient from './NewGamesClient'
import StructuredData from '@/components/StructuredData'
import { DataService } from '@/lib/data-service'
import { promises as fs } from 'fs'
import path from 'path'
const getCurrentSiteConfig = () => ({
  siteName: '67Clicker',
  siteDescription: 'Modern gaming platform with premium experience',
  siteUrl: 'https://67clickers.online',
})

async function loadSEOSettings() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'seo-settings.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('Failed to load SEO settings:', error)
    const defaultConfig = getCurrentSiteConfig()
    return {
      seoSettings: {
        siteName: defaultConfig.siteName,
        siteUrl: defaultConfig.siteUrl,
        author: defaultConfig.author,
        ogImage: defaultConfig.ogImage,
        twitterHandle: defaultConfig.twitterHandle
      }
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seoData = await loadSEOSettings()
  const { seoSettings } = seoData
  
  const title = `New Games - ${seoSettings?.siteName || 'GAMES'}`
  const description = 'Discover the latest and newest games! Play fresh games added to our collection.'
  const defaultConfig = getCurrentSiteConfig()
  const pageUrl = `${(seoSettings?.siteUrl || defaultConfig.siteUrl).replace(/\/$/, '')}/new-games`
  
  return {
    title,
    description,
    keywords: ['new games', 'latest games', 'fresh games', 'online games', 'browser games'],
    authors: [{ name: seoSettings?.author || 'Gaming Platform' }],
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: seoSettings?.siteName || 'GAMES',
      images: [{
        url: seoSettings?.ogImage || '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'New Games - Latest Online Games',
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [seoSettings?.ogImage || '/og-image.png'],
      site: seoSettings?.twitterHandle || defaultConfig.twitterHandle,
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function NewGamesPage() {
  // 获取新游戏数据用于结构化数据
  let newGames: any[] = []
  try {
    const allGames = await DataService.getGames()
    newGames = allGames
      .filter(game => game.isActive)
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, 20) // 取前20个新游戏
      .map(game => ({ id: game.id, name: game.name }))
  } catch (error) {
    console.error('Failed to load new games for structured data:', error)
  }

  return (
    <>
      {/* 结构化数据 */}
      <StructuredData
        pageType="category"
        pageData={{
          name: 'New Games',
          description: 'Discover the latest and newest games! Play fresh games added to our collection.',
          games: newGames,
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'New Games', url: '/new-games' }
          ]
        }}
      />
      <NewGamesClient />
    </>
  )
}