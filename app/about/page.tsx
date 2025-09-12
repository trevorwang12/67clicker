import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'
import { getSiteConfig } from '@/lib/config-service'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  
  const title = `About Us - ${config.siteName}`
  const description = 'Learn about our mission to provide the best free online gaming experience. Discover our story and values.'
  const pageUrl = `${config.siteUrl.replace(/\/$/, '')}/about`
  
  return {
    title,
    description,
    keywords: ['about us', 'gaming platform', 'online games', 'mission', 'values'],
    authors: [{ name: config.author }],
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: config.siteName,
      images: [{
        url: config.ogImage,
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
      images: [config.ogImage],
      site: config.twitterHandle || '@gaming',
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default function AboutPage() {
  return <AboutPageClient />
}