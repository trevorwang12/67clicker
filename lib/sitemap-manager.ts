import { promises as fs } from 'fs'
import path from 'path'

export interface SitemapUrl {
  url: string
  lastModified?: string
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  isActive?: boolean
}

export interface SitemapSettings {
  baseUrl: string
  defaultChangeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  defaultPriority: number
  includeStaticPages: boolean
  includeGamePages: boolean
  includeCategoryPages: boolean
  customUrls: SitemapUrl[]
  excludeUrls: string[]
  autoGenerate: boolean
  generateSitemapIndex: boolean
  lastGenerated?: string
}

export interface SitemapData {
  settings: SitemapSettings
  generatedUrls: SitemapUrl[]
  totalUrls: number
}

class SitemapManager {
  private dataFilePath = path.join(process.cwd(), 'data', 'sitemap-settings.json')
  private sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  private sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemapindex.xml')

  private getDefaultSettings(): SitemapSettings {
    return {
      baseUrl: 'https://growden.net',
      defaultChangeFreq: 'weekly',
      defaultPriority: 0.5,
      includeStaticPages: true,
      includeGamePages: true,
      includeCategoryPages: true,
      customUrls: [],
      excludeUrls: ['/admin', '/api', '/test'],
      autoGenerate: true,
      generateSitemapIndex: false
    }
  }

  async getSettings(): Promise<SitemapSettings> {
    try {
      const data = await fs.readFile(this.dataFilePath, 'utf8')
      const parsed = JSON.parse(data)
      return { ...this.getDefaultSettings(), ...parsed.settings }
    } catch (error) {
      return this.getDefaultSettings()
    }
  }

  async saveSettings(settings: Partial<SitemapSettings>): Promise<{ success: boolean; message?: string }> {
    try {
      const currentSettings = await this.getSettings()
      const newSettings = { ...currentSettings, ...settings }
      
      const data = {
        settings: newSettings,
        updatedAt: new Date().toISOString()
      }

      await fs.writeFile(this.dataFilePath, JSON.stringify(data, null, 2), 'utf8')
      return { success: true, message: 'Sitemap settings saved successfully' }
    } catch (error) {
      console.error('Error saving sitemap settings:', error)
      return { success: false, message: 'Failed to save sitemap settings' }
    }
  }

