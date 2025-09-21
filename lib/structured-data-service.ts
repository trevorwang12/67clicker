// 结构化数据生成服务 - 遵循Schema.org标准
// "Simple things should be simple" - Linus的实用主义

import { DataService } from './data-service'

export interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo?: string
  sameAs?: string[]
}

export interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  potentialAction?: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

export interface VideoGameSchema {
  '@context': 'https://schema.org'
  '@type': 'VideoGame'
  name: string
  description: string
  url: string
  image?: string
  genre?: string
  gamePlatform?: string
  applicationCategory: 'Game'
  operatingSystem: 'Any'
  offers?: {
    '@type': 'Offer'
    price: '0'
    priceCurrency: 'USD'
    availability: 'https://schema.org/InStock'
  }
  publisher?: {
    '@type': 'Organization'
    name: string
  }
}

export interface ItemListSchema {
  '@context': 'https://schema.org'
  '@type': 'ItemList'
  name: string
  description: string
  numberOfItems: number
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    url: string
    name: string
  }>
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

export class StructuredDataService {

  // 生成组织结构化数据
  static async generateOrganizationSchema(): Promise<OrganizationSchema | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()

      if (!seoSettings.structuredData?.enabled) {
        return null
      }

      const schema: OrganizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: seoSettings.structuredData.organizationName || seoSettings.siteName,
        url: seoSettings.structuredData.organizationUrl || seoSettings.siteUrl
      }

      // 可选属性
      if (seoSettings.structuredData.organizationLogo) {
        schema.logo = seoSettings.structuredData.organizationLogo
      }

      if (seoSettings.structuredData.sameAs && seoSettings.structuredData.sameAs.length > 0) {
        schema.sameAs = seoSettings.structuredData.sameAs
      }

      return schema
    } catch (error) {
      console.error('Failed to generate organization schema:', error)
      return null
    }
  }

  // 生成网站结构化数据
  static async generateWebSiteSchema(): Promise<WebSiteSchema | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()

      if (!seoSettings.structuredData?.enabled) {
        return null
      }

      const schema: WebSiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seoSettings.siteName,
        url: seoSettings.siteUrl
      }

      // 添加搜索功能结构化数据
      schema.potentialAction = {
        '@type': 'SearchAction',
        target: `${seoSettings.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }

      return schema
    } catch (error) {
      console.error('Failed to generate website schema:', error)
      return null
    }
  }

  // 生成游戏结构化数据
  static async generateVideoGameSchema(gameData: {
    id: string
    name: string
    description: string
    image?: string
    category?: string
  }): Promise<VideoGameSchema | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()

      if (!seoSettings.structuredData?.enabled) {
        return null
      }

      const schema: VideoGameSchema = {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: gameData.name,
        description: gameData.description,
        url: `${seoSettings.siteUrl}/game/${gameData.id}`,
        applicationCategory: 'Game',
        operatingSystem: 'Any',
        gamePlatform: 'Web Browser'
      }

      // 可选属性
      if (gameData.image) {
        schema.image = gameData.image
      }

      if (gameData.category) {
        schema.genre = gameData.category
      }

      // 免费游戏offer
      schema.offers = {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }

      // 发布者信息
      schema.publisher = {
        '@type': 'Organization',
        name: seoSettings.structuredData.organizationName || seoSettings.siteName
      }

      return schema
    } catch (error) {
      console.error('Failed to generate video game schema:', error)
      return null
    }
  }

  // 生成游戏列表结构化数据
  static async generateGameListSchema(listData: {
    name: string
    description: string
    games: Array<{
      id: string
      name: string
    }>
  }): Promise<ItemListSchema | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()

      if (!seoSettings.structuredData?.enabled) {
        return null
      }

      const schema: ItemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listData.name,
        description: listData.description,
        numberOfItems: listData.games.length,
        itemListElement: listData.games.map((game, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${seoSettings.siteUrl}/game/${game.id}`,
          name: game.name
        }))
      }

      return schema
    } catch (error) {
      console.error('Failed to generate game list schema:', error)
      return null
    }
  }

  // 生成面包屑结构化数据
  static async generateBreadcrumbSchema(breadcrumbs: Array<{
    name: string
    url: string
  }>): Promise<BreadcrumbListSchema | null> {
    try {
      const { seoSettings } = await DataService.getSeoSettings()

      if (!seoSettings.structuredData?.enabled || breadcrumbs.length === 0) {
        return null
      }

      const schema: BreadcrumbListSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `${seoSettings.siteUrl}${crumb.url}`
        }))
      }

      return schema
    } catch (error) {
      console.error('Failed to generate breadcrumb schema:', error)
      return null
    }
  }

  // 生成完整的页面结构化数据
  static async generatePageStructuredData(pageType: 'homepage' | 'game' | 'category', pageData?: any): Promise<any[]> {
    const schemas: any[] = []

    try {
      // 所有页面都包含组织和网站信息
      const orgSchema = await this.generateOrganizationSchema()
      const websiteSchema = await this.generateWebSiteSchema()

      if (orgSchema) schemas.push(orgSchema)
      if (websiteSchema) schemas.push(websiteSchema)

      // 根据页面类型添加特定结构化数据
      switch (pageType) {
        case 'game':
          if (pageData) {
            const gameSchema = await this.generateVideoGameSchema(pageData)
            if (gameSchema) schemas.push(gameSchema)
          }
          break

        case 'category':
          if (pageData && pageData.games) {
            const listSchema = await this.generateGameListSchema(pageData)
            if (listSchema) schemas.push(listSchema)
          }
          break

        case 'homepage':
          // 首页可以添加特色游戏列表
          if (pageData && pageData.featuredGames) {
            const featuredListSchema = await this.generateGameListSchema({
              name: 'Featured Games',
              description: 'Popular and trending games on our platform',
              games: pageData.featuredGames
            })
            if (featuredListSchema) schemas.push(featuredListSchema)
          }
          break
      }

      // 添加面包屑（如果提供）
      if (pageData && pageData.breadcrumbs) {
        const breadcrumbSchema = await this.generateBreadcrumbSchema(pageData.breadcrumbs)
        if (breadcrumbSchema) schemas.push(breadcrumbSchema)
      }

      return schemas
    } catch (error) {
      console.error('Failed to generate page structured data:', error)
      return []
    }
  }

  // 验证结构化数据
  static validateSchema(schema: any): boolean {
    if (!schema || typeof schema !== 'object') {
      return false
    }

    // 基本必需字段检查
    if (!schema['@context'] || !schema['@type']) {
      return false
    }

    // Schema.org上下文检查
    if (schema['@context'] !== 'https://schema.org') {
      return false
    }

    return true
  }

  // 生成JSON-LD脚本标签
  static generateJSONLDScript(schemas: any[]): string {
    const validSchemas = schemas.filter(schema => this.validateSchema(schema))

    if (validSchemas.length === 0) {
      return ''
    }

    // 如果只有一个schema，直接使用
    // 如果有多个，使用数组格式
    const data = validSchemas.length === 1 ? validSchemas[0] : validSchemas

    return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
  }
}