interface GameData {
  name: string
  category?: string
  description?: string
}

/**
 * 生成描述性的 alt 文本，避免与链接文字重复
 * 遵循无障碍最佳实践
 */
export function getGameImageAlt(game: GameData): string {
  if (game.category) {
    return `${game.category} game screenshot`
  }

  // 如果有描述，提取关键词
  if (game.description) {
    const description = game.description.toLowerCase()
    if (description.includes('puzzle')) return 'Puzzle game screenshot'
    if (description.includes('action')) return 'Action game screenshot'
    if (description.includes('adventure')) return 'Adventure game screenshot'
    if (description.includes('strategy')) return 'Strategy game screenshot'
    if (description.includes('arcade')) return 'Arcade game screenshot'
    if (description.includes('simulation')) return 'Simulation game screenshot'
    if (description.includes('racing')) return 'Racing game screenshot'
    if (description.includes('sports')) return 'Sports game screenshot'
    if (description.includes('rpg') || description.includes('role')) return 'RPG game screenshot'
  }

  return 'Game screenshot'
}

/**
 * 生成游戏卡片的 alt 文本
 */
export function getGameCardAlt(game: GameData): string {
  return getGameImageAlt(game)
}

/**
 * 生成缩略图的 alt 文本
 */
export function getGameThumbnailAlt(game: GameData): string {
  return `${getGameImageAlt(game)} thumbnail`
}