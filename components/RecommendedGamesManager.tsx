"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Trash2, ToggleLeft, ToggleRight, ArrowUp, ArrowDown, GripVertical } from "lucide-react"
import OptimizedImage from '@/components/OptimizedImage'
import { recommendedGamesManager } from '@/lib/recommended-games-manager'
import { dataManager, GameData } from '@/lib/data-manager'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  CSS,
} from '@dnd-kit/utilities'

interface RecommendedGame {
  id: string
  gameId: string
  priority: number
  isActive: boolean
  addedDate: string
}

// Sortable Item Component for Recommended Games
function SortableRecommendedGame({ 
  recommendation, 
  game,
  handleToggleRecommendedGame,
  handleRemoveRecommendedGame,
  handleMovePriority
}: { 
  recommendation: RecommendedGame,
  game: GameData,
  handleToggleRecommendedGame: (id: string) => void,
  handleRemoveRecommendedGame: (id: string) => void,
  handleMovePriority: (id: string, direction: 'up' | 'down') => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recommendation.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center gap-4 p-4 border rounded-lg bg-white"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <OptimizedImage
        src={game.thumbnailUrl || '/placeholder.svg'}
        alt={game.name}
        className="w-16 h-16 rounded"
        width={64}
        height={64}
      />
      <div className="flex-1">
        <h3 className="font-medium">{game.name}</h3>
        <p className="text-sm text-gray-600">
          Priority: {recommendation.priority} | Added: {recommendation.addedDate}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={recommendation.isActive ? "default" : "secondary"}>
          {recommendation.isActive ? "Active" : "Inactive"}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMovePriority(recommendation.id, 'up')}
          disabled={recommendation.priority === 1}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleMovePriority(recommendation.id, 'down')}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleToggleRecommendedGame(recommendation.id)}
        >
          {recommendation.isActive ? (
            <ToggleRight className="w-4 h-4 text-green-600" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-gray-400" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveRecommendedGame(recommendation.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function RecommendedGamesManager() {
  const [recommendedGames, setRecommendedGames] = useState<RecommendedGame[]>([])
  const [availableGames, setAvailableGames] = useState<GameData[]>([])
  const [mixedRecommendations, setMixedRecommendations] = useState<GameData[]>([])
  const [gameDataMap, setGameDataMap] = useState<Map<string, GameData>>(new Map())
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const recommendations = await recommendedGamesManager.getAllRecommendations()
    setRecommendedGames(recommendations)
    
    const allGames = await dataManager.getAllGames()
    setAvailableGames(allGames)
    
    // Create a map for quick game lookups
    const gameMap = new Map<string, GameData>()
    allGames.forEach(game => gameMap.set(game.id, game))
    setGameDataMap(gameMap)
    
    const mixed = await recommendedGamesManager.getMixedRecommendedGames(8)
    setMixedRecommendations(mixed)
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleAddRecommendedGame = async () => {
    if (!selectedGameId) {
      showAlert('error', 'Please select a game')
      return
    }

    const success = await recommendedGamesManager.addRecommendedGame(selectedGameId)
    if (success) {
      showAlert('success', 'Game added to recommendations')
      loadData()
      setSelectedGameId('')
      setIsDialogOpen(false)
    } else {
      showAlert('error', 'Game is already recommended or does not exist')
    }
  }

  const handleRemoveRecommendedGame = async (recommendationId: string) => {
    const success = await recommendedGamesManager.removeRecommendedGame(recommendationId)
    if (success) {
      showAlert('success', 'Game removed from recommendations')
      loadData()
    } else {
      showAlert('error', 'Failed to remove recommendation')
    }
  }

  const handleToggleRecommendedGame = async (recommendationId: string) => {
    const success = await recommendedGamesManager.toggleRecommendedGame(recommendationId)
    if (success) {
      showAlert('success', 'Recommendation status updated')
      loadData()
    } else {
      showAlert('error', 'Failed to update recommendation')
    }
  }

  const handleMovePriority = async (recommendationId: string, direction: 'up' | 'down') => {
    const currentRecommendation = recommendedGames.find(rec => rec.id === recommendationId)
    if (!currentRecommendation) return

    const newPriority = direction === 'up' 
      ? Math.max(1, currentRecommendation.priority - 1)
      : currentRecommendation.priority + 1

    const success = await recommendedGamesManager.updateRecommendedGame(recommendationId, { priority: newPriority })
    if (success) {
      showAlert('success', 'Priority updated')
      loadData()
    } else {
      showAlert('error', 'Failed to update priority')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const sortedGames = recommendedGames.sort((a, b) => a.priority - b.priority)
    const oldIndex = sortedGames.findIndex(item => item.id === active.id)
    const newIndex = sortedGames.findIndex(item => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrderedGames = arrayMove(sortedGames, oldIndex, newIndex)
    
    // Update priorities based on new order
    try {
      for (let i = 0; i < newOrderedGames.length; i++) {
        const game = newOrderedGames[i]
        await recommendedGamesManager.updateRecommendedGame(game.id, { priority: i + 1 })
      }
      showAlert('success', 'Game order updated successfully')
      loadData()
    } catch (error) {
      showAlert('error', 'Failed to update game order')
    }
  }

  const getGameInfo = (gameId: string): GameData | null => {
    return gameDataMap.get(gameId) || null
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>You Might Also Like - Recommended Games</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage the games that appear in the "You might also like" section. These games will be shown randomly mixed with your manual selections.
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Game
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Recommended Game</DialogTitle>
                  <DialogDescription>
                    Select a game to add to the recommendations section. These games will appear in the "You might also like" area.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Game</label>
                    <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a game to recommend" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGames
                          .filter(game => !recommendedGames.find(rec => rec.gameId === game.id))
                          .map(game => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddRecommendedGame} className="flex-1">
                      Add to Recommendations
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {recommendedGames.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recommended games configured. Random games will be shown.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={recommendedGames.sort((a, b) => a.priority - b.priority).map(rec => rec.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {recommendedGames
                    .sort((a, b) => a.priority - b.priority)
                    .map((recommendation) => {
                      const game = getGameInfo(recommendation.gameId)
                      if (!game) return null

                      return (
                        <SortableRecommendedGame
                          key={recommendation.id}
                          recommendation={recommendation}
                          game={game}
                          handleToggleRecommendedGame={handleToggleRecommendedGame}
                          handleRemoveRecommendedGame={handleRemoveRecommendedGame}
                          handleMovePriority={handleMovePriority}
                        />
                      )
                    })
                  }
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <p className="text-sm text-gray-600">
            This is how the recommended games will appear on the website
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {mixedRecommendations.map((game) => (
              <div key={game.id} className="bg-white rounded-lg overflow-hidden shadow-sm border">
                <div className="aspect-square relative">
                  <OptimizedImage
                    src={game.thumbnailUrl || "/placeholder.svg"}
                    alt={game.name}
                    className="w-full h-full"
                    fill={true}
                  />
                </div>
                <div className="p-2">
                  <h3 className="text-xs font-medium text-gray-800 truncate">
                    {game.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                      <span className="text-xs text-gray-600 ml-1">{game.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}