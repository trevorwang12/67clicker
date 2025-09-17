import { cacheManager } from './cache-manager'

// Client-side data manager - uses API calls instead of direct imports
// "Theory and practice sometimes clash. Theory loses. Every single time." - Linus

export interface GameData {
  id: string
  name: string
  description: string
  gradientDescription?: string
  thumbnailUrl: string
  category: string
  tags: string[]
  rating: number
  playCount: number
  viewCount: number
  developer?: string
  releaseDate: string
  addedDate: string
  isActive: boolean
  isFeatured: boolean
  gameType: 'iframe' | 'external' | 'embed'
  gameUrl?: string
  externalUrl?: string
  embedCode?: string
  controls: string[]
  platforms: string[]
  languages: string[]
  features: string[]
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  isActive: boolean
}

export interface SiteSettings {
  homepage: any
  gamePages: any
  layout: any
  features: any
  performance: any
  monetization: any
}

class DataManager {
  private games: GameData[] = []
  private categories: Category[] = []
  private settings: SiteSettings = {
    siteName: 'Growden',
    siteDescription: 'Free online games',
    siteUrl: 'https://growden.net',
    socialMedia: { facebook: '', twitter: '', instagram: '' },
    contact: { email: '', phone: '', address: '' },
    features: { enableUserComments: false, enableGameRatings: true, enableSocialSharing: true }
  }
  private initialized = false

