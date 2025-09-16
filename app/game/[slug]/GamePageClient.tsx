"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Star, Play, Users, Tag, Calendar, Gamepad2 } from "lucide-react"
import { dataManager } from "@/lib/data-manager"
import GamePlayer from "@/components/GamePlayer"
import PageH1 from "@/components/PageH1"
import AdSlot from "@/components/SafeAdSlot"
import YouMightAlsoLike from "@/components/YouMightAlsoLike"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

interface GamePageClientProps {
  params: { slug: string }
}

export default function GamePageClient({ params }: GamePageClientProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [relatedGames, setRelatedGames] = useState<any[]>([])
  const [game, setGame] = useState<any>(null)
  const [gameLoading, setGameLoading] = useState(false)
  const [loadingTipIndex, setLoadingTipIndex] = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [hotGames, setHotGames] = useState<any[]>([])
  const [newGames, setNewGames] = useState<any[]>([])
  
  const loadingTips = [
    "💡 Pro tip: Use arrow keys or WASD for better control!",
    "🎮 Did you know? This game supports multiple control schemes!",
    "⚡ Loading awesome graphics and smooth gameplay...",
    "🌟 Get ready for an epic gaming adventure!",
    "🎯 Tip: Check your internet connection for best experience!",
    "🚀 Preparing the ultimate gaming experience for you..."
  ]
  
  // Track client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  useEffect(() => {
    if (!isMounted) return
    
    const loadGame = async () => {
      try {
        await dataManager.getAllGames()
        const gameData = await dataManager.getGameById(params.slug)
        setGame(gameData)
        
        if (gameData) {
          // 更新访问量
          dataManager.updateGameViews(params.slug)
          
          // 获取相关游戏
          const related = await dataManager.getRelatedGames(params.slug, 6)
          setRelatedGames(related)
        }
      } catch (error) {
        console.error('Error loading game:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    
    loadGame()
  }, [params.slug, isMounted])
  
  // Cycle through loading tips
  useEffect(() => {
    if (gameLoading) {
      const interval = setInterval(() => {
        setLoadingTipIndex(prev => (prev + 1) % loadingTips.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [gameLoading, loadingTips.length])

  // Load games data in useEffect
  useEffect(() => {
    const loadGamesData = async () => {
      try {
        const hotGamesData = await dataManager.getHotGames(8)
        const newGamesData = await dataManager.getNewGames(8)
        setHotGames(hotGamesData)
        setNewGames(newGamesData)
      } catch (error) {
        console.error('Failed to load games data:', error)
        setHotGames([])
        setNewGames([])
      }
    }

    loadGamesData()
  }, [])

  // Show loading state during initial load
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
            </div>
            <div className="text-xl font-semibold mb-2">Loading Game...</div>
            <p className="text-gray-600">Please wait while we load the game for you.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error only after loading is complete and no game found
  if (!game) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
            <p className="text-gray-600 mb-4">Sorry, we couldn't find the game you're looking for.</p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const startGame = async () => {
    setGameLoading(true)
    dataManager.updateGamePlays(params.slug)
    
    // Simulate game loading time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setGameLoading(false)
    setIsPlaying(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Game Player */}
            <div className="mb-8">
              {isPlaying ? (
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-auto">
                  <GamePlayer 
                    gameUrl={game.gameUrl}
                    gameName={game.name}
                    gameId={game.id}
                    allowFullscreen={true}
                    showControls={true}
                  />
                </div>
              ) : gameLoading ? (
                <div className={`bg-gradient-to-r ${game.gradient || 'from-orange-400 to-pink-500'} rounded-lg text-white h-[600px] flex items-center justify-center relative overflow-hidden`}>
                  {/* Floating Background Elements */}
                  <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full opacity-30 animate-bounce"></div>
                  <div className="absolute top-32 right-20 w-24 h-24 bg-white/20 rounded-full opacity-40 animate-pulse"></div>
                  <div className="absolute bottom-20 left-32 w-28 h-28 bg-white/15 rounded-full opacity-30 animate-ping"></div>
                  
                  <div className="relative z-10 text-center">
                    {/* Main Loading Animation */}
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto relative">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                        
                        {/* Inner dots */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dynamic Loading Text */}
                    <div className="space-y-4">
                      <h2 className="text-3xl font-bold animate-pulse">
                        Loading {game.name}...
                      </h2>
                      <p className="text-white/90 text-lg animate-pulse">
                        Preparing your gaming experience!
                      </p>
                      
                      {/* Progress bar */}
                      <div className="w-80 mx-auto bg-white/20 rounded-full h-3 mt-6">
                        <div className="bg-white h-3 rounded-full animate-pulse w-full"></div>
                      </div>
                      
                      {/* Dynamic loading tips */}
                      <div className="mt-8 p-6 bg-white/10 rounded-xl backdrop-blur-sm max-w-md mx-auto">
                        <p className="text-white font-medium text-lg animate-pulse">
                          {loadingTips[loadingTipIndex]}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`bg-gradient-to-r ${game.gradient || 'from-orange-400 to-pink-500'} rounded-lg text-white h-[600px] flex flex-col items-center justify-center text-center`}>
                  <div className="w-48 h-48 bg-white/20 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
                    <img 
                      src={game.thumbnailUrl || "/placeholder.svg"} 
                      alt={`${game.name} - Play this exciting game online for free`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-4xl font-bold mb-4 max-w-md">{game.name}</h1>
                  <p className="mb-8 opacity-90 text-lg max-w-lg px-4">
                    {game.gradientDescription || (game.description && game.description.length > 100 
                      ? game.description.substring(0, 100) + '...' 
                      : game.description)}
                  </p>
                  <Button 
                    onClick={startGame}
                    className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    PLAY NOW
                  </Button>
                </div>
              )}
            </div>

            {/* Game Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              {/* Back Button */}
              <div className="mb-4">
                <Link 
                  href="/"
                  className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Link>
              </div>


              {/* Game Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span className="font-medium">{game.rating || '4.5'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Play className="w-4 h-4 mr-1 text-blue-500" />
                  <span>{game.playCount || 0} plays</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-1 text-green-500" />
                  <span>{game.viewCount || 0} views</span>
                </div>
                {game.category && (
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-1 text-purple-500" />
                    <Badge variant="outline" className="text-purple-600 border-purple-200">
                      {game.category}
                    </Badge>
                  </div>
                )}
                {game.addedDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                    <span>Added {new Date(game.addedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Game Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">About This Game</h2>
                <div className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&>p]:mb-4 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>blockquote]:mb-4 [&>hr]:my-6">
                  <ReactMarkdown>{game.description || ''}</ReactMarkdown>
                </div>
              </div>

              {/* Game Instructions */}
              {game.instructions && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Play</h3>
                  <div className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&>p]:mb-4 [&>h1]:mb-4 [&>h2]:mb-4 [&>h3]:mb-4 [&>ul]:mb-4 [&>ol]:mb-4 [&>blockquote]:mb-4 [&>hr]:my-6">
                    <ReactMarkdown>{game.instructions}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Tags */}
              {game.tags && game.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ad Slot - Game Details Bottom Position */}
            <AdSlot position="content-bottom" className="mb-8" />

            {/* Related Games */}
            {relatedGames.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Games</h2>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {relatedGames.map((relatedGame) => (
                    <Link 
                      key={relatedGame.id} 
                      href={`/game/${relatedGame.id}`}
                      className="group block"
                    >
                      <Card className="border border-gray-200 hover:border-orange-300 transition-colors group-hover:shadow-md">
                        <CardContent className="p-2">
                          <div className="aspect-square mb-2 rounded overflow-hidden bg-gray-100 relative">
                            <img 
                              src={relatedGame.thumbnailUrl || "/placeholder.svg"} 
                              alt={relatedGame.name}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform absolute inset-0"
                              style={{ aspectRatio: '1/1' }}
                            />
                          </div>
                          <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2 leading-tight">
                            {relatedGame.name}
                          </h3>
                          <div className="flex items-center justify-center text-xs text-gray-600">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 mr-1 text-yellow-500" />
                              {relatedGame.rating || '4.5'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            {/* Hot Games */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Hot games</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(hotGames) && hotGames.length > 0 ? hotGames.map((hotGame, index) => (
                  <Link key={index} href={`/game/${hotGame.id}`} className="group">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative flex-shrink-0">
                        <img 
                          src={hotGame.thumbnailUrl || "/placeholder.svg"} 
                          alt={hotGame.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-1 right-1">
                          <Badge className="bg-orange-500 text-white text-xs px-1 py-0.5">
                            ⭐{hotGame.rating}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 flex-grow flex items-start">
                        <h3 className="font-medium text-xs text-gray-800 line-clamp-2 leading-tight">{hotGame.name}</h3>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-2 text-center py-4">
                    <div className="text-gray-400 text-sm">Loading hot games...</div>
                  </div>
                )}
              </div>
            </div>

            {/* New Games */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-bold mb-6 text-gray-800">New games 新游戏</h3>
              <div className="grid grid-cols-2 gap-3">
                {Array.isArray(newGames) && newGames.length > 0 ? newGames.map((newGame, index) => (
                  <Link key={index} href={`/game/${newGame.id}`} className="group">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative flex-shrink-0">
                        <img 
                          src={newGame.thumbnailUrl || "/placeholder.svg"} 
                          alt={newGame.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-1 right-1">
                          <Badge className="bg-green-500 text-white text-xs px-1 py-0.5">
                            NEW
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 flex-grow flex items-start">
                        <h3 className="font-medium text-xs text-gray-800 line-clamp-2 leading-tight">{newGame.name}</h3>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-2 text-center py-4">
                    <div className="text-gray-400 text-sm">Loading new games...</div>
                  </div>
                )}
              </div>
            </div>

            {/* Ad Slot - Sidebar Position */}
            <AdSlot position="sidebar" className="mb-6" />
          </div>
        </div>
      </div>

      {/* You Might Also Like Section */}
      <YouMightAlsoLike />

      {/* Footer */}
      <Footer />
    </div>
  )
}