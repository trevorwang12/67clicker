import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

// 专门为首页设计的轻量级API - 解决base64图片载荷问题
// "The enemy of performance is not slow hardware, it's bad software." - Linus

// 优化游戏数据的函数 - 移除大型base64图片
function optimizeGameData(game: any) {
  const optimized = { ...game }

  // 处理base64图片 - 1.1MB的base64图片是性能杀手
  if (optimized.thumbnailUrl && optimized.thumbnailUrl.startsWith('data:image')) {
    const imageSize = optimized.thumbnailUrl.length

    if (imageSize > 10000) { // 大于10KB的base64
      console.warn(`Large base64 image detected: ${Math.round(imageSize / 1024)}KB for game ${game.name}`)

      // 用轻量级占位符替换
      optimized.thumbnailUrl = `data:image/svg+xml;base64,${Buffer.from(
        `<svg width="285" height="202" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
            ${game.name || 'Loading...'}
          </text>
        </svg>`
      ).toString('base64')}`

      // 标记为需要懒加载
      optimized.hasLargeImage = true
      optimized.originalImageSize = Math.round(imageSize / 1024)
    }
  }

  // 只保留首页必需的字段
  return {
    id: optimized.id,
    name: optimized.name,
    thumbnailUrl: optimized.thumbnailUrl,
    category: optimized.category,
    rating: optimized.rating,
    viewCount: optimized.viewCount || 0,
    addedDate: optimized.addedDate,
    hasLargeImage: optimized.hasLargeImage,
    originalImageSize: optimized.originalImageSize
  }
}

export async function GET() {
  try {
    // 并行获取数据，减少等待时间
    const [lightGames, homepageContent, featuredGames] = await Promise.all([
      DataService.getLightweightGames(),
      DataService.getHomepageContent(),
      DataService.getFeaturedGames()
    ])

    const activeGames = lightGames.filter(game => game.isActive)

    // 在服务端完成所有数据处理，去除性能杀手
    const homePageData = {
      hotGames: activeGames
        .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
        .slice(0, 8)
        .map(optimizeGameData), // 关键：优化图片数据
      newGames: activeGames
        .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
        .slice(0, 8)
        .map(optimizeGameData), // 关键：优化图片数据
      featuredGame: featuredGames
        .filter(game => game.isActive)
        .sort((a, b) => a.order - b.order)[0] || null,
      homepageContent: {
        newGames: homepageContent.newGames,
        features: homepageContent.features,
        gameGallery: homepageContent.gameGallery,
        youMightAlsoLike: homepageContent.youMightAlsoLike
      },
      // 性能统计
      stats: {
        totalGames: activeGames.length,
        optimizedImages: activeGames.filter(g => g.thumbnailUrl?.startsWith('data:image') && g.thumbnailUrl.length > 10000).length,
        responseOptimized: true
      }
    }

    return NextResponse.json(homePageData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 10分钟缓存
        'Content-Type': 'application/json',
        'X-Performance-Optimized': 'true', // 调试标记
      }
    })
  } catch (error) {
    console.error('Homepage API error:', error)
    return NextResponse.json({
      hotGames: [],
      newGames: [],
      featuredGame: null,
      homepageContent: {},
      stats: { error: true }
    }, { status: 200 })
  }
}