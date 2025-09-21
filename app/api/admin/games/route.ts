import { NextRequest, NextResponse } from 'next/server'
import { GameData } from '@/lib/data-manager'
import defaultGames from '@/data/games.json'
import { promises as fs } from 'fs'
import path from 'path'
import { createAdminResponse, logAdminAccess } from '@/lib/admin-security'

// 内存中的游戏数据，服务重启后会恢复默认值
let gamesData: GameData[] = defaultGames as GameData[]

// 从文件加载最新数据
async function loadFromFile(): Promise<GameData[]> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'games.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const loadedData = JSON.parse(fileContent)
    console.log('Games data loaded from file:', filePath)
    return loadedData
  } catch (error) {
    console.log('Failed to load games data from file, using default:', error)
    return defaultGames as GameData[]
  }
}

// 将数据保存到 JSON 文件
async function saveToFile(data: GameData[]) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'games.json')
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    console.log('Games data saved to file:', filePath)
  } catch (error) {
    console.error('Failed to save games data to file:', error)
    // 不抛出错误，让内存更新继续进行
  }
}


export async function GET() {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/games', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }
  
  try {
    logAdminAccess('/api/admin/games', true)
    gamesData = await loadFromFile()
    return NextResponse.json(gamesData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/games', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }
  
  try {
    logAdminAccess('/api/admin/games', true)
    // Load latest data from file before making changes
    gamesData = await loadFromFile()
    
    const newGame: GameData = await request.json()
    
    // Add the new game
    gamesData.push(newGame)
    await saveToFile(gamesData)
    
    return NextResponse.json(newGame, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add game' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/games', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }
  
  try {
    logAdminAccess('/api/admin/games', true)
    // Load latest data from file before making changes
    gamesData = await loadFromFile()
    
    const { gameId, updates } = await request.json()
    
    const gameIndex = gamesData.findIndex(g => g.id === gameId)
    if (gameIndex === -1) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    gamesData[gameIndex] = { ...gamesData[gameIndex], ...updates }
    await saveToFile(gamesData)
    
    return NextResponse.json(gamesData[gameIndex])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/games', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  try {
    logAdminAccess('/api/admin/games', true)
    // Load latest data from file before making changes
    gamesData = await loadFromFile()

    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('id')

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    const gameIndex = gamesData.findIndex(g => g.id === gameId)

    if (gameIndex === -1) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Remove the game completely
    gamesData.splice(gameIndex, 1)
    await saveToFile(gamesData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete game:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
}