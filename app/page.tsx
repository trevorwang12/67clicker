"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Play, Users, Gamepad2 } from "lucide-react"
import { dataManager } from '@/lib/data-manager'
import { featuredGamesManager } from '@/lib/feature-games-manager'
import { homepageManager } from '@/lib/homepage-manager'
import AdSlot from '@/components/SafeAdSlot'
import GamePlayer from '@/components/GamePlayer'
import YouMightAlsoLike from '@/components/YouMightAlsoLike'
import InstantSearch from '@/components/InstantSearch'
import SEOHead from '@/components/SEOHead'
import PageH1 from '@/components/PageH1'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FriendlyLinks from '@/components/FriendlyLinks'

export default function HomePage() {
  const [featuredGame, setFeaturedGame] = useState<any>(null)
  const [isPlayingFeatured, setIsPlayingFeatured] = useState(false)
  const [featuredGameLoading, setFeaturedGameLoading] = useState(false)
  const [hotGames, setHotGames] = useState<any[]>([])
  const [newGames, setNewGames] = useState<any[]>([])
  const [allGames, setAllGames] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [seoData, setSeoData] = useState<any>(null)
  const [homepageContent, setHomepageContent] = useState<any>(null)
  const [loadingTipIndex, setLoadingTipIndex] = useState(0)
  
  const loadingTips = [
    "💡 Pro tip: Use arrow keys or WASD for better control!",
    "🎮 Did you know? This game supports multiple control schemes!",
    "⚡ Loading awesome graphics and smooth gameplay...",
    "🌟 Get ready for an epic gaming adventure!",
    "🎯 Tip: Check your internet connection for best experience!",
    "🚀 Preparing the ultimate gaming experience for you..."
  ]

  // Helper function to render sections based on order
  const renderSectionByType = (sectionType: string) => {
    if (!homepageContent) return null

    switch (sectionType) {
      case 'featuredGame':
        return renderFeaturedGameSection()
      case 'newGames':
        return renderNewGamesSection()
      case 'features':
        return renderFeaturesSection()
      case 'whatIs':
        return renderWhatIsSection()
      case 'howToPlay':
        return renderHowToPlaySection()
      case 'whyChooseUs':
        return renderWhyChooseUsSection()
      case 'faq':
        return renderFAQSection()
      case 'youMightAlsoLike':
        return renderYouMightAlsoLikeSection()
      default:
        return null
    }
  }


  // Render function for multiple custom HTML sections
  const renderCustomHtmlSections = () => {
    if (!Array.isArray(homepageContent?.customHtmlSections) || homepageContent.customHtmlSections.length === 0) return null
    
    return (
      <>
        {homepageContent.customHtmlSections
          .filter(section => section.isVisible)
          .map((section) => (
            <div key={section.id} className="mb-8">
              <div className="container mx-auto max-w-6xl px-4">
                {section.title && (
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    {section.title}
                  </h2>
                )}
                <div 
                  className="custom-html-content"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </div>
          ))
        }
      </>
    )
  }

  // Get ordered sections
  const getOrderedSections = () => {
    if (!homepageContent?.sectionOrder) return []
    
    const sections = Object.entries(homepageContent.sectionOrder)
      .sort(([, a], [, b]) => (a as number) - (b as number))
      .map(([sectionType]) => sectionType)
    
    return sections
  }

  // Load featured game and games data on component mount and listen for updates
  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true)
    
    const loadFeaturedGame = async () => {
      const activeFeaturedGame = await featuredGamesManager.getActiveFeaturedGame()
      setFeaturedGame(activeFeaturedGame)
    }

    const loadSEOData = async () => {
      try {
        const response = await fetch('/api/seo')
        if (response.ok) {
          const data = await response.json()
          setSeoData(data)
        }
      } catch (error) {
        console.error('Failed to load SEO data:', error)
      }
    }
    
    const loadGamesData = async () => {
      const hotGamesData = await dataManager.getHotGames(8)
      const newGamesData = await dataManager.getNewGames(8)
      const allGamesData = await dataManager.getAllGames()
      setHotGames(hotGamesData)
      setNewGames(newGamesData)
      setAllGames(allGamesData)
    }
    
    const loadHomepageContent = async () => {
      const content = await homepageManager.getContent()
      setHomepageContent(content)
    }
    
    loadFeaturedGame()
    loadGamesData()
    loadHomepageContent()
    loadSEOData()
    
    // 监听featured games更新事件
    const handleFeaturedGamesUpdate = async () => {
      await loadFeaturedGame()
    }
    
    // 监听games更新事件
    const handleGamesUpdate = async () => {
      await loadGamesData()
    }
    
    // 监听homepage content更新事件
    const handleHomepageUpdate = async () => {
      await loadHomepageContent()
    }
    
    // 监听localStorage变化和自定义事件
    window.addEventListener('storage', handleFeaturedGamesUpdate)
    window.addEventListener('featuredGamesUpdated', handleFeaturedGamesUpdate)
    window.addEventListener('gamesUpdated', handleGamesUpdate)
    window.addEventListener('homepageUpdated', handleHomepageUpdate)
    
    return () => {
      window.removeEventListener('storage', handleFeaturedGamesUpdate)
      window.removeEventListener('featuredGamesUpdated', handleFeaturedGamesUpdate)
      window.removeEventListener('gamesUpdated', handleGamesUpdate)
      window.removeEventListener('homepageUpdated', handleHomepageUpdate)
    }
  }, [])

  // Cycle through loading tips for featured game
  useEffect(() => {
    if (featuredGameLoading) {
      const interval = setInterval(() => {
        setLoadingTipIndex(prev => (prev + 1) % loadingTips.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [featuredGameLoading, loadingTips.length])

  const startFeaturedGame = async () => {
    setFeaturedGameLoading(true)
    
    // Simulate game loading time
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setFeaturedGameLoading(false)
    setIsPlayingFeatured(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Head Component */}
      <SEOHead pageType="home" />
      
      {/* Header */}
      <Header />
      
      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Main H1 Title */}
        <PageH1 
          pageType="homepage" 
          data={{ siteName: seoData?.seoSettings?.siteName || 'Worldguessr fan page' }} 
          className="text-center mb-8"
        />

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Game */}
            <div className="mb-8">
              {featuredGame ? (
                <>
                  {/* Featured Game Player or Preview */}
                  {isPlayingFeatured && featuredGame.gameUrl ? (
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-auto">
                      <GamePlayer 
                        gameUrl={featuredGame.gameUrl}
                        gameName={featuredGame.name}
                        gameId={featuredGame.id}
                        allowFullscreen={true}
                        showControls={true}
                      />
                    </div>
                  ) : featuredGameLoading ? (
                    <div className={`bg-gradient-to-r ${featuredGame.gradient || 'from-orange-400 to-pink-500'} rounded-lg text-white h-[600px] flex items-center justify-center relative overflow-hidden`}>
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
                            
                            {/* Inner pulsing circle */}
                            <div className="absolute inset-3 bg-white/20 rounded-full animate-pulse flex items-center justify-center">
                              <Gamepad2 className="w-8 h-8 text-white animate-bounce" />
                            </div>
                          </div>
                          
                          {/* Loading dots */}
                          <div className="flex justify-center mt-6 space-x-1">
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                        
                        {/* Dynamic Loading Text */}
                        <div className="space-y-4">
                          <h2 className="text-3xl font-bold animate-pulse">
                            Loading {featuredGame.name}...
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
                    <div className={`bg-gradient-to-r ${featuredGame.gradient || 'from-orange-400 to-pink-500'} rounded-lg text-white h-[600px] flex flex-col items-center justify-center text-center`}>
                      <div className="w-20 h-20 bg-white/20 rounded-xl mb-6 flex items-center justify-center text-3xl">
                        {featuredGame.emoji}
                      </div>
                      <h2 className="text-4xl font-bold mb-4 max-w-md">{featuredGame.name}</h2>
                      <p className="mb-8 opacity-90 text-lg max-w-lg px-4">{featuredGame.description}</p>
                      <Button 
                        onClick={startFeaturedGame}
                        className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        PLAY NOW
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg p-8 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-lg mx-auto mb-4 flex items-center justify-center text-2xl">
                    🎮
                  </div>
                  <h2 className="text-3xl font-bold mb-2">FEATURED GAME</h2>
                  <p className="mb-4 opacity-90">Configure a featured game in the admin panel to display here!</p>
                  <Button className="bg-white text-orange-500 hover:bg-gray-100 px-6 py-2 font-semibold" disabled>
                    <Play className="w-4 h-4 mr-2" />
                    NO GAME CONFIGURED
                  </Button>
                </div>
              )}
            </div>

            {/* Ad Slot - Hero Bottom Position */}
            <AdSlot position="hero-bottom" className="mb-8" />


            {/* Ad Slot - Content Top Position */}
            <AdSlot position="content-top" className="mb-8" />

            {/* New Games Section */}
            {homepageContent?.newGames?.isVisible && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{homepageContent.newGames.title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newGames.map((game, index) => (
                    <Link key={index} href={`/game/${game.id}`} className="group">
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                        <div className="aspect-[4/3] overflow-hidden flex-shrink-0">
                          <img 
                            src={game.thumbnailUrl?.replace(/\.png$/i, '.webp') || "/placeholder.svg"} 
                            alt={game.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            loading={index < 4 ? "eager" : "lazy"}
                            fetchPriority={index < 2 ? "high" : "auto"}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (img.src.includes('.webp')) {
                                img.src = game.thumbnailUrl || "/placeholder.svg";
                              }
                            }}
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

            {/* Ad Slot - Content Bottom Position */}
            <AdSlot position="content-bottom" className="mb-8" />

            {/* Features Section */}
            {homepageContent?.features?.isVisible && (
              <div className="mb-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {homepageContent.features.sections.instantPlay.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">{homepageContent.features.sections.instantPlay.title}</h3>
                      <p className="text-sm text-gray-600">{homepageContent.features.sections.instantPlay.description}</p>
                    </div>
                  )}

                  {homepageContent.features.sections.freeGames.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">{homepageContent.features.sections.freeGames.title}</h3>
                      <p className="text-sm text-gray-600">{homepageContent.features.sections.freeGames.description}</p>
                    </div>
                  )}

                  {homepageContent.features.sections.highQuality.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">{homepageContent.features.sections.highQuality.title}</h3>
                      <p className="text-sm text-gray-600">{homepageContent.features.sections.highQuality.description}</p>
                    </div>
                  )}

                  {homepageContent.features.sections.multipleCategories.isVisible && (
                    <div className="text-center p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gamepad2 className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="font-bold mb-2 text-gray-800">{homepageContent.features.sections.multipleCategories.title}</h3>
                      <p className="text-sm text-gray-600">{homepageContent.features.sections.multipleCategories.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* What is Section */}
            {homepageContent?.whatIs?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{homepageContent.whatIs.title}</h2>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <p className="text-lg text-gray-700 mb-4">
                        {homepageContent.whatIs.content.mainText}
                      </p>
                      <p className="text-gray-600">
                        {homepageContent.whatIs.content.statsText}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg p-8 text-white text-center">
                      <h3 className="text-2xl font-bold mb-4">Join Millions of Players</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-3xl font-bold">{homepageContent.whatIs.content.gamesCount}</div>
                          <div className="text-sm opacity-90">Games Available</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold">{homepageContent.whatIs.content.playersCount}</div>
                          <div className="text-sm opacity-90">Active Players</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How to Play Section */}
            {homepageContent?.howToPlay?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{homepageContent.howToPlay.title}</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-blue-600">1</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{homepageContent.howToPlay.steps.step1.title}</h3>
                      <p className="text-gray-600">
                        {homepageContent.howToPlay.steps.step1.description}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-green-600">2</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{homepageContent.howToPlay.steps.step2.title}</h3>
                      <p className="text-gray-600">
                        {homepageContent.howToPlay.steps.step2.description}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-purple-600">3</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{homepageContent.howToPlay.steps.step3.title}</h3>
                      <p className="text-gray-600">
                        {homepageContent.howToPlay.steps.step3.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Why Choose Us Section */}
            {homepageContent?.whyChooseUs?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{homepageContent.whyChooseUs.title}</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Star className="w-5 h-5 text-yellow-500" />
                        {homepageContent.whyChooseUs.premiumSection.title}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        {homepageContent.whyChooseUs.premiumSection.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className={`w-2 h-2 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'} rounded-full mt-2 flex-shrink-0`}></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Users className="w-5 h-5 text-blue-500" />
                        {homepageContent.whyChooseUs.communitySection.title}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        {homepageContent.whyChooseUs.communitySection.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className={`w-2 h-2 ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-indigo-500'} rounded-full mt-2 flex-shrink-0`}></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {homepageContent?.faq?.isVisible && (
              <div className="mb-12">
                <div className="bg-white border border-gray-200 rounded-lg p-8">
                  <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{homepageContent.faq.title}</h2>
                  <div className="space-y-6">
                    {homepageContent.faq.questions.map((faqItem, index) => (
                      <div key={index} className={`${index < homepageContent.faq.questions.length - 1 ? 'border-b border-gray-200 pb-4' : ''}`}>
                        <h3 className="text-lg font-bold mb-2 text-gray-800">{faqItem.question}</h3>
                        <p className="text-gray-700">
                          {faqItem.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Hot Games */}
          <div className="w-80 hidden lg:block">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Hot games</h3>
              <div className="grid grid-cols-2 gap-3">
                {hotGames.map((game, index) => (
                  <Link key={index} href={`/game/${game.id}`} className="group">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden relative flex-shrink-0">
                        <img 
                          src={game.thumbnailUrl?.replace(/\.png$/i, '.webp') || "/placeholder.svg"} 
                          alt={game.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src.includes('.webp')) {
                              img.src = game.thumbnailUrl || "/placeholder.svg";
                            }
                          }}
                        />
                        <div className="absolute top-1 right-1">
                          <Badge className="bg-orange-500 text-white text-xs px-1 py-0.5">
                            ⭐{game.rating}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-2 flex-grow flex items-start">
                        <h3 className="font-medium text-xs text-gray-800 line-clamp-2 leading-tight">{game.name}</h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Ad Slot - Sidebar Position */}
            <AdSlot position="sidebar" className="mt-6" />
          </div>
        </div>

      </div>


      {/* Multiple Custom HTML Sections */}
      {renderCustomHtmlSections()}

      {/* You Might Also Like Section */}
      <YouMightAlsoLike />

      {/* Footer */}
      <Footer />
    </div>
  )
}
