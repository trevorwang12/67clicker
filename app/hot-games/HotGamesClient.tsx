"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Play, Star, Calendar, Gamepad2 } from "lucide-react"
import { dataManager } from "@/lib/data-manager"
import AdSlot from "@/components/SafeAdSlot"
import YouMightAlsoLike from "@/components/YouMightAlsoLike"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function HotGamesPage() {
  const [hotGames, setHotGames] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const loadHotGames = async () => {
      try {
        const hotGamesData = await dataManager.getHotGames(20)
        setHotGames(hotGamesData)
      } catch (error) {
        console.error('Failed to load hot games:', error)
        setHotGames([])
      }
    }

    loadHotGames()

    const handleGamesUpdate = () => {
      loadHotGames()
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
      <Header />

      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto p-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Hot Games</h1>
          <p className="text-lg text-slate-600">
            Discover the most popular games on our platform, loved by millions of players
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              {hotGames.length} Hot Games
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {isClient && Array.isArray(hotGames) && hotGames.length > 0 ? (
            hotGames.map((game, index) => (
              <Link key={index} href={`/game/${game.id}`}>
                <Card className="overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group h-full flex flex-col">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative">
                      <img
                        src={game.thumbnailUrl || "/placeholder.svg"}
                        alt={game.name}
                        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                      />

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white rounded-full p-3">
                          <Play className="w-6 h-6 text-slate-600" />
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">
                          🔥 HOT
                        </Badge>
                        <Badge className="bg-white text-slate-800">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {game.rating}
                        </Badge>
                      </div>

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
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No hot games available at the moment.</p>
            </div>
          )}
        </div>

        <div className="mt-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Most Popular Games</h3>
              <p className="text-gray-600 mb-4">
                These games are ranked by popularity based on player engagement and ratings
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <Badge variant="outline">High Ratings</Badge>
                <Badge variant="outline">Most Played</Badge>
                <Badge variant="outline">Player Favorites</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-6">Explore Other Categories</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/new-games">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                New Games
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

      <YouMightAlsoLike />
      <Footer />
    </div>
  )
}