import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'
import { DataService } from '@/lib/data-service'
import { SeoService } from '@/lib/seo-service'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  return SeoService.generateMetadata()
}

export default async function HomePage() {
  let seoData: any | null = null

  try {
    seoData = await DataService.getSeoSettings()
  } catch (error) {
    console.error('Failed to load SEO settings for homepage:', error)
  }

  return <HomePageClient initialSeoData={seoData} />
}