  async generateSitemap(): Promise<{ success: boolean; message?: string; totalUrls?: number }> {
    try {
      const settings = await this.getSettings()
      const urls: SitemapUrl[] = []

      // Add static pages
      if (settings.includeStaticPages) {
        const staticPages = [
          { url: '', priority: 1.0, changeFrequency: 'daily' as const },
          { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
          { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
          { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
          { url: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
          { url: '/hot-games', priority: 0.9, changeFrequency: 'daily' as const },
          { url: '/new-games', priority: 0.9, changeFrequency: 'daily' as const },
        ]

        staticPages.forEach(page => {
          if (!settings.excludeUrls.includes(page.url)) {
            urls.push({
              url: `${settings.baseUrl}${page.url}`,
              lastModified: new Date().toISOString(),
              changeFrequency: page.changeFrequency,
              priority: page.priority,
              isActive: true
            })
          }
        })
      }

      // Add game pages
      if (settings.includeGamePages) {
        try {
          const gamesPath = path.join(process.cwd(), 'data', 'games.json')
          const gamesData = JSON.parse(await fs.readFile(gamesPath, 'utf8'))
          const games = gamesData.filter((game: any) => game.isActive)

          games.forEach((game: any) => {
            const gameUrl = `/game/${game.id}`
            if (!settings.excludeUrls.includes(gameUrl)) {
              urls.push({
                url: `${settings.baseUrl}${gameUrl}`,
                lastModified: game.addedDate || new Date().toISOString(),
                changeFrequency: 'weekly',
                priority: game.isFeatured ? 0.8 : 0.6,
                isActive: true
              })
            }
          })
        } catch (error) {
          console.error('Error loading games for sitemap:', error)
        }
      }

      // Add category pages
      if (settings.includeCategoryPages) {
        try {
          const { dataManager } = await import('./data-manager')
          const categories = await dataManager.getAllCategories()
          
          categories.forEach(category => {
            const categoryUrl = `/category/${category.id}`
            if (!settings.excludeUrls.includes(categoryUrl)) {
              urls.push({
                url: `${settings.baseUrl}${categoryUrl}`,
                lastModified: new Date().toISOString(),
                changeFrequency: 'weekly',
                priority: 0.7,
                isActive: true
              })
            }
          })
        } catch (error) {
          console.error('Error loading categories for sitemap:', error)
        }
      }

      // Add custom URLs
      settings.customUrls.forEach(customUrl => {
        if (customUrl.isActive !== false) {
          urls.push({
            url: customUrl.url.startsWith('http') ? customUrl.url : `${settings.baseUrl}${customUrl.url}`,
            lastModified: customUrl.lastModified || new Date().toISOString(),
            changeFrequency: customUrl.changeFrequency || settings.defaultChangeFreq,
            priority: customUrl.priority || settings.defaultPriority,
            isActive: true
          })
        }
      })

      // Generate XML
      const xml = this.generateSitemapXML(urls)
      const now = new Date().toISOString()
      
      // Always generate sitemap.xml
      await fs.writeFile(this.sitemapPath, xml, 'utf8')
      
      if (settings.generateSitemapIndex) {
        // Generate sitemapindex.xml pointing to sitemap.xml for .cc domains
        const sitemapIndexXml = this.generateSitemapIndexXML(settings.baseUrl, now)
        await fs.writeFile(this.sitemapIndexPath, sitemapIndexXml, 'utf8')
      }

      // Update settings with generation time
      await this.saveSettings({ lastGenerated: now })

      return { 
        success: true, 
        message: `Sitemap generated successfully with ${urls.length} URLs` + 
                 (settings.generateSitemapIndex ? ' (包含sitemap索引)' : ''),
        totalUrls: urls.length 
      }
    } catch (error) {
      console.error('Error generating sitemap:', error)
      return { success: false, message: 'Failed to generate sitemap' }
    }
  }

  private generateSitemapXML(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    const xmlFooter = '</urlset>'
    
    const urlsXML = urls.map(urlData => {
      let urlXML = `  <url>\n    <loc>${urlData.url}</loc>`
      
      if (urlData.lastModified) {
        urlXML += `\n    <lastmod>${urlData.lastModified.split('T')[0]}</lastmod>`
      }
      
      if (urlData.changeFrequency) {
        urlXML += `\n    <changefreq>${urlData.changeFrequency}</changefreq>`
      }
      
      if (urlData.priority !== undefined) {
        urlXML += `\n    <priority>${urlData.priority}</priority>`
      }
      
      urlXML += '\n  </url>'
      return urlXML
    }).join('\n')

    return `${xmlHeader}\n${urlsXML}\n${xmlFooter}`
  }

  private generateSitemapIndexXML(baseUrl: string, lastModified: string): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    const xmlFooter = '</sitemapindex>'
    
    const sitemapEntry = `  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${lastModified.split('T')[0]}</lastmod>
  </sitemap>`

    return `${xmlHeader}\n${sitemapEntry}\n${xmlFooter}`
  }

  async getSitemapData(includeAllUrls = false): Promise<SitemapData> {
    try {
      const settings = await this.getSettings()
      
      // Try to read existing sitemap for URL count
      let generatedUrls: SitemapUrl[] = []
      let totalUrls = 0
      
      try {
        const sitemapXml = await fs.readFile(this.sitemapPath, 'utf8')
        const urlMatches = sitemapXml.match(/<loc>/g)
        totalUrls = urlMatches ? urlMatches.length : 0
        
        // Extract URLs for preview
        const locMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g)
        const priorityMatches = sitemapXml.match(/<priority>(.*?)<\/priority>/g)
        const changefreqMatches = sitemapXml.match(/<changefreq>(.*?)<\/changefreq>/g)
        const lastmodMatches = sitemapXml.match(/<lastmod>(.*?)<\/lastmod>/g)
        
        if (locMatches) {
          const urlsToShow = includeAllUrls ? locMatches : locMatches.slice(0, 10)
          generatedUrls = urlsToShow.map((match, index) => {
            const priority = priorityMatches?.[index] ? parseFloat(priorityMatches[index].replace(/<\/?priority>/g, '')) : 0.5
            const changeFreq = changefreqMatches?.[index] ? changefreqMatches[index].replace(/<\/?changefreq>/g, '') : 'weekly'
            const lastMod = lastmodMatches?.[index] ? lastmodMatches[index].replace(/<\/?lastmod>/g, '') : undefined
            
            return {
              url: match.replace(/<\/?loc>/g, ''),
              priority,
              changeFrequency: changeFreq as SitemapUrl['changeFrequency'],
              lastModified: lastMod,
              isActive: true
            }
          })
        }
      } catch (error) {
        // Sitemap doesn't exist yet
      }

      return {
        settings,
        generatedUrls,
        totalUrls
      }
    } catch (error) {
      console.error('Error getting sitemap data:', error)
      return {
        settings: this.getDefaultSettings(),
        generatedUrls: [],
        totalUrls: 0
      }
    }
  }

  validateUrl(url: string): { isValid: boolean; message?: string } {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        return { isValid: false, message: 'URL must start with http://, https://, or /' }
      }
      
      if (url.startsWith('/')) {
        // Relative URL - just check for invalid characters
        if (url.includes(' ') || url.includes('<') || url.includes('>')) {
          return { isValid: false, message: 'URL contains invalid characters' }
        }
      } else {
        // Absolute URL - validate as URL
        new URL(url)
      }
      
      return { isValid: true }
    } catch (error) {
      return { isValid: false, message: 'Invalid URL format' }
    }
  }
}

export const sitemapManager = new SitemapManager()