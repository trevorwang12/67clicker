import { dataManager, GameData } from './data-manager'

interface RecommendedGame {
  id: string
  gameId: string
  priority: number
  isActive: boolean
  addedDate: string
}

const STORAGE_KEY = 'recommended-games'

class RecommendedGamesManager {
  private recommendedGames: RecommendedGame[] = []

  constructor() {
    // No client-side initialization needed
  }

  private async loadFromAPI(): Promise<RecommendedGame[]> {
    try {
      const response = await fetch('/api/recommendations')
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Error loading recommendations:', error)
    }
    return []
  }

  private async initializeDefaultRecommendedGames() {
    // 从所有游戏中随机选择一些作为默认推荐
    const allGames = await dataManager.getAllGames()
    const shuffled = allGames.sort(() => Math.random() - 0.5)
    const defaultCount = Math.min(8, shuffled.length)
    
    for (let i = 0; i < defaultCount; i++) {
      this.recommendedGames.push({
        id: `rec_${Date.now()}_${i}`,
        gameId: shuffled[i].id,
        priority: i + 1,
        isActive: true,
        addedDate: new Date().toISOString().split('T')[0]
      })
    }
    this.saveToStorage()
  }

  // 获取推荐游戏列表
  async getRecommendedGames(limit?: number): Promise<GameData[]> {
    const recommendations = await this.loadFromAPI()
    const activeRecommendations = recommendations
      .filter(rec => rec.isActive)
      .sort((a, b) => a.priority - b.priority)

    const gameIds = limit ? activeRecommendations.slice(0, limit) : activeRecommendations
    
    const games = await Promise.all(
      gameIds.map(rec => dataManager.getGameById(rec.gameId))
    )
    return games.filter((game): game is GameData => game !== null)
  }

