import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const page = searchParams.get('page')
    const category = searchParams.get('category')

    // Use DataService for proper file reading and caching
    const allGames = await DataService.getAllGames()

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

    // Return only essential fields for listings
    const lightweightGames = activeGames.map((game: any) => ({
      id: game.id,
      name: game.name,
      thumbnailUrl: game.thumbnailUrl,
      category: game.category,
      tags: game.tags?.slice(0, 3), // Only first 3 tags
      rating: game.rating,
      viewCount: game.viewCount || game.views || 0,  // Ensure viewCount field exists
      addedDate: game.addedDate,  // Required for New games sorting
      isActive: game.isActive,
      isFeatured: game.isFeatured
    }))

    return NextResponse.json(lightweightGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json([], { status: 200 })
  }
}