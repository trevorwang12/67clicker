import { NextRequest, NextResponse } from 'next/server'
import { createAdminResponse, logAdminAccess } from '@/lib/admin-security'
import { DataService } from '@/lib/data-service'
import { promises as fs } from 'fs'
import path from 'path'

interface SectionOrder {
  [key: string]: number
}

interface CustomHtmlSection {
  id: string
  title: string
  content: string
  isVisible: boolean
}

interface GameGalleryImage {
  id: string
  src: string
  title: string
  description?: string
  gameUrl?: string
}

interface GameGallerySection {
  isVisible: boolean
  title: string
  subtitle?: string
  displayMode: 'grid' | 'carousel'
  columns: 2 | 3 | 4
  showTitles: boolean
  showDescriptions: boolean
  images: GameGalleryImage[]
}

interface HomepageContent {
  hero: {
    isVisible: boolean
    title: string
    subtitle: string
    backgroundGradient: string
  }
  featuredGame: {
    isVisible: boolean
    showPlayButton: boolean
  }
  newGames: {
    isVisible: boolean
    title: string
    limit: number
    showViewAllButton: boolean
  }
  features: {
    isVisible: boolean
    title: string
    sections: {
      instantPlay: { isVisible: boolean, title: string, description: string }
      freeGames: { isVisible: boolean, title: string, description: string }
      highQuality: { isVisible: boolean, title: string, description: string }
      multipleCategories: { isVisible: boolean, title: string, description: string }
    }
  }
  whatIs: {
    isVisible: boolean
    title: string
    content: {
      mainText: string
      statsText: string
      gamesCount: string
      playersCount: string
    }
  }
  howToPlay: {
    isVisible: boolean
    title: string
    steps: {
      step1: { title: string, description: string }
      step2: { title: string, description: string }
      step3: { title: string, description: string }
    }
  }
  whyChooseUs: {
    isVisible: boolean
    title: string
    premiumSection: {
      title: string
      features: string[]
    }
    communitySection: {
      title: string
      features: string[]
    }
  }
  faq: {
    isVisible: boolean
    title: string
    questions: {
      question: string
      answer: string
    }[]
  }
  gameGallery: GameGallerySection
  youMightAlsoLike: {
    isVisible: boolean
  }
  customHtmlSections: CustomHtmlSection[]
  sectionOrder: SectionOrder
}

// 内存中的首页内容，服务重启后会恢复默认值
let homepageContent: HomepageContent = getDefaultContent()

// 从文件加载最新数据
async function loadFromFile(): Promise<HomepageContent> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'homepage-content.json')
    const fileContent = await fs.readFile(filePath, 'utf8')
    const loadedData = JSON.parse(fileContent)
    console.log('Homepage data loaded from local file:', filePath)
    return loadedData
  } catch (error) {
    console.log('Failed to load homepage data, using default:', error)
    return getDefaultContent()
  }
}

// 将数据保存到文件
async function saveToFile(data: HomepageContent) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'homepage-content.json')
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8')
    console.log('Data saved to local file:', filePath)

    // 清除 DataService 缓存以确保前端获取最新数据
    DataService.clearCache()
    console.log('DataService cache cleared')
  } catch (error) {
    console.error('Failed to save data:', error)
    // 不抛出错误，让内存更新继续进行
  }
}

