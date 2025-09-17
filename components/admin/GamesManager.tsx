"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Search, Eye, Play, CheckCircle, XCircle, Clock } from "lucide-react"
import { dataManager, GameData, Category, getAllCategoriesSync } from "@/lib/data-manager"
import { sanitizeInput, validateGameData, generateSecureId, rateLimiter } from "@/lib/security"
import ImageUploader from "@/components/ImageUploader"
import CategoriesManager from "./CategoriesManager"

interface GameFormData {
  name: string
  description: string
  gradientDescription: string
  thumbnailUrl: string
  category: string
  tags: string
  rating: number
  developer: string
  releaseDate: string
  gameType: 'iframe' | 'external' | 'embed'
  gameUrl: string
  externalUrl: string
  embedCode: string
  controls: string
  platforms: string[]
  languages: string[]
  features: string[]
  isActive: boolean
  isFeatured: boolean
}

const initialFormData: GameFormData = {
  name: '',
  description: '',
  gradientDescription: '',
  thumbnailUrl: '',
  category: '',
  tags: '',
  rating: 4.0,
  developer: '',
  releaseDate: new Date().getFullYear().toString(),
  gameType: 'iframe',
  gameUrl: '',
  externalUrl: '',
  embedCode: '',
  controls: '',
  platforms: ['web'],
  languages: ['en'],
  features: [],
  isActive: true,
  isFeatured: false
}