  // 获取随机推荐游戏（当没有手动设置时）
  async getRandomRecommendedGames(limit: number = 8): Promise<GameData[]> {
    const allGames = await dataManager.getAllGames()
    const shuffled = allGames.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit)
  }

  // 获取混合推荐（手动 + 随机）
  async getMixedRecommendedGames(limit: number = 8): Promise<GameData[]> {
    const manualRecommendations = await this.getRecommendedGames()
    
    if (manualRecommendations.length >= limit) {
      return manualRecommendations.slice(0, limit)
    }

    // 如果手动推荐不够，用随机游戏补充
    const remainingCount = limit - manualRecommendations.length
    const allGames = await dataManager.getAllGames()
    const manualGameIds = manualRecommendations.map(game => game.id)
    const availableGames = allGames.filter(game => !manualGameIds.includes(game.id))
    const randomGames = availableGames
      .sort(() => Math.random() - 0.5)
      .slice(0, remainingCount)

    return [...manualRecommendations, ...randomGames]
  }

  // 管理功能
  async getAllRecommendations(): Promise<RecommendedGame[]> {
    const recommendations = await this.loadFromAPI()
    return recommendations.sort((a, b) => a.priority - b.priority)
  }

  async addRecommendedGame(gameId: string, priority?: number): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, priority })
      })
      return response.ok
    } catch (error) {
      console.error('Error adding recommendation:', error)
      return false
    }
  }

  async removeRecommendedGame(recommendationId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId })
      })
      return response.ok
    } catch (error) {
      console.error('Error removing recommendation:', error)
      return false
    }
  }

  async updateRecommendedGame(recommendationId: string, updates: Partial<Pick<RecommendedGame, 'priority' | 'isActive'>>): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, updates })
      })
      return response.ok
    } catch (error) {
      console.error('Error updating recommendation:', error)
      return false
    }
  }

  reorderRecommendedGames(newOrder: string[]): boolean {
    try {
      newOrder.forEach((id, index) => {
        const recommendation = this.recommendedGames.find(rec => rec.id === id)
        if (recommendation) {
          recommendation.priority = index + 1
        }
      })
      this.saveToStorage()
      return true
    } catch (error) {
      return false
    }
  }

  async toggleRecommendedGame(recommendationId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/admin/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId, action: 'toggle' })
      })
      return response.ok
    } catch (error) {
      console.error('Error toggling recommendation:', error)
      return false
    }
  }

  // 测试兼容方法别名
  getActiveRecommendations(): RecommendedGame[] {
    return this.recommendedGames.filter(rec => rec.isActive)
  }

  async getRecommendationsForDisplay(limit?: number): Promise<GameData[]> {
    return await this.getRecommendedGames(limit)
  }

  addRecommendation(gameId: string, priority?: number): boolean {
    return this.addRecommendedGame(gameId, priority)
  }

  removeRecommendation(gameId: string): boolean {
    const recommendation = this.recommendedGames.find(rec => rec.gameId === gameId)
    if (!recommendation) return false
    return this.removeRecommendedGame(recommendation.id)
  }

  updateRecommendationPriority(gameId: string, newPriority: number): boolean {
    const recommendation = this.recommendedGames.find(rec => rec.gameId === gameId)
    if (!recommendation) return false
    return this.updateRecommendedGame(recommendation.id, { priority: newPriority })
  }

  toggleRecommendationStatus(gameId: string): boolean {
    const recommendation = this.recommendedGames.find(rec => rec.gameId === gameId)
    if (!recommendation) return false
    return this.updateRecommendedGame(recommendation.id, { isActive: !recommendation.isActive })
  }

  reorderRecommendations(gameIds: string[]): boolean {
    try {
      gameIds.forEach((gameId, index) => {
        const recommendation = this.recommendedGames.find(rec => rec.gameId === gameId)
        if (recommendation) {
          recommendation.priority = index + 1
        }
      })
      this.saveToStorage()
      return true
    } catch {
      return false
    }
  }

  moveRecommendationUp(gameId: string): boolean {
    const recommendation = this.recommendedGames.find(rec => rec.gameId === gameId)
    if (!recommendation || recommendation.priority <= 1) return false
    
    const newPriority = recommendation.priority - 1
    return this.updateRecommendedGame(recommendation.id, { priority: newPriority })
  }

  moveRecommendationDown(gameId: string): boolean {
    const recommendation = this.recommendedGames.find(rec => rec.gameId === gameId)
    if (!recommendation) return false
    
    const maxPriority = Math.max(...this.recommendedGames.map(r => r.priority))
    if (recommendation.priority >= maxPriority) return false
    
    const newPriority = recommendation.priority + 1
    return this.updateRecommendedGame(recommendation.id, { priority: newPriority })
  }

  async getSmartRecommendations(limit: number = 8): Promise<GameData[]> {
    return await this.getMixedRecommendedGames(limit)
  }

  async getRecommendationsByCategory(category: string, limit?: number): Promise<GameData[]> {
    const allGames = await dataManager.getAllGames()
    const filteredGames = allGames.filter(game => game.category === category)
    return limit ? filteredGames.slice(0, limit) : filteredGames
  }

  async getRecommendationsByRating(minRating: number = 4.0, limit?: number): Promise<GameData[]> {
    const allGames = await dataManager.getAllGames()
    const filteredGames = allGames
      .filter(game => game.rating >= minRating)
      .sort((a, b) => b.rating - a.rating)
    return limit ? filteredGames.slice(0, limit) : filteredGames
  }

  async getRecommendationStats(): Promise<{ 
    total: number; 
    active: number; 
    inactive: number;
    totalRecommendations: number;
    activeRecommendations: number;
    inactiveRecommendations: number;
    categoryDistribution: Record<string, number>;
  }> {
    const total = this.recommendedGames.length
    const active = this.recommendedGames.filter(rec => rec.isActive).length
    const inactive = total - active
    const categoryDistribution = await this.getCategoryDistribution()
    return { 
      total, 
      active, 
      inactive,
      totalRecommendations: total,
      activeRecommendations: active,
      inactiveRecommendations: inactive,
      categoryDistribution
    }
  }

  async getCategoryDistribution(): Promise<Record<string, number>> {
    const distribution: Record<string, number> = {}
    await Promise.all(
      this.recommendedGames.map(async (rec) => {
        const game = await dataManager.getGameById(rec.gameId)
        if (game) {
          distribution[game.category] = (distribution[game.category] || 0) + 1
        }
      })
    )
    return distribution
  }

  clearAllRecommendations(): boolean {
    this.recommendedGames = []
    this.saveToStorage()
    return true
  }

  activateAllRecommendations(): boolean {
    this.recommendedGames.forEach(rec => rec.isActive = true)
    this.saveToStorage()
    return true
  }

  deactivateAllRecommendations(): boolean {
    this.recommendedGames.forEach(rec => rec.isActive = false)
    this.saveToStorage()
    return true
  }
}

export const recommendedGamesManager = new RecommendedGamesManager()