import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'
import { promises as fs } from 'fs'
import path from 'path'
import { getCurrentSiteConfig } from '@/config/default-settings'

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
  
  const title = `About Us - ${seoSettings?.siteName || 'GAMES'}`
  const description = 'Learn about our mission to provide the best free online gaming experience. Discover our story and values.'
  const defaultConfig = getCurrentSiteConfig()
  const pageUrl = `${(seoSettings?.siteUrl || defaultConfig.siteUrl).replace(/\/$/, '')}/about`
  
  return {
    title,
    description,
    keywords: ['about us', 'gaming platform', 'online games', 'mission', 'values'],
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
        alt: 'About Us - Gaming Platform',
      }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [seoSettings?.ogImage || '/og-image.png'],
      site: seoSettings?.twitterHandle || '@rule34dle',
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default function AboutPage() {
  return <AboutPageClient />
}