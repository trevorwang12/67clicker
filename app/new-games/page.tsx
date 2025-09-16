import type { Metadata } from 'next'
import NewGamesClient from './NewGamesClient'
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

export default function NewGamesPage() {
  return <NewGamesClient />
}