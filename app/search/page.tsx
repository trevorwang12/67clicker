import type { Metadata } from 'next'
import SearchPageClient from './SearchPageClient'
import { getSiteConfig } from '@/lib/config-service'

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig()
  return {
  title: `Search Games - ${config.siteName}`,
  description: 'Search for your favorite free online games. Find action, puzzle, adventure and more games.',
  keywords: ['search games', 'find games', 'online games', 'browser games'],
  robots: 'index, follow',
  alternates: {
    canonical: `${config.siteUrl}/search`,
  },
  }
}

export default function SearchPage() {
  return <SearchPageClient />
}