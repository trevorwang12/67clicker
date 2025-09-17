import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// 基于homepage-optimized的经验，创建featured games的优化版本
// "If it's stupid but it works, it isn't stupid." - Linus principles applied

interface FeaturedGame {
  id: string
  title: string
  description: string
  image: string
  gameUrl: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  hasLargeImage?: boolean
  originalImageSize?: number
}

// 优化featured game数据的函数 - 移除大型base64图片
function optimizeFeaturedGameData(game: any) {
  const optimized = { ...game }

  // 处理base64图片 - 致命的性能杀手
  if (optimized.image && optimized.image.startsWith('data:image')) {
    const imageSize = optimized.image.length

    if (imageSize > 10000) { // 大于10KB的base64
      console.warn(`Large base64 image detected in featured game: ${Math.round(imageSize / 1024)}KB for game ${game.title}`)

      // 用轻量级占位符替换
      optimized.image = `data:image/svg+xml;base64,${Buffer.from(
        `<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#e5e7eb"/>
          <text x="50%" y="45%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="system-ui" font-size="16" font-weight="600">
            ${game.title || 'Featured Game'}
          </text>
          <text x="50%" y="60%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="12">
            Click to load image
          </text>
        </svg>`
      ).toString('base64')}`

      // 标记为需要懒加载
      optimized.hasLargeImage = true
      optimized.originalImageSize = Math.round(imageSize / 1024)
    }
  }

  return optimized
}

function getDefaultFeaturedGames(): FeaturedGame[] {
  return []
}

async function loadFromFile(): Promise<FeaturedGame[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'featured-games.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const loadedData = JSON.parse(fileContent)
    console.log('Featured games data loaded from file for optimization:', filePath)
    return loadedData
  } catch (error) {
    console.log('Failed to load featured games data from file, using default:', error)
    return getDefaultFeaturedGames()
  }
}

export async function GET() {
  try {
    const featuredGames = await loadFromFile()

    // 只返回活跃的featured games并且优化它们
    const optimizedFeaturedGames = featuredGames
      .filter(game => game.isActive)
      .sort((a, b) => a.order - b.order)
      .map(optimizeFeaturedGameData) // 关键：优化图片数据

    // 统计优化效果
    const originalSize = JSON.stringify(featuredGames.filter(g => g.isActive)).length
    const optimizedSize = JSON.stringify(optimizedFeaturedGames).length
    const reduction = Math.round((1 - optimizedSize / originalSize) * 100)

    console.log(`Featured games optimization: ${Math.round(originalSize / 1024)}KB -> ${Math.round(optimizedSize / 1024)}KB (${reduction}% reduction)`)

    return NextResponse.json(optimizedFeaturedGames, {
      headers: {
        'Cache-Control': 'public, max-age=600, s-maxage=1200', // 20分钟缓存
        'Content-Type': 'application/json',
        'X-Performance-Optimized': 'true',
        'X-Original-Size': `${Math.round(originalSize / 1024)}KB`,
        'X-Optimized-Size': `${Math.round(optimizedSize / 1024)}KB`,
        'X-Reduction': `${reduction}%`
      }
    })
  } catch (error) {
    console.error('GET featured games optimized error:', error)
    return NextResponse.json(getDefaultFeaturedGames(), { status: 200 })
  }
}