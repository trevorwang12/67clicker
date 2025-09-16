import type { Metadata } from 'next'
import HotGamesClient from './HotGamesClient'
import { promises as fs } from 'fs'
import path from 'path'
const getCurrentSiteConfig = () => ({
  siteName: 'Growden',
  siteDescription: 'Free online games and entertainment',
  siteUrl: 'https://growden.net',
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
  
  const title = `Hot Games - ${seoSettings?.siteName || 'GAMES'}`
  const description = 'Play the hottest and most popular games! Discover trending games that everyone is playing.'
  const defaultConfig = getCurrentSiteConfig()
  const pageUrl = `${(seoSettings?.siteUrl || defaultConfig.siteUrl).replace(/\/$/, '')}/hot-games`
  
  return {
    title,
    description,
    keywords: ['hot games', 'popular games', 'trending games', 'online games', 'browser games'],
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
        alt: 'Hot Games - Most Popular Online Games',
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

export default function HotGamesPage() {
  return <HotGamesClient />
}