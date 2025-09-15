"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Home, Settings, Eye, EyeOff, Save, RotateCcw, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Edit, Star, Play } from "lucide-react"
import { homepageManager, HomepageContent, GameGalleryImage, GameGallerySection } from "@/lib/homepage-manager"
import { featuredGamesManager, type FeaturedGame } from "@/lib/feature-games-manager"
import { sanitizeInput } from "@/lib/security"
import ImageUploader from "@/components/ImageUploader"
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

// Sortable Item Component
function SortableItem({ 
  section, 
  updateSectionVisibility 
}: { 
  section: any, 
  updateSectionVisibility: (sectionId: any, isVisible: boolean) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: section.id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <Label htmlFor={section.id} className="text-sm font-medium">
            {section.name}
          </Label>
          <div className="flex items-center gap-2 mt-1">
            {section.isVisible ? (
              <>
                <Eye className="w-4 h-4 text-green-500" />
                <Badge variant="secondary" className="text-xs">Visible</Badge>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-gray-400" />
                <Badge variant="outline" className="text-xs">Hidden</Badge>
              </>
            )}
            <Badge variant="outline" className="text-xs">Order: {section.order}</Badge>
          </div>
        </div>
      </div>
      <Switch
        id={section.id}
        checked={section.isVisible}
        onCheckedChange={(checked) => updateSectionVisibility(section.id, checked)}
      />
    </div>
  );
}