  constructor() {
    // Initialize with fresh data from API in client-side with a small delay
    // to avoid racing with the initial page load
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.initializeFromAPI()
      }, 100)
    }
  }

  private async initializeFromAPI() {
    if (this.initialized) return

    try {
      // Load latest games from API with lightweight parameter
      const gamesResponse = await fetch('/api/games?lightweight=true', {
        headers: {
          'Cache-Control': 'max-age=300' // 5分钟缓存，减少重复请求
        }
      })
      if (gamesResponse.ok) {
        const latestGames = await gamesResponse.json()
        this.games = latestGames
      } else {
        console.warn('Games API returned:', gamesResponse.status)
      }

      // Load latest categories from API
      const categoriesResponse = await fetch('/api/categories', {
        headers: {
          'Cache-Control': 'max-age=600' // 10分钟缓存
        }
      })
      if (categoriesResponse.ok) {
        const latestCategories = await categoriesResponse.json()
        this.categories = latestCategories
      } else {
        console.warn('Categories API returned:', categoriesResponse.status)
      }

      this.initialized = true
    } catch (error) {
      console.warn('Failed to initialize data from API, using static data:', error)
      this.initialized = true // Mark as initialized even if API fails
    }
  }

  private clearCache() {
    if (typeof window !== 'undefined') {
      cacheManager.clear()
    }
  }

  private dispatchUpdateEvent() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gamesUpdated'))
    }
  }

  // Games Management - fetch from API, use caching
  async getAllGames(): Promise<GameData[]> {
    const cached = cacheManager.get('all-games')
    if (cached) return cached

    // Only fetch from API if running in browser
    if (typeof window !== 'undefined') {
      try {
        // Fetch lightweight data by default to reduce payload
        const response = await fetch('/api/games?lightweight=true')
        if (response.ok) {
          const data = await response.json()
          const games = Array.isArray(data) ? data : data.games || []
          cacheManager.set('all-games', games, 60 * 60 * 1000) // 1小时缓存，载荷优化
          this.games = games // Update local cache
          return games
        }
      } catch (error) {
        console.warn('Failed to fetch games from API:', error)
      }
    }

    // Fallback to existing data
    const result = this.games.filter(game => game.isActive)
    return result
  }

  async getGameById(id: string): Promise<GameData | null> {
    const cacheKey = `game-${id}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached

    try {
      // Try API first for fresh data
      const response = await fetch(`/api/games/${id}`)
      if (response.ok) {
        const game = await response.json()
        cacheManager.set(cacheKey, game, 60 * 60 * 1000) // 1 hour cache
        return game
      }
    } catch (error) {
      console.warn('Failed to fetch game from API:', error)
    }

    // Fallback to local data
    const result = this.games.find(game => game.id === id && game.isActive) || null
    cacheManager.set(cacheKey, result, 60 * 60 * 1000) // 1 hour cache
    return result
  }

  getGamesByCategory(categoryId: string, limit?: number): GameData[] {
    const cacheKey = `games-category-${categoryId}-${limit || 'all'}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached
    
    const filtered = this.games.filter(
      game => game.category === categoryId && game.isActive
    )
    const result = limit ? filtered.slice(0, limit) : filtered
    cacheManager.set(cacheKey, result, 3 * 60 * 1000)
    return result
  }

  getFeaturedGames(limit: number = 8): GameData[] {
    const cacheKey = `featured-games-${limit}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached
    
    const result = this.games
      .filter(game => game.isFeatured && game.isActive)
      .slice(0, limit)
    cacheManager.set(cacheKey, result, 5 * 60 * 1000)
    return result
  }

  async getHotGames(limit: number = 8): Promise<any[]> {
    const cacheKey = `hot-games-${limit}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached

    // Ensure we have fresh games data
    const games = await this.getAllGames()

    const result = games
      .filter(game => game.isActive)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit)
      .map(game => ({
        name: game.name,
        thumbnailUrl: game.thumbnailUrl,
        rating: game.rating,
        viewCount: game.viewCount,
        id: game.id
      }))

    cacheManager.set(cacheKey, result, 2 * 60 * 1000)
    return result
  }

  async getNewGames(limit: number = 8): Promise<any[]> {
    const cacheKey = `new-games-${limit}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached

    // Ensure we have fresh games data
    const games = await this.getAllGames()

    const result = games
      .filter(game => game.isActive)
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, limit)
      .map(game => ({
        name: game.name,
        thumbnailUrl: game.thumbnailUrl,
        addedDate: game.addedDate,
        id: game.id
      }))

    cacheManager.set(cacheKey, result, 5 * 60 * 1000)
    return result
  }

  async searchGames(query: string, limit?: number): Promise<GameData[]> {
    const searchTerm = query.toLowerCase()
    const results = this.games.filter(game =>
      game.isActive && (
        game.name.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.category.toLowerCase().includes(searchTerm) ||
        (game.developer && game.developer.toLowerCase().includes(searchTerm)) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    )
    return limit ? results.slice(0, limit) : results
  }

  // 保留同步版本以向后兼容
  searchGamesSync(query: string, limit?: number): GameData[] {
    const searchTerm = query.toLowerCase()
    const results = this.games.filter(game => 
      game.isActive && (
        game.name.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.category.toLowerCase().includes(searchTerm) ||
        (game.developer && game.developer.toLowerCase().includes(searchTerm)) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    )
    return limit ? results.slice(0, limit) : results
  }

  // Categories Management
  async getAllCategories(): Promise<Category[]> {
    const cached = cacheManager.get('all-categories')
    if (cached) return cached

    const result = this.categories.filter(category => category.isActive)
    cacheManager.set('all-categories', result, 60 * 60 * 1000) // 1 hour cache
    return result
  }

  getAllCategoriesSync(): Category[] {
    return this.categories.filter(category => category.isActive)
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const cacheKey = `category-${id}`
    const cached = cacheManager.get(cacheKey)
    if (cached) return cached

    const result = this.categories.find(category => category.id === id && category.isActive) || null
    cacheManager.set(cacheKey, result, 60 * 60 * 1000) // 1 hour cache
    return result
  }

  getCategoryByIdSync(id: string): Category | null {
    return this.categories.find(category => category.id === id && category.isActive) || null
  }

  // Game Statistics
  updateGameViews(gameId: string): void {
    const game = this.games.find(g => g.id === gameId)
    if (game) {
      game.viewCount += 1
      console.log(`Updated views for ${game.name}: ${game.viewCount}`)
    }
  }

  updateGamePlays(gameId: string): void {
    const game = this.games.find(g => g.id === gameId)
    if (game) {
      game.playCount += 1
      // In a real application, you would persist this to a database
      console.log(`Updated plays for ${game.name}: ${game.playCount}`)
    }
  }

  updateGamePlayCount(gameId: string): void {
    this.updateGamePlays(gameId)
  }

  // Settings Management
  getSiteSettings(): SiteSettings {
    return this.settings
  }

  getHomepageSettings() {
    return this.settings.homepage
  }

  getGamePageSettings() {
    return this.settings.gamePages
  }

  getLayoutSettings() {
    return this.settings.layout
  }

  // Utility functions
  formatPlayCount(count: number): string {
    if (count >= 1000000000) {
      return (count / 1000000000).toFixed(1) + 'B'
    } else if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M'
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K'
    }
    return count.toString()
  }

  getGamesByTag(tag: string, limit?: number): GameData[] {
    const filtered = this.games.filter(
      game => game.tags.includes(tag) && game.isActive
    )
    return limit ? filtered.slice(0, limit) : filtered
  }

  async getRelatedGames(gameId: string, limit: number = 6): Promise<GameData[]> {
    const currentGame = await this.getGameById(gameId)
    if (!currentGame) return []
    
    // Calculate relevance score for each game
    const gamesWithScores = this.games
      .filter(game => game.id !== gameId && game.isActive)
      .map(game => {
        let score = 0
        
        // Same category gets highest priority (50 points)
        if (game.category === currentGame.category) {
          score += 50
        }
        
        // Calculate shared tags score (10 points per shared tag)
        const sharedTags = game.tags.filter(tag => currentGame.tags.includes(tag))
        score += sharedTags.length * 10
        
        // Bonus for high rating games (up to 5 points)
        score += game.rating
        
        // Small bonus for popularity (normalized viewCount, up to 3 points)
        const maxViews = Math.max(...this.games.map(g => g.viewCount))
        if (maxViews > 0) {
          score += (game.viewCount / maxViews) * 3
        }
        
        return { game, score }
      })
      .filter(item => item.score > 0) // Only include games with some relevance
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)
    
    return gamesWithScores.map(item => item.game)
  }

  // Admin functions - now handled by API routes
  async addGame(gameData: Omit<GameData, 'addedDate' | 'viewCount' | 'playCount'> & { id?: string }): Promise<GameData> {
    const newGame: GameData = {
      ...gameData,
      id: gameData.id || this.generateGameId(gameData.name),
      addedDate: new Date().toISOString().split('T')[0],
      viewCount: 0,
      playCount: 0
    }
    
    const response = await fetch('/api/admin/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGame)
    })
    
    if (!response.ok) {
      throw new Error('Failed to add game')
    }
    
    const savedGame = await response.json()
    
    // Update local games array immediately
    this.games.push(savedGame)
    
    this.clearCache()
    this.dispatchUpdateEvent()
    return savedGame
  }

  async updateGame(gameId: string, updates: Partial<GameData>): Promise<boolean> {
    const response = await fetch('/api/admin/games', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, updates })
    })
    
    if (response.ok) {
      // Update local games array immediately
      const gameIndex = this.games.findIndex(g => g.id === gameId)
      if (gameIndex !== -1) {
        this.games[gameIndex] = { ...this.games[gameIndex], ...updates }
      }
      
      this.clearCache()
      this.dispatchUpdateEvent()
    }
    
    return response.ok
  }

  async deleteGame(gameId: string): Promise<boolean> {
    const response = await fetch(`/api/admin/games?id=${gameId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      // Update local games array immediately - mark as inactive instead of removing
      const gameIndex = this.games.findIndex(g => g.id === gameId)
      if (gameIndex !== -1) {
        this.games[gameIndex].isActive = false
      }
      
      this.clearCache()
      this.dispatchUpdateEvent()
    }
    
    return response.ok
  }

  private generateGameId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
}

// Export singleton instance
export const dataManager = new DataManager()

// Export individual functions for backwards compatibility
export const {
  getAllGames,
  getGameById,
  getHotGames,
  getNewGames,
  getRelatedGames,
  searchGames,
  searchGamesSync,
  updateGameViews: updateGameViewCount,
  updateGamePlayCount,
  formatPlayCount,
  getAllCategories,
  getAllCategoriesSync,
  getCategoryById,
  getCategoryByIdSync
} = dataManager