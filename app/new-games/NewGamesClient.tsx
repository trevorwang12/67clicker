"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Play, Gamepad2, Star, Search } from "lucide-react"
import { dataManager } from "@/lib/data-manager"
import AdSlot from "@/components/SafeAdSlot"
import YouMightAlsoLike from "@/components/YouMightAlsoLike"
import InstantSearch from "@/components/InstantSearch"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function NewGamesPage() {
  const [newGames, setNewGames] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true)

    const loadNewGames = async () => {
      try {
        const games = await dataManager.getNewGames(20)
        setNewGames(games || [])
      } catch (error) {
        console.error('Failed to load new games:', error)
        setNewGames([])
      }
    }

    loadNewGames()

    // Listen for games updates
    const handleGamesUpdate = () => {
      loadNewGames()
    }

    window.addEventListener('gamesUpdated', handleGamesUpdate)
    window.addEventListener('storage', handleGamesUpdate)

    return () => {
      window.removeEventListener('gamesUpdated', handleGamesUpdate)
      window.removeEventListener('storage', handleGamesUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto p-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Latest Games</h2>
          <p className="text-lg text-slate-600">
            Discover the newest games on our platform with cutting-edge gameplay and creative design
          </p>
        </div>


        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isClient && Array.isArray(newGames) && newGames.map((game, index) => (
            <Link key={index} href={`/game/${game.id}`}>
              <Card className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group h-full flex flex-col">
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
          ))}
        </div>

        {/* Load More Section */}
        <div className="text-center mt-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">More New Games Coming Soon</h3>
              <p className="text-gray-600 mb-4">
                We regularly add new games to our platform. Check back often for the latest releases!
              </p>
              <Link href="/">
                <Button>
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  Browse All Games
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Categories Navigation */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-6">Explore Other Categories</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/hot-games">
              <Button variant="outline" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Hot Games
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                All Games
              </Button>
            </Link>
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