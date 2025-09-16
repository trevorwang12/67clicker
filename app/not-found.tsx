"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Search, RefreshCw, Gamepad2, Star, Frown, Play } from "lucide-react"
import { dataManager } from "@/lib/data-manager"
import AdSlot from "@/components/SafeAdSlot"
import YouMightAlsoLike from "@/components/YouMightAlsoLike"

export default function NotFound() {
  const [searchTerm, setSearchTerm] = useState("")
  const [hotGames, setHotGames] = useState<any[]>([])
  const [newGames, setNewGames] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadGames = async () => {
      try {
        const hotGamesData = await dataManager.getHotGames(8)
        const newGamesData = await dataManager.getNewGames(8)
        setHotGames(hotGamesData)
        setNewGames(newGamesData)
      } catch (error) {
        console.error('Failed to load games:', error)
        setHotGames([])
        setNewGames([])
      }
    }

    loadGames()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-800">GAMES</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                Home
              </Link>
              <Link href="/new-games" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                New Games
              </Link>
              <Link href="/hot-games" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                Hot Games
              </Link>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md pl-3 pr-8 py-1 text-sm w-48 focus:outline-none focus:border-blue-600"
                />
                <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </form>
            </nav>
          </div>
        </div>
      </header>

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* 404 Error Section */}
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <div className="text-6xl">🎮</div>
              </div>
              
              <div className="mb-8">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Not Found!</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Oops! The page you're looking for seems to have vanished into the digital void. 
                  But don't worry - we've got plenty of awesome games to keep you entertained!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/">
                  <Button size="lg" className="px-8">
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => window.location.reload()}
                  className="px-8"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              </div>

              {/* Search Section */}
              <div className="max-w-md mx-auto mb-12">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Looking for something specific?
                </h3>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-600"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Hot Games Section */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🔥 Hot Games Right Now</h2>
                <p className="text-gray-600">These games are trending and loved by players worldwide!</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.isArray(hotGames) && hotGames.length > 0 ? hotGames.map((game, index) => (
                  <Link key={index} href={`/game/${game.id}`} className="group">
                    <Card className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative">
                          <img 
                            src={game.thumbnailUrl || "/placeholder.svg"} 
                            alt={game.name} 
                            className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" 
                          />
                          
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white rounded-full p-3">
                              <Play className="w-6 h-6 text-slate-600" />
                            </div>
                          </div>

                          {/* Hot Badge & Rating */}
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            <Badge className="bg-red-500 hover:bg-red-600 text-white">
                              🔥 HOT
                            </Badge>
                            <Badge className="bg-white text-slate-800">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              {game.rating}
                            </Badge>
                          </div>

                          {/* Ranking Badge */}
                          {index < 3 && (
                            <div className="absolute top-2 left-2">
                              <Badge className={`${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                'bg-orange-600'
                              } text-white font-bold`}>
                                #{index + 1}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold text-base text-center mb-3 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                            {game.name}
                          </h3>
                          <div className="flex items-center justify-center mt-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full group-hover:bg-slate-600 group-hover:text-white transition-colors"
                            >
                              <Play className="w-3 h-3 mr-2" />
                              Play Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-400 text-lg">Loading hot games...</div>
                  </div>
                )}
              </div>

              <div className="text-center mt-8">
                <Link href="/hot-games">
                  <Button variant="outline" size="lg">
                    View All Hot Games
                  </Button>
                </Link>
              </div>
            </div>

            {/* New Games Section */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">🆕 Latest Arrivals</h2>
                <p className="text-gray-600">Fresh games just added to our collection!</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.isArray(newGames) && newGames.length > 0 ? newGames.map((game, index) => (
                  <Link key={index} href={`/game/${game.id}`} className="group">
                    <Card className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative">
                          <img 
                            src={game.thumbnailUrl || "/placeholder.svg"} 
                            alt={game.name} 
                            className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" 
                          />
                          
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white rounded-full p-3">
                              <Play className="w-6 h-6 text-slate-600" />
                            </div>
                          </div>

                          {/* New Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500 hover:bg-green-600 text-white">
                              NEW
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-semibold text-base text-center mb-3 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                            {game.name}
                          </h3>
                          <div className="flex items-center justify-center mt-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full group-hover:bg-slate-600 group-hover:text-white transition-colors"
                            >
                              <Play className="w-3 h-3 mr-2" />
                              Play Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <div className="text-gray-400 text-lg">Loading new games...</div>
                  </div>
                )}
              </div>

              <div className="text-center mt-8">
                <Link href="/new-games">
                  <Button variant="outline" size="lg">
                    View All New Games
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 hidden lg:block">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/" className="block p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Homepage</span>
                  </div>
                </Link>
                <Link href="/hot-games" className="block p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Hot Games</span>
                  </div>
                </Link>
                <Link href="/new-games" className="block p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-5 h-5 text-green-500" />
                    <span className="font-medium">New Games</span>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Ad Slot - Sidebar Position */}
            <AdSlot position="sidebar" className="mt-6" />
          </div>
        </div>
      </div>

      {/* You Might Also Like Section */}
      <YouMightAlsoLike />

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-bold text-gray-800">GAMES</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Best Online Gaming Platform</p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm">
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About Us
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact Us
              </Link>
            </nav>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-4 text-center text-sm text-gray-500">
            <p>&copy; 2025 GAMES. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}