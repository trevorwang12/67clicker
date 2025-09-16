import { NextResponse } from 'next/server'
import { DataService } from '@/lib/data-service'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id

    // Get all games (cached by DataService)
    const allGames = await DataService.getAllGames()

    // Find the specific game
    const game = allGames.find((g: any) => g.id === gameId && g.isActive)

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Return full game details for single game requests
    return NextResponse.json(game)
  } catch (error) {
    console.error('Error fetching game:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}