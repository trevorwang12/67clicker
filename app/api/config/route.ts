import { NextResponse } from 'next/server'
import { getSiteConfig } from '@/lib/config-service'

export async function GET() {
  try {
    const config = await getSiteConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error('Failed to get site config:', error)
    return NextResponse.json({ error: 'Failed to load configuration' }, { status: 500 })
  }
}