export default function GamesManager() {
  const [games, setGames] = useState<GameData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<GameData | null>(null)
  const [formData, setFormData] = useState<GameFormData>(initialFormData)
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [linkStatuses, setLinkStatuses] = useState<{[key: string]: 'checking' | 'success' | 'error'}>({})
  const [showBatchCheck, setShowBatchCheck] = useState(false)

  useEffect(() => {
    loadData()

    // Listen for game updates
    const handleGamesUpdate = () => {
      loadData()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('gamesUpdated', handleGamesUpdate)
      window.addEventListener('storage', handleGamesUpdate)
      
      return () => {
        window.removeEventListener('gamesUpdated', handleGamesUpdate)
        window.removeEventListener('storage', handleGamesUpdate)
      }
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Try to load games from API first
      try {
        const allGames = await dataManager.getAllGames()
        setGames(allGames)
      } catch (gamesError) {
        console.warn('Failed to load games from API, trying direct fetch:', gamesError)
        // Fallback: try direct API call
        try {
          const response = await fetch('/api/admin/games')
          if (response.ok) {
            const gamesData = await response.json()
            setGames(gamesData)
          } else {
            throw new Error(`HTTP ${response.status}`)
          }
        } catch (fetchError) {
          console.error('Failed to fetch games directly:', fetchError)
          showAlert('error', 'Failed to load games. Please refresh the page.')
          return
        }
      }
      
      // Load categories
      try {
        setCategories(getAllCategoriesSync())
      } catch (catError) {
        console.warn('Failed to load categories sync, trying API:', catError)
        try {
          const response = await fetch('/api/admin/categories')
          if (response.ok) {
            const categoriesData = await response.json()
            setCategories(categoriesData)
          }
        } catch (fetchError) {
          console.warn('Failed to load categories:', fetchError)
          // Use empty array as fallback
          setCategories([])
        }
      }
      
    } catch (error) {
      console.error('Error in loadData:', error)
      showAlert('error', 'Failed to load data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (game.developer && game.developer.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInputChange = (field: keyof GameFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleStringToArrayInputChange = (field: keyof GameFormData, value: string) => {
    // For platforms, languages, features that need to remain as arrays
    const items = value.split(',').map(item => item.trim()).filter(item => item !== '')
    setFormData(prev => ({
      ...prev,
      [field]: items
    }))
  }

  const handleSubmit = async () => {
    if (!rateLimiter.isAllowed('admin-submit', 10, 60000)) {
      showAlert('error', 'Too many requests. Please wait.')
      return
    }

    try {
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        description: sanitizeInput(formData.description),
        gradientDescription: sanitizeInput(formData.gradientDescription),
        developer: sanitizeInput(formData.developer),
        gameUrl: formData.gameUrl.trim(),
        externalUrl: formData.externalUrl.trim(),
        embedCode: formData.embedCode.trim(),
        // Convert string fields back to arrays for saving
        tags: formData.tags.split(',').map(item => item.trim()).filter(item => item !== ''),
        controls: formData.controls.split(',').map(item => item.trim()).filter(item => item !== '')
      }

      const validation = validateGameData(sanitizedData)
      if (!validation.isValid) {
        showAlert('error', validation.errors.join(', '))
        return
      }

      if (editingGame) {
        const success = await dataManager.updateGame(editingGame.id, sanitizedData)
        if (success) {
          showAlert('success', 'Game updated successfully!')
          loadData()
        } else {
          showAlert('error', 'Failed to update game')
        }
      } else {
        const gameWithId = {
          ...sanitizedData
        }
        await dataManager.addGame(gameWithId)
        showAlert('success', 'Game added successfully!')
        loadData()
      }
      
      handleDialogClose()
    } catch (error) {
      console.error('Error saving game:', error)
      showAlert('error', 'An error occurred while saving the game')
    }
  }

  const handleEdit = (game: GameData) => {
    setEditingGame(game)
    setFormData({
      name: game.name,
      description: game.description,
      gradientDescription: game.gradientDescription || '',
      thumbnailUrl: game.thumbnailUrl,
      category: game.category,
      tags: game.tags.join(', '),
      rating: game.rating,
      developer: game.developer || '',
      releaseDate: game.releaseDate,
      gameType: game.gameType,
      gameUrl: game.gameUrl || '',
      externalUrl: game.externalUrl || '',
      embedCode: game.embedCode || '',
      controls: Array.isArray(game.controls) ? game.controls.join(', ') : '',
      platforms: game.platforms,
      languages: game.languages,
      features: game.features,
      isActive: game.isActive,
      isFeatured: game.isFeatured
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        const success = await dataManager.deleteGame(gameId)
        if (success) {
          showAlert('success', 'Game deleted successfully!')
          loadData()
        } else {
          showAlert('error', 'Failed to delete game')
        }
      } catch (error) {
        console.error('Error deleting game:', error)
        showAlert('error', 'An error occurred while deleting the game')
      }
    }
  }

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      // Add the new category as a custom option
      const customCategory = {
        id: newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: newCategoryName,
        description: `Custom category: ${newCategoryName}`,
        icon: 'tag',
        color: '#6B7280',
        isActive: true
      }
      setCategories(prev => [...prev, customCategory])
      setFormData(prev => ({ ...prev, category: customCategory.id }))
      setNewCategoryName('')
      setShowCustomCategory(false)
      showAlert('success', `Category "${newCategoryName}" added successfully!`)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setFormData(initialFormData)
    setEditingGame(null)
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({type, message})
    setTimeout(() => setAlert(null), 3000)
  }

  const checkIframeLink = async (gameId: string, gameUrl: string) => {
    setLinkStatuses(prev => ({ ...prev, [gameId]: 'checking' }))
    
    try {
      const response = await fetch('/api/admin/check-iframe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: gameUrl })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setLinkStatuses(prev => ({ ...prev, [gameId]: 'success' }))
        showAlert('success', `Game "${games.find(g => g.id === gameId)?.name}" link is working!`)
      } else {
        setLinkStatuses(prev => ({ ...prev, [gameId]: 'error' }))
        showAlert('error', `Game link failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error checking iframe link:', error)
      setLinkStatuses(prev => ({ ...prev, [gameId]: 'error' }))
      showAlert('error', 'Failed to check link - network error')
    }
    
    // Clear status after 10 seconds
    setTimeout(() => {
      setLinkStatuses(prev => {
        const newStatuses = { ...prev }
        delete newStatuses[gameId]
        return newStatuses
      })
    }, 10000)
  }

  const checkAllIframeLinks = async () => {
    const iframeGames = filteredGames.filter(game => game.gameType === 'iframe' && game.gameUrl)
    
    if (iframeGames.length === 0) {
      showAlert('error', 'No iframe games found to check')
      return
    }

    setShowBatchCheck(true)
    showAlert('success', `Starting batch check for ${iframeGames.length} iframe games...`)
    
    // Check games sequentially to avoid overwhelming the server
    for (const game of iframeGames) {
      await checkIframeLink(game.id, game.gameUrl!)
      // Wait 1 second between checks to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setShowBatchCheck(false)
  }

  const renderLinkStatus = (gameId: string) => {
    const status = linkStatuses[gameId]
    if (!status) return null

    switch (status) {
      case 'checking':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="games">Games Management</TabsTrigger>
          <TabsTrigger value="categories">Categories Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Games Management</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={checkAllIframeLinks}
                disabled={showBatchCheck}
                className="text-sm"
              >
                {showBatchCheck ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check All iframe Links
                  </>
                )}
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setFormData(initialFormData)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Game
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle>
                  <DialogDescription>
                    {editingGame ? 'Modify game details and settings.' : 'Fill in the game information to add it to the platform.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Game Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter game name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="developer">Developer</Label>
                      <Input
                        id="developer"
                        value={formData.developer}
                        onChange={(e) => handleInputChange('developer', e.target.value)}
                        placeholder="Developer name (optional)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="gradientDescription">Gradient Description</Label>
                    <Textarea
                      id="gradientDescription"
                      value={formData.gradientDescription}
                      onChange={(e) => handleInputChange('gradientDescription', e.target.value)}
                      placeholder="Short description for the game launch screen (max 100 characters recommended)"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">This appears on the colorful background before playing</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Full game description for the details section"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">This appears in the 'Game Details' section</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <div className="space-y-2">
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {showCustomCategory ? (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new category name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddNewCategory()
                                }
                              }}
                            />
                            <Button type="button" size="sm" onClick={handleAddNewCategory}>
                              Add
                            </Button>
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline" 
                              onClick={() => {
                                setShowCustomCategory(false)
                                setNewCategoryName('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setShowCustomCategory(true)}
                          >
                            + Add New Category
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="rating">Rating (1-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <ImageUploader
                    label="Thumbnail"
                    value={formData.thumbnailUrl}
                    onChange={(url) => handleInputChange('thumbnailUrl', url)}
                    required={true}
                    placeholder="Enter thumbnail URL or upload an image"
                  />
                  
                  <div>
                    <Label htmlFor="gameType">Game Type *</Label>
                    <Select value={formData.gameType} onValueChange={(value) => handleInputChange('gameType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select game type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iframe">Iframe Game</SelectItem>
                        <SelectItem value="external">External Link</SelectItem>
                        <SelectItem value="embed">Embed Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.gameType === 'iframe' && (
                    <div>
                      <Label htmlFor="gameUrl">Game URL *</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="gameUrl"
                          value={formData.gameUrl}
                          onChange={(e) => handleInputChange('gameUrl', e.target.value)}
                          placeholder="https://example.com/game"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (formData.gameUrl.trim()) {
                              checkIframeLink('form-preview', formData.gameUrl)
                            }
                          }}
                          disabled={!formData.gameUrl.trim() || linkStatuses['form-preview'] === 'checking'}
                          title="Check if URL works in iframe"
                        >
                          {renderLinkStatus('form-preview') || <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                      {linkStatuses['form-preview'] === 'success' && (
                        <p className="text-xs text-green-600 mt-1">✓ URL is accessible</p>
                      )}
                      {linkStatuses['form-preview'] === 'error' && (
                        <p className="text-xs text-red-600 mt-1">✗ URL may have issues</p>
                      )}
                    </div>
                  )}
                  
                  {formData.gameType === 'external' && (
                    <div>
                      <Label htmlFor="externalUrl">External URL *</Label>
                      <Input
                        id="externalUrl"
                        value={formData.externalUrl}
                        onChange={(e) => handleInputChange('externalUrl', e.target.value)}
                        placeholder="https://example.com/game"
                      />
                    </div>
                  )}
                  
                  {formData.gameType === 'embed' && (
                    <div>
                      <Label htmlFor="embedCode">Embed Code *</Label>
                      <Textarea
                        id="embedCode"
                        value={formData.embedCode}
                        onChange={(e) => handleInputChange('embedCode', e.target.value)}
                        placeholder="<iframe>...</iframe>"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="action, adventure, puzzle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="controls">Controls (comma separated)</Label>
                      <Input
                        id="controls"
                        value={formData.controls}
                        onChange={(e) => handleInputChange('controls', e.target.value)}
                        placeholder="mouse, keyboard, touch"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingGame ? 'Update' : 'Add'} Game</Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            {filteredGames.map((game) => (
              <div key={game.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={game.thumbnailUrl}
                      alt={game.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-game.jpg'
                      }}
                    />
                    <div>
                      <h3 className="font-semibold">{game.name}</h3>
                      <p className="text-sm text-gray-600">{game.developer || 'Unknown Developer'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {game.category}
                        </span>
                        <span className="text-xs text-gray-500">★ {game.rating}</span>
                        {game.isActive && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>}
                        {game.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Featured</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {game.gameType === 'iframe' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => checkIframeLink(game.id, game.gameUrl!)}
                          disabled={linkStatuses[game.id] === 'checking'}
                          title="Check if iframe link works"
                        >
                          {renderLinkStatus(game.id) || <CheckCircle className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/game/${game.id}`} target="_blank" rel="noopener noreferrer">
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </a>
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(game)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(game.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredGames.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No games found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
      </Tabs>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Loading Games...</h3>
              <p className="text-gray-600 text-sm">Please wait while we load your games and categories.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}