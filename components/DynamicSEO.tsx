'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DynamicSEOProps {
  title?: string
  description?: string
  canonical?: string
  baseUrl?: string
}

export default function DynamicSEO({ 
  title, 
  description, 
  canonical,
  baseUrl = 'https://rule34dle.net' 
}: DynamicSEOProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're running on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side
    if (!isClient || typeof document === 'undefined') return

    try {
      // Set document title
      if (title) {
        document.title = title
      }

      // Set or update canonical URL
      const canonicalUrl = canonical || `${baseUrl}${pathname}`
      
      // Remove existing canonical link safely
      const existingCanonical = document.querySelector('link[rel="canonical"]')
      if (existingCanonical && existingCanonical.parentNode) {
        existingCanonical.parentNode.removeChild(existingCanonical)
      }

      // Add new canonical link
      const link = document.createElement('link')
      link.rel = 'canonical'
      link.href = canonicalUrl
      if (document.head) {
        document.head.appendChild(link)
      }

      // Set description meta tag
      if (description) {
        let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
        if (!descMeta) {
          descMeta = document.createElement('meta')
          descMeta.name = 'description'
          if (document.head) {
            document.head.appendChild(descMeta)
          }
        }
        if (descMeta) {
          descMeta.content = description
        }
      }
    } catch (error) {
      console.warn('DynamicSEO: Error updating meta tags', error)
    }

    // Cleanup function
    return () => {
      if (typeof document === 'undefined') return
      
      try {
        // Remove canonical link when component unmounts
        const canonicalUrl = canonical || `${baseUrl}${pathname}`
        const canonicalLink = document.querySelector(`link[rel="canonical"][href="${canonicalUrl}"]`)
        if (canonicalLink && canonicalLink.parentNode) {
          canonicalLink.parentNode.removeChild(canonicalLink)
        }
      } catch (error) {
        console.warn('DynamicSEO: Error during cleanup', error)
      }
    }
  }, [isClient, title, description, canonical, pathname, baseUrl])

  return null // This component doesn't render anything
}