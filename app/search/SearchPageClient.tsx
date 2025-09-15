"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Play, Star, ArrowLeft, Gamepad2 } from "lucide-react"
import { simpleSearch, GameData } from "@/lib/simple-search"
import { getGameImageAlt } from '@/lib/image-utils'
import AdSlot from "@/components/SafeAdSlot"
import PageH1 from "@/components/PageH1"
import YouMightAlsoLike from "@/components/YouMightAlsoLike"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchTerm, setSearchTerm] = useState(query)
  const [searchResults, setSearchResults] = useState<GameData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query) {
      setSearchTerm(query)
      performSearch(query)
    }
  }, [query])

  const performSearch = async (term: string) => {
    setIsLoading(true)
    try {
      console.log('Performing search for:', term)
      const results = await simpleSearch.searchGames(term)
      console.log('Search results:', results.length, 'games found')
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      performSearch(searchTerm.trim())
      // 更新URL
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  const [hotGames, setHotGames] = useState<GameData[]>([])
  const [newGames, setNewGames] = useState<GameData[]>([])

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const hot = await simpleSearch.getHotGames(8)
        const newest = await simpleSearch.getNewGames(8)
        setHotGames(hot)
        setNewGames(newest)
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }
    loadInitialData()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />
      
      {/* Page H1 - SEO优化的主标题 */}
      <PageH1 
        pageType="homepage" 
        template="Search Games - {siteName}"
        data={{ siteName: 'GAMES' }} 
      />

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Back Button & Search Info */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
              
              {query && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Search Results for "{query}"
                  </h2>
                  <p className="text-gray-600">
                    {isLoading ? 'Searching...' : `Found ${searchResults.length} games`}
                  </p>
                </div>
              )}
            </div>

            {/* Search Results */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Searching games...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {searchResults.map((game: any, index) => (
                    <Link key={index} href={`/game/${game.id}`} className="group">
                      <Card className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer h-full flex flex-col">
                        <CardContent className="p-0 flex flex-col h-full">
                          <div className="relative">
                            <img 
                              src={game.thumbnailUrl || "/placeholder.svg"} 
                              alt={getGameImageAlt(game)} 
                              className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" 
                            />
                            
                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-white rounded-full p-3">
                                <Play className="w-6 h-6 text-slate-600" />
                              </div>
                            </div>

                            {/* Rating Badge */}
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-white text-slate-800">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {game.rating}
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
                  ))}
                </div>
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-500 mb-2">No Games Found</h2>
                <p className="text-gray-400 mb-6">Try different keywords or browse our popular games below</p>
                <Link href="/">
                  <Button>
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Browse All Games
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Search for Games</h2>
                <p className="text-gray-600 mb-6">Enter keywords in the search box above to find your favorite games</p>
              </div>
            )}

            {/* Hot Games Recommendations */}
            {(searchResults.length === 0 || query) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">🔥 Hot Games</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {hotGames.slice(0, 8).map((game, index) => (
                    <Link key={index} href={`/game/${game.id}`} className="group">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden flex-shrink-0">
                          <img 
                            src={game.thumbnailUrl || "/placeholder.svg"} 
                            alt={game.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-3 flex-grow flex items-start">
                          <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight">{game.name}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Games Recommendations */}
            {(searchResults.length === 0 || query) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">🆕 New Games</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newGames.slice(0, 8).map((game, index) => (
                    <Link key={index} href={`/game/${game.id}`} className="group">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden flex-shrink-0">
                          <img 
                            src={game.thumbnailUrl || "/placeholder.svg"} 
                            alt={game.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="p-3 flex-grow flex items-start">
                          <h3 className="font-medium text-sm text-gray-800 line-clamp-2 leading-tight">{game.name}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Hot Games */}
          <div className="w-80 hidden lg:block">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Popular Searches</h3>
              <div className="space-y-2">
                {['action', 'puzzle', 'adventure', 'racing', 'arcade', 'strategy'].map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchTerm(tag)
                      performSearch(tag)
                      window.history.pushState({}, '', `/search?q=${encodeURIComponent(tag)}`)
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </button>
                ))}
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
      <Footer />
    </div>
  )
}