function getDefaultContent(): HomepageContent {
  return {
    hero: {
      isVisible: false,
      title: "GAMES",
      subtitle: "Best Online Gaming Platform",
      backgroundGradient: "from-blue-500 to-purple-600"
    },
    featuredGame: {
      isVisible: true,
      showPlayButton: true
    },
    newGames: {
      isVisible: true,
      title: "New Games",
      limit: 8,
      showViewAllButton: true
    },
    features: {
      isVisible: true,
      title: "Why Play With Us",
      sections: {
        instantPlay: {
          isVisible: true,
          title: "Instant Play",
          description: "No downloads required. Play games directly in your browser."
        },
        freeGames: {
          isVisible: true,
          title: "Free Games",
          description: "100% free to play. No hidden fees or subscriptions."
        },
        highQuality: {
          isVisible: true,
          title: "High Quality",
          description: "Carefully curated games with excellent ratings and reviews."
        },
        multipleCategories: {
          isVisible: true,
          title: "Multiple Categories",
          description: "Action, puzzle, strategy, casual - something for everyone."
        }
      }
    },
    whatIs: {
      isVisible: true,
      title: "What is Our Gaming Platform?",
      content: {
        mainText: "Our platform is a comprehensive online gaming destination that brings you the best browser-based games from around the world. We've carefully selected each game to ensure quality, entertainment value, and seamless gameplay experience.",
        statsText: "From classic arcade games to modern indie creations, our library spans multiple genres and difficulty levels, making it perfect for both casual players and gaming enthusiasts.",
        gamesCount: "500+",
        playersCount: "1M+"
      }
    },
    howToPlay: {
      isVisible: true,
      title: "How to Get Started",
      steps: {
        step1: {
          title: "Browse Games",
          description: "Explore our collection of games by category, popularity, or search for specific titles."
        },
        step2: {
          title: "Click & Play",
          description: "Simply click on any game to start playing instantly. No registration or download required."
        },
        step3: {
          title: "Enjoy Gaming",
          description: "Have fun playing your favorite games and discover new ones to add to your collection."
        }
      }
    },
    whyChooseUs: {
      isVisible: true,
      title: "Why Choose Our Platform?",
      premiumSection: {
        title: "Premium Gaming Experience",
        features: [
          "Ad-free gaming with minimal interruptions",
          "Regular updates with new games added weekly",
          "Cross-platform compatibility on all devices"
        ]
      },
      communitySection: {
        title: "Community & Safety",
        features: [
          "Safe and secure platform with no malware",
          "Family-friendly content suitable for all ages",
          "24/7 customer support and community help"
        ]
      }
    },
    faq: {
      isVisible: true,
      title: "Frequently Asked Questions",
      questions: [
        {
          question: "Do I need to create an account to play games?",
          answer: "No account required! You can start playing any game immediately without registration. However, creating an account allows you to save your progress and favorite games."
        },
        {
          question: "Are all games completely free?",
          answer: "Yes, all games on our platform are 100% free to play. We don't charge for access to any games, and there are no hidden fees or premium subscriptions required."
        },
        {
          question: "Do games work on mobile devices?",
          answer: "Most of our games are mobile-friendly and work great on smartphones and tablets. Games automatically adapt to your screen size for the best playing experience."
        },
        {
          question: "How often do you add new games?",
          answer: "We add new games regularly, typically several new titles each week. Check our \"New Games\" section to discover the latest additions to our collection."
        },
        {
          question: "Can I suggest games to be added?",
          answer: "Absolutely! We love hearing from our community. Contact us through our support page to suggest games you'd like to see added to our platform."
        }
      ]
    },
    gameGallery: {
      isVisible: false,
      title: "Game Gallery",
      subtitle: "Discover Amazing Games",
      displayMode: 'grid' as const,
      columns: 3 as const,
      showTitles: true,
      showDescriptions: true,
      images: []
    },
    youMightAlsoLike: {
      isVisible: true
    },
    customHtmlSections: [],
    sectionOrder: {
      featuredGame: 0,
      newGames: 1,
      features: 2,
      whatIs: 3,
      howToPlay: 4,
      whyChooseUs: 5,
      faq: 6,
      gameGallery: 7,
      youMightAlsoLike: 8
    }
  }
}


export async function GET() {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/homepage', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/homepage', true)
  try {
    homepageContent = await loadFromFile()
    return NextResponse.json(homepageContent)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch homepage content' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/homepage', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/homepage', true)
  try {
    const body = await request.json()

    // Handle full content save (for Game Gallery and other complex operations)
    if (body.action === 'save' && body.content) {
      homepageContent = body.content
      await saveToFile(homepageContent)
      return NextResponse.json(homepageContent)
    }

    // Load latest data from file before making changes
    homepageContent = await loadFromFile()

    const { section, updates } = body

    if (section === 'sectionOrder') {
      // Handle section order update
      homepageContent.sectionOrder = updates
    } else {
      // Handle regular section updates
      if (section === 'customHtmlSections') {
        // Special handling for customHtmlSections array
        homepageContent.customHtmlSections = updates
      } else if (!homepageContent[section as keyof HomepageContent]) {
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
      } else {
        homepageContent[section as keyof HomepageContent] = {
          ...homepageContent[section as keyof HomepageContent],
          ...updates
        }
      }
    }

    // 保存到文件
    await saveToFile(homepageContent)

    return NextResponse.json(section === 'sectionOrder' ? homepageContent.sectionOrder : homepageContent[section as keyof HomepageContent])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update homepage content' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/homepage', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }

  logAdminAccess('/api/admin/homepage', true)
  try {
    const { action } = await request.json()
    
    if (action === 'reset') {
      homepageContent = getDefaultContent()
      await saveToFile(homepageContent)
      return NextResponse.json(homepageContent)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}