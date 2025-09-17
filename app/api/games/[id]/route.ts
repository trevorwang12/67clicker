import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    // 使用新的按需加载方法，避免加载整个games.json
    const game = await DataService.getGameById(gameId)

    if (!game || !game.isActive) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Return full game details for single game requests
    return NextResponse.json(game)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}