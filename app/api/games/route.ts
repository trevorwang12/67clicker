import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const page = searchParams.get('page')
    const category = searchParams.get('category')
    const lightweight = searchParams.get('lightweight') // 新增：轻量级模式

    // 优先使用轻量级数据——减少传输量的关键
    const allGames = lightweight === 'true'
      ? await DataService.getLightweightGames()
      : await DataService.getAllGames()

    // Filter active games
    let activeGames = allGames.filter((game: any) => game.isActive)

    // Filter by category if provided
    if (category) {
      activeGames = activeGames.filter((game: any) =>
        game.category?.toLowerCase() === category.toLowerCase()
      )
    }

    // Implement pagination
    if (limit || page) {
      const limitNum = parseInt(limit || '20')
      const pageNum = parseInt(page || '1')
      const startIndex = (pageNum - 1) * limitNum
      const endIndex = startIndex + limitNum

      const paginatedGames = activeGames.slice(startIndex, endIndex)

      return NextResponse.json({
        games: paginatedGames,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: activeGames.length,
          totalPages: Math.ceil(activeGames.length / limitNum)
        }
      })
    }

    // 默认返回轻量级数据，已经在DataService中过滤
    return NextResponse.json(activeGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json([], { status: 200 })
  }
}