export default function HomepageManager() {
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  
  // Featured Games states
  const [featuredGames, setFeaturedGames] = useState<FeaturedGame[]>([])
  const [featuredGameFormData, setFeaturedGameFormData] = useState({
    name: '',
    description: '',
    emoji: '🎮',
    thumbnailUrl: '',
    gameUrl: '',
    gradient: 'from-orange-400 to-pink-500',
    isActive: false
  })
  const [editingFeaturedGame, setEditingFeaturedGame] = useState<FeaturedGame | null>(null)
  const [isFeaturedGameDialogOpen, setIsFeaturedGameDialogOpen] = useState(false)

  // Game Gallery states
  const [gameGalleryImages, setGameGalleryImages] = useState<GameGalleryImage[]>([])
  const [galleryImageFormData, setGalleryImageFormData] = useState({
    title: '',
    description: '',
    src: '',
    gameUrl: ''
  })
  const [editingGalleryImage, setEditingGalleryImage] = useState<GameGalleryImage | null>(null)
  const [isGalleryImageDialogOpen, setIsGalleryImageDialogOpen] = useState(false)

  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Gradient options for featured games
  const gradientOptions = [
    { value: 'from-orange-400 to-pink-500', label: 'Orange to Pink', preview: 'bg-gradient-to-r from-orange-400 to-pink-500' },
    { value: 'from-blue-500 to-purple-600', label: 'Blue to Purple', preview: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { value: 'from-green-400 to-blue-500', label: 'Green to Blue', preview: 'bg-gradient-to-r from-green-400 to-blue-500' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple to Pink', preview: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { value: 'from-red-500 to-orange-500', label: 'Red to Orange', preview: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { value: 'from-indigo-500 to-purple-600', label: 'Indigo to Purple', preview: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
    { value: 'from-yellow-400 to-orange-500', label: 'Yellow to Orange', preview: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
    { value: 'from-teal-400 to-blue-500', label: 'Teal to Blue', preview: 'bg-gradient-to-r from-teal-400 to-blue-500' }
  ]

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load content on mount
  useEffect(() => {
    const loadContent = async () => {
      const homepageContent = await homepageManager.getContent()
      setContent(homepageContent)
      const sectionsList = await homepageManager.getSectionsList()
      setSections(sectionsList)
    }
    loadContent()
  }, [])

  // Load featured games on mount
  useEffect(() => {
    const loadFeaturedGames = async () => {
      const games = await featuredGamesManager.getAllFeaturedGames()
      setFeaturedGames(games)
    }
    loadFeaturedGames()
  }, [])

  // Load game gallery images on mount
  useEffect(() => {
    loadGameGalleryImages()
  }, [])

  // Featured Games functions
  const loadFeaturedGames = async () => {
    const games = await featuredGamesManager.getAllFeaturedGames()
    setFeaturedGames(games)
  }

  const handleFeaturedGameSubmit = async () => {
    try {
      const sanitizedData = {
        ...featuredGameFormData,
        name: sanitizeInput(featuredGameFormData.name),
        description: sanitizeInput(featuredGameFormData.description),
        gameUrl: featuredGameFormData.gameUrl.trim(),
        thumbnailUrl: featuredGameFormData.thumbnailUrl.trim()
      }

      if (!sanitizedData.name || !sanitizedData.description || !sanitizedData.gameUrl) {
        showAlert('error', 'Name, description, and game URL are required')
        return
      }

      if (editingFeaturedGame) {
        const updated = await featuredGamesManager.updateFeaturedGame(editingFeaturedGame.id, sanitizedData)
        if (updated) {
          showAlert('success', 'Featured game updated successfully!')
        } else {
          showAlert('error', 'Failed to update featured game')
        }
      } else {
        const newGame = await featuredGamesManager.createFeaturedGame(sanitizedData)
        if (newGame) {
          showAlert('success', 'Featured game created successfully!')
        } else {
          showAlert('error', 'Failed to create featured game')
        }
      }

      loadFeaturedGames()
      handleFeaturedGameDialogClose()
    } catch (error) {
      console.error('Error saving featured game:', error)
      showAlert('error', 'An error occurred while saving the featured game')
    }
  }

  const handleFeaturedGameEdit = (game: FeaturedGame) => {
    setEditingFeaturedGame(game)
    setFeaturedGameFormData({
      name: game.name,
      description: game.description,
      emoji: game.emoji,
      thumbnailUrl: game.thumbnailUrl,
      gameUrl: game.gameUrl,
      gradient: game.gradient,
      isActive: game.isActive
    })
    setIsFeaturedGameDialogOpen(true)
  }

  const handleFeaturedGameDelete = async (gameId: string) => {
    if (confirm('Are you sure you want to delete this featured game?')) {
      const success = await featuredGamesManager.deleteFeaturedGame(gameId)
      if (success) {
        showAlert('success', 'Featured game deleted successfully!')
        loadFeaturedGames()
      } else {
        showAlert('error', 'Failed to delete featured game')
      }
    }
  }

  const handleFeaturedGameToggle = async (gameId: string, isActive: boolean) => {
    if (isActive) {
      await featuredGamesManager.deactivateAllFeaturedGames()
      const success = await featuredGamesManager.activateFeaturedGame(gameId)
      if (success) {
        showAlert('success', 'Featured game activated successfully!')
        loadFeaturedGames()
      } else {
        showAlert('error', 'Failed to activate featured game')
      }
    } else {
      const success = await featuredGamesManager.updateFeaturedGame(gameId, { isActive: false })
      if (success) {
        showAlert('success', 'Featured game deactivated successfully!')
        loadFeaturedGames()
      } else {
        showAlert('error', 'Failed to deactivate featured game')
      }
    }
  }

  const handleMoveUp = async (gameId: string) => {
    const success = await featuredGamesManager.reorderFeaturedGame(gameId, 'up')
    if (success) {
      loadFeaturedGames()
    }
  }

  const handleMoveDown = async (gameId: string) => {
    const success = await featuredGamesManager.reorderFeaturedGame(gameId, 'down')
    if (success) {
      loadFeaturedGames()
    }
  }

  const handleFeaturedGameDialogClose = () => {
    setIsFeaturedGameDialogOpen(false)
    setFeaturedGameFormData({
      name: '',
      description: '',
      emoji: '🎮',
      thumbnailUrl: '',
      gameUrl: '',
      gradient: 'from-orange-400 to-pink-500',
      isActive: false
    })
    setEditingFeaturedGame(null)
  }

  // Game Gallery handlers
  const loadGameGalleryImages = async () => {
    const content = await homepageManager.getContent()
    if (content?.gameGallery?.images) {
      setGameGalleryImages(content.gameGallery.images)
    }
  }

  const handleGalleryImageSave = async () => {
    if (!galleryImageFormData.title.trim() || !galleryImageFormData.src.trim()) {
      showAlert('error', 'Title and image are required')
      return
    }

    try {
      const content = await homepageManager.getContent()
      if (!content) return

      const imageData: GameGalleryImage = {
        id: editingGalleryImage ? editingGalleryImage.id : `img_${Date.now()}`,
        title: sanitizeInput(galleryImageFormData.title),
        description: sanitizeInput(galleryImageFormData.description),
        src: galleryImageFormData.src,
        gameUrl: galleryImageFormData.gameUrl
      }

      let updatedImages = [...(content.gameGallery?.images || [])]

      if (editingGalleryImage) {
        const index = updatedImages.findIndex(img => img.id === editingGalleryImage.id)
        if (index !== -1) {
          updatedImages[index] = imageData
        }
        showAlert('success', 'Gallery image updated successfully!')
      } else {
        updatedImages.push(imageData)
        showAlert('success', 'Gallery image added successfully!')
      }

      const updatedContent = {
        ...content,
        gameGallery: {
          ...content.gameGallery,
          images: updatedImages
        }
      }

      const success = await homepageManager.saveContent(updatedContent)
      if (success) {
        setContent(updatedContent)
        loadGameGalleryImages()
        handleGalleryImageDialogClose()
      }
    } catch (error) {
      console.error('Error saving gallery image:', error)
      showAlert('error', 'An error occurred while saving the gallery image')
    }
  }

  const handleGalleryImageEdit = (image: GameGalleryImage) => {
    setEditingGalleryImage(image)
    setGalleryImageFormData({
      title: image.title,
      description: image.description || '',
      src: image.src,
      gameUrl: image.gameUrl || ''
    })
    setIsGalleryImageDialogOpen(true)
  }

  const handleGalleryImageDelete = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this gallery image?')) {
      try {
        const content = await homepageManager.getContent()
        if (!content) return

        const updatedImages = content.gameGallery?.images?.filter(img => img.id !== imageId) || []
        const updatedContent = {
          ...content,
          gameGallery: {
            ...content.gameGallery,
            images: updatedImages
          }
        }

        const success = await homepageManager.saveContent(updatedContent)
        if (success) {
          setContent(updatedContent)
          loadGameGalleryImages()
          showAlert('success', 'Gallery image deleted successfully!')
        }
      } catch (error) {
        console.error('Error deleting gallery image:', error)
        showAlert('error', 'Failed to delete gallery image')
      }
    }
  }

  const handleGalleryImageDialogClose = () => {
    setIsGalleryImageDialogOpen(false)
    setGalleryImageFormData({
      title: '',
      description: '',
      src: '',
      gameUrl: ''
    })
    setEditingGalleryImage(null)
  }

  const handleGallerySettingsUpdate = async (updates: Partial<GameGallerySection>) => {
    try {
      const content = await homepageManager.getContent()
      if (!content) return

      const updatedContent = {
        ...content,
        gameGallery: {
          ...content.gameGallery,
          ...updates
        }
      }

      const success = await homepageManager.saveContent(updatedContent)
      if (success) {
        setContent(updatedContent)
        showAlert('success', 'Gallery settings updated successfully!')
      }
    } catch (error) {
      console.error('Error updating gallery settings:', error)
      showAlert('error', 'Failed to update gallery settings')
    }
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({type, message})
    setTimeout(() => setAlert(null), 3000)
  }

  const handleSave = () => {
    setLoading(true)
    // Content is automatically saved to localStorage via the manager
    setLastSaved(new Date().toLocaleTimeString())
    setLoading(false)
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all homepage content to defaults? This cannot be undone.')) {
      await homepageManager.resetToDefaults()
      const homepageContent = await homepageManager.getContent()
      setContent(homepageContent)
      setLastSaved(null)
    }
  }

  const updateSection = async (sectionName: keyof HomepageContent, updates: any) => {
    await homepageManager.updateSection(sectionName, updates)
    const homepageContent = await homepageManager.getContent()
    setContent(homepageContent)
  }

  const updateSectionVisibility = async (sectionName: keyof HomepageContent, isVisible: boolean) => {
    await homepageManager.updateSectionVisibility(sectionName, isVisible)
    const homepageContent = await homepageManager.getContent()
    setContent(homepageContent)
    const sectionsList = await homepageManager.getSectionsList()
    setSections(sectionsList)
  }

  const addCustomHtmlSection = async () => {
    const newSection = {
      id: `custom-html-${Date.now()}`,
      title: `Custom HTML Section ${(Array.isArray(content?.customHtmlSections) ? content.customHtmlSections.length : 0) + 1}`,
      content: '<div class="p-4 text-center">\n  <h3 class="text-lg font-bold">New Custom HTML Section</h3>\n  <p class="text-gray-600">Add your custom content here...</p>\n</div>',
      isVisible: true
    }

    const currentSections = Array.isArray(content?.customHtmlSections) ? content.customHtmlSections : []
    const updatedSections = [...currentSections, newSection]
    
    await homepageManager.updateSection('customHtmlSections' as keyof HomepageContent, updatedSections)
    const homepageContent = await homepageManager.getContent()
    setContent(homepageContent)
  }

  const updateCustomHtmlSection = async (sectionId: string, updates: any) => {
    const currentSections = Array.isArray(content?.customHtmlSections) ? content.customHtmlSections : []
    const updatedSections = currentSections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    )
    
    await homepageManager.updateSection('customHtmlSections' as keyof HomepageContent, updatedSections)
    const homepageContent = await homepageManager.getContent()
    setContent(homepageContent)
  }

  const removeCustomHtmlSection = async (sectionId: string) => {
    const currentSections = Array.isArray(content?.customHtmlSections) ? content.customHtmlSections : []
    const updatedSections = currentSections.filter(section => section.id !== sectionId)
    
    await homepageManager.updateSection('customHtmlSections' as keyof HomepageContent, updatedSections)
    const homepageContent = await homepageManager.getContent()
    setContent(homepageContent)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id)
      const newIndex = sections.findIndex((section) => section.id === over.id)

      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections(newSections)

      // Create new order mapping
      const newOrder: { [key: string]: number } = {}
      newSections.forEach((section, index) => {
        newOrder[section.id] = index
      })

      // Save to backend
      await homepageManager.updateSectionOrder(newOrder)
      setLastSaved(new Date().toLocaleTimeString())
    }
  }

  const addFAQQuestion = () => {
    if (content) {
      const newQuestions = [...content.faq.questions, { question: '', answer: '' }]
      updateSection('faq', { questions: newQuestions })
    }
  }

  const removeFAQQuestion = (index: number) => {
    if (content) {
      const newQuestions = content.faq.questions.filter((_, i) => i !== index)
      updateSection('faq', { questions: newQuestions })
    }
  }

  const updateFAQQuestion = (index: number, field: 'question' | 'answer', value: string) => {
    if (content) {
      const newQuestions = [...content.faq.questions]
      newQuestions[index] = { ...newQuestions[index], [field]: value }
      updateSection('faq', { questions: newQuestions })
    }
  }

  if (!content) {
    return <div className="flex items-center justify-center p-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={alert.type === 'error' ? 'border-red-500' : 'border-green-500'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Home className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Homepage Content Management</h1>
            <p className="text-gray-600">Control all sections and content on the homepage</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">Last saved: {lastSaved}</span>
          )}
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Section Visibility</TabsTrigger>
          <TabsTrigger value="hero">Hero & Featured Game</TabsTrigger>
          <TabsTrigger value="featured-games">Featured Games Management</TabsTrigger>
          <TabsTrigger value="game-gallery">Game Gallery</TabsTrigger>
          <TabsTrigger value="content">Content Sections</TabsTrigger>
          <TabsTrigger value="faq">FAQ Management</TabsTrigger>
          <TabsTrigger value="custom">Custom HTML</TabsTrigger>
        </TabsList>

        {/* Section Visibility */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section Visibility & Order Control</CardTitle>
              <p className="text-sm text-gray-600">Toggle sections on/off and drag to reorder sections for the homepage</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  💡 Drag sections by the grip handle to reorder them. Changes are saved automatically.
                </p>
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <SortableItem
                          key={section.id}
                          section={section}
                          updateSectionVisibility={updateSectionVisibility}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero & Featured Game */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Game Settings</CardTitle>
              <p className="text-sm text-gray-600">Configure the featured game section</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Featured Game Section</Label>
                <Switch
                  checked={content.featuredGame.isVisible}
                  onCheckedChange={(checked) => updateSection('featuredGame', { isVisible: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Play Button</Label>
                <Switch
                  checked={content.featuredGame.showPlayButton}
                  onCheckedChange={(checked) => updateSection('featuredGame', { showPlayButton: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Games Section</CardTitle>
              <p className="text-sm text-gray-600">Configure the new games section</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show New Games Section</Label>
                <Switch
                  checked={content.newGames.isVisible}
                  onCheckedChange={(checked) => updateSection('newGames', { isVisible: checked })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newGamesTitle">Section Title</Label>
                  <Input
                    id="newGamesTitle"
                    value={content.newGames.title}
                    onChange={(e) => updateSection('newGames', { title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="newGamesLimit">Games to Show</Label>
                  <Input
                    id="newGamesLimit"
                    type="number"
                    min="4"
                    max="20"
                    value={content.newGames.limit}
                    onChange={(e) => updateSection('newGames', { limit: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Show "View All" Button</Label>
                <Switch
                  checked={content.newGames.showViewAllButton}
                  onCheckedChange={(checked) => updateSection('newGames', { showViewAllButton: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Games Management */}
        <TabsContent value="featured-games" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Featured Games Management</CardTitle>
                <Dialog open={isFeaturedGameDialogOpen} onOpenChange={setIsFeaturedGameDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setFeaturedGameFormData({
                      name: '',
                      description: '',
                      emoji: '🎮',
                      thumbnailUrl: '',
                      gameUrl: '',
                      gradient: 'from-orange-400 to-pink-500',
                      isActive: false
                    })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Featured Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingFeaturedGame ? 'Edit Featured Game' : 'Add New Featured Game'}</DialogTitle>
                      <DialogDescription>
                        {editingFeaturedGame ? 'Edit the featured game details and settings.' : 'Create a new featured game to highlight on the homepage.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="featuredName">Game Name *</Label>
                          <Input
                            id="featuredName"
                            value={featuredGameFormData.name}
                            onChange={(e) => setFeaturedGameFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter game name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="featuredEmoji">Emoji</Label>
                          <Input
                            id="featuredEmoji"
                            value={featuredGameFormData.emoji}
                            onChange={(e) => setFeaturedGameFormData(prev => ({ ...prev, emoji: e.target.value }))}
                            placeholder="🎮"
                            maxLength={2}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="featuredDescription">Description *</Label>
                        <Textarea
                          id="featuredDescription"
                          value={featuredGameFormData.description}
                          onChange={(e) => setFeaturedGameFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Game description"
                        />
                      </div>
                      
                      <ImageUploader
                        label="Thumbnail"
                        value={featuredGameFormData.thumbnailUrl}
                        onChange={(url) => setFeaturedGameFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                        placeholder="Enter thumbnail URL or upload an image"
                      />
                      
                      <div>
                        <Label htmlFor="featuredGameUrl">Game URL *</Label>
                        <Input
                          id="featuredGameUrl"
                          value={featuredGameFormData.gameUrl}
                          onChange={(e) => setFeaturedGameFormData(prev => ({ ...prev, gameUrl: e.target.value }))}
                          placeholder="https://example.com/game or /game/slug"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="featuredGradient">Background Gradient</Label>
                        <Select 
                          value={featuredGameFormData.gradient} 
                          onValueChange={(value) => setFeaturedGameFormData(prev => ({ ...prev, gradient: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gradient" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradientOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-4 h-4 rounded ${option.preview}`}></div>
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featuredActive"
                          checked={featuredGameFormData.isActive}
                          onCheckedChange={(checked) => setFeaturedGameFormData(prev => ({ ...prev, isActive: checked }))}
                        />
                        <Label htmlFor="featuredActive">Active (Note: Only one featured game can be active at a time)</Label>
                      </div>
                      
                      <div>
                        <Label>Preview</Label>
                        <div className={`p-6 rounded-lg bg-gradient-to-r ${featuredGameFormData.gradient} text-white`}>
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{featuredGameFormData.emoji}</span>
                            <div>
                              <h3 className="text-xl font-bold">{featuredGameFormData.name || 'Game Name'}</h3>
                              <p className="text-sm opacity-90">{featuredGameFormData.description || 'Game description'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleFeaturedGameDialogClose}>Cancel</Button>
                      <Button onClick={handleFeaturedGameSubmit}>{editingFeaturedGame ? 'Update' : 'Add'} Featured Game</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Active Featured Game */}
                {(() => {
                  const activeFeaturedGames = featuredGames.filter(game => game.isActive)
                  const inactiveFeaturedGames = featuredGames.filter(game => !game.isActive)
                  
                  return (
                    <>
                      {activeFeaturedGames.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-green-700">Active Featured Game</h3>
                          <div className="space-y-4">
                            {activeFeaturedGames.map((game, index) => (
                              <div key={game.id} className="border-2 border-green-200 rounded-lg p-4">
                                <div className={`p-4 rounded-lg bg-gradient-to-r ${game.gradient} text-white mb-4`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      <span className="text-2xl">{game.emoji}</span>
                                      <div>
                                        <h3 className="text-xl font-bold">{game.name}</h3>
                                        <p className="text-sm opacity-90">{game.description}</p>
                                      </div>
                                    </div>
                                    {game.thumbnailUrl && (
                                      <img
                                        src={game.thumbnailUrl}
                                        alt={game.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-gray-600">
                                    <div>Created: {new Date(game.createdAt).toLocaleDateString()}</div>
                                    <div>Updated: {new Date(game.updatedAt).toLocaleDateString()}</div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">
                                        <Play className="w-4 h-4 mr-1" />
                                        Play
                                      </a>
                                    </Button>
                                    <Switch
                                      checked={game.isActive}
                                      onCheckedChange={(checked) => handleFeaturedGameToggle(game.id, checked)}
                                    />
                                    <Button size="sm" variant="outline" onClick={() => handleFeaturedGameEdit(game)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleFeaturedGameDelete(game.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Inactive Featured Games */}
                      {inactiveFeaturedGames.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-gray-700">Inactive Featured Games</h3>
                          <div className="space-y-4">
                            {inactiveFeaturedGames.map((game, index) => (
                              <div key={game.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <span className="text-2xl opacity-50">{game.emoji}</span>
                                    <div>
                                      <h3 className="font-semibold text-gray-800">{game.name}</h3>
                                      <p className="text-sm text-gray-600">{game.description}</p>
                                      <div className={`inline-block mt-1 px-2 py-1 rounded text-xs text-white bg-gradient-to-r ${game.gradient}`}>
                                        {gradientOptions.find(opt => opt.value === game.gradient)?.label || 'Custom Gradient'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex flex-col space-y-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleMoveUp(game.id)}
                                        disabled={index === 0}
                                      >
                                        <ArrowUp className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleMoveDown(game.id)}
                                        disabled={index === inactiveFeaturedGames.length - 1}
                                      >
                                        <ArrowDown className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">
                                        <Play className="w-4 h-4 mr-1" />
                                        Play
                                      </a>
                                    </Button>
                                    <Switch
                                      checked={game.isActive}
                                      onCheckedChange={(checked) => handleFeaturedGameToggle(game.id, checked)}
                                    />
                                    <Button size="sm" variant="outline" onClick={() => handleFeaturedGameEdit(game)}>
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleFeaturedGameDelete(game.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {featuredGames.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No featured games created yet. Click "Add Featured Game" to create your first featured game.
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Gallery Management */}
        <TabsContent value="game-gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Game Gallery Management</CardTitle>
                <Dialog open={isGalleryImageDialogOpen} onOpenChange={setIsGalleryImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setGalleryImageFormData({
                      title: '',
                      description: '',
                      src: '',
                      gameUrl: ''
                    })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Gallery Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingGalleryImage ? 'Edit Gallery Image' : 'Add New Gallery Image'}</DialogTitle>
                      <DialogDescription>
                        {editingGalleryImage ? 'Edit the gallery image details and settings.' : 'Add a new image to the game gallery section.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="galleryImageTitle">Image Title *</Label>
                        <Input
                          id="galleryImageTitle"
                          value={galleryImageFormData.title}
                          onChange={(e) => setGalleryImageFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter image title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="galleryImageDescription">Description</Label>
                        <Textarea
                          id="galleryImageDescription"
                          value={galleryImageFormData.description}
                          onChange={(e) => setGalleryImageFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Image description (optional)"
                        />
                      </div>

                      <ImageUploader
                        label="Gallery Image *"
                        value={galleryImageFormData.src}
                        onChange={(url) => setGalleryImageFormData(prev => ({ ...prev, src: url }))}
                        placeholder="Upload or enter image URL"
                      />

                      <div>
                        <Label htmlFor="galleryImageGameUrl">Game URL (optional)</Label>
                        <Input
                          id="galleryImageGameUrl"
                          value={galleryImageFormData.gameUrl}
                          onChange={(e) => setGalleryImageFormData(prev => ({ ...prev, gameUrl: e.target.value }))}
                          placeholder="https://example.com/game or /game/slug"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleGalleryImageDialogClose}>
                        Cancel
                      </Button>
                      <Button onClick={handleGalleryImageSave}>
                        {editingGalleryImage ? 'Update Image' : 'Add Image'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Gallery Settings */}
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-semibold">Gallery Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="galleryTitleSetting">Gallery Title</Label>
                    <Input
                      id="galleryTitleSetting"
                      value={content?.gameGallery?.title || ''}
                      onChange={(e) => handleGallerySettingsUpdate({ title: e.target.value })}
                      placeholder="Game Gallery"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gallerySubtitleSetting">Subtitle</Label>
                    <Input
                      id="gallerySubtitleSetting"
                      value={content?.gameGallery?.subtitle || ''}
                      onChange={(e) => handleGallerySettingsUpdate({ subtitle: e.target.value })}
                      placeholder="Discover Amazing Games"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="galleryDisplayMode">Display Mode</Label>
                    <Select
                      value={content?.gameGallery?.displayMode || 'grid'}
                      onValueChange={(value: 'grid' | 'carousel') => handleGallerySettingsUpdate({ displayMode: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select display mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="galleryColumns">Columns (Grid Mode)</Label>
                    <Select
                      value={String(content?.gameGallery?.columns || 3)}
                      onValueChange={(value) => handleGallerySettingsUpdate({ columns: Number(value) as 2 | 3 | 4 })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Columns</SelectItem>
                        <SelectItem value="3">3 Columns</SelectItem>
                        <SelectItem value="4">4 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showTitles"
                        checked={content?.gameGallery?.showTitles ?? true}
                        onCheckedChange={(checked) => handleGallerySettingsUpdate({ showTitles: checked })}
                      />
                      <Label htmlFor="showTitles">Show Titles</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="showDescriptions"
                        checked={content?.gameGallery?.showDescriptions ?? true}
                        onCheckedChange={(checked) => handleGallerySettingsUpdate({ showDescriptions: checked })}
                      />
                      <Label htmlFor="showDescriptions">Show Descriptions</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images List */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Gallery Images ({gameGalleryImages.length})</h3>
                {gameGalleryImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gameGalleryImages.map((image) => (
                      <div key={image.id} className="border rounded-lg p-4 space-y-3">
                        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={image.src}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg'
                            }}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{image.title}</h4>
                          {image.description && (
                            <p className="text-xs text-gray-600 mt-1">{image.description}</p>
                          )}
                          {image.gameUrl && (
                            <p className="text-xs text-blue-600 mt-1">Links to: {image.gameUrl}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <Button size="sm" variant="outline" onClick={() => handleGalleryImageEdit(image)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleGalleryImageDelete(image.id)}>
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No gallery images added yet. Click "Add Gallery Image" to create your first gallery image.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Sections */}
        <TabsContent value="content" className="space-y-4">
          {/* Features Section */}
          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
              <p className="text-sm text-gray-600">Configure the "Why Play With Us" features</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Features Section</Label>
                <Switch
                  checked={content.features.isVisible}
                  onCheckedChange={(checked) => updateSection('features', { isVisible: checked })}
                />
              </div>
              <div>
                <Label htmlFor="featuresTitle">Section Title</Label>
                <Input
                  id="featuresTitle"
                  value={content.features.title}
                  onChange={(e) => updateSection('features', { title: e.target.value })}
                />
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(content.features.sections).map(([key, feature]) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      <Switch
                        checked={feature.isVisible}
                        onCheckedChange={(checked) => 
                          updateSection('features', { 
                            sections: { 
                              ...content.features.sections, 
                              [key]: { ...feature, isVisible: checked }
                            }
                          })
                        }
                      />
                    </div>
                    <Input
                      placeholder="Feature title"
                      value={feature.title}
                      onChange={(e) => 
                        updateSection('features', { 
                          sections: { 
                            ...content.features.sections, 
                            [key]: { ...feature, title: e.target.value }
                          }
                        })
                      }
                    />
                    <Textarea
                      placeholder="Feature description"
                      value={feature.description}
                      rows={2}
                      onChange={(e) => 
                        updateSection('features', { 
                          sections: { 
                            ...content.features.sections, 
                            [key]: { ...feature, description: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* What Is Section */}
          <Card>
            <CardHeader>
              <CardTitle>What Is Section</CardTitle>
              <p className="text-sm text-gray-600">Configure the platform description section</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show What Is Section</Label>
                <Switch
                  checked={content.whatIs.isVisible}
                  onCheckedChange={(checked) => updateSection('whatIs', { isVisible: checked })}
                />
              </div>
              <div>
                <Label htmlFor="whatIsTitle">Section Title</Label>
                <Input
                  id="whatIsTitle"
                  value={content.whatIs.title}
                  onChange={(e) => updateSection('whatIs', { title: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gamesCount">Games Count Display</Label>
                  <Input
                    id="gamesCount"
                    value={content.whatIs.content.gamesCount}
                    onChange={(e) => updateSection('whatIs', { 
                      content: { ...content.whatIs.content, gamesCount: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="playersCount">Players Count Display</Label>
                  <Input
                    id="playersCount"
                    value={content.whatIs.content.playersCount}
                    onChange={(e) => updateSection('whatIs', { 
                      content: { ...content.whatIs.content, playersCount: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mainText">Main Description</Label>
                <Textarea
                  id="mainText"
                  value={content.whatIs.content.mainText}
                  rows={3}
                  onChange={(e) => updateSection('whatIs', { 
                    content: { ...content.whatIs.content, mainText: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="statsText">Statistics Description</Label>
                <Textarea
                  id="statsText"
                  value={content.whatIs.content.statsText}
                  rows={3}
                  onChange={(e) => updateSection('whatIs', { 
                    content: { ...content.whatIs.content, statsText: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Management */}
        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Section</CardTitle>
              <p className="text-sm text-gray-600">Manage frequently asked questions</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show FAQ Section</Label>
                <Switch
                  checked={content.faq.isVisible}
                  onCheckedChange={(checked) => updateSection('faq', { isVisible: checked })}
                />
              </div>
              <div>
                <Label htmlFor="faqTitle">Section Title</Label>
                <Input
                  id="faqTitle"
                  value={content.faq.title}
                  onChange={(e) => updateSection('faq', { title: e.target.value })}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Questions & Answers</Label>
                <Button onClick={addFAQQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              <div className="space-y-4">
                {content.faq.questions.map((qa, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Question {index + 1}</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFAQQuestion(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Enter question"
                        value={qa.question}
                        onChange={(e) => updateFAQQuestion(index, 'question', e.target.value)}
                      />
                      <Textarea
                        placeholder="Enter answer"
                        value={qa.answer}
                        rows={3}
                        onChange={(e) => updateFAQQuestion(index, 'answer', e.target.value)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom HTML Section */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom HTML Sections</CardTitle>
                  <p className="text-sm text-gray-600">Add multiple custom HTML content sections to your homepage</p>
                </div>
                <Button 
                  onClick={addCustomHtmlSection}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.isArray(content.customHtmlSections) && content.customHtmlSections.length > 0 ? (
                content.customHtmlSections.map((section, index) => (
                  <Card key={section.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">Section {index + 1}</Badge>
                          <Switch
                            checked={section.isVisible}
                            onCheckedChange={(checked) => updateCustomHtmlSection(section.id, { isVisible: checked })}
                          />
                          <Label className="text-sm">
                            {section.isVisible ? 'Visible' : 'Hidden'}
                          </Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomHtmlSection(section.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`customHtmlTitle-${section.id}`}>Section Title</Label>
                        <Input
                          id={`customHtmlTitle-${section.id}`}
                          value={section.title}
                          onChange={(e) => updateCustomHtmlSection(section.id, { title: e.target.value })}
                          placeholder="Enter section title"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`customHtmlContent-${section.id}`}>HTML Content</Label>
                        <Textarea
                          id={`customHtmlContent-${section.id}`}
                          value={section.content}
                          onChange={(e) => updateCustomHtmlSection(section.id, { content: e.target.value })}
                          placeholder="Enter your custom HTML content here..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          You can use HTML tags and Tailwind CSS classes. Content will be rendered as-is.
                        </p>
                      </div>
                      {section.content && (
                        <div>
                          <Label>Preview</Label>
                          <div 
                            className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: section.content }}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No custom HTML sections yet.</p>
                  <p className="text-sm">Click "Add Section" to create your first custom HTML section.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}