"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface GameGalleryImage {
  id: string
  src: string
  title: string
  description?: string
  gameUrl?: string
}

interface GameGalleryProps {
  title: string
  subtitle?: string
  displayMode: 'grid' | 'carousel'
  columns: 2 | 3 | 4
  showTitles: boolean
  showDescriptions: boolean
  images: GameGalleryImage[]
}

export default function GameGallery({
  title,
  subtitle,
  displayMode,
  columns,
  showTitles,
  showDescriptions,
  images
}: GameGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2'
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2' // 2x2 layout for 4 columns
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }
  }

  const renderImageItem = (image: GameGalleryImage, index: number) => {
    // 处理图片路径，如果图片不存在则使用占位图
    const imageSrc = image.src || '/placeholder.jpg';

    const content = (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="aspect-[4/3] overflow-hidden relative flex-shrink-0 bg-gray-100">
            <img
              src={imageSrc}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading={index < 3 ? "eager" : "lazy"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/placeholder.jpg') {
                  target.src = '/placeholder.jpg';
                }
              }}
            />
            {image.gameUrl && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3">
                  <Play className="w-6 h-6 text-gray-800" />
                </div>
              </div>
            )}
          </div>

          {(showTitles || showDescriptions) && (
            <div className="p-4 flex-grow flex flex-col justify-between">
              {showTitles && (
                <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">
                  {image.title}
                </h3>
              )}
              {showDescriptions && image.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {image.description}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )

    if (image.gameUrl) {
      return (
        <Link key={image.id} href={image.gameUrl} className="h-full">
          {content}
        </Link>
      )
    }

    return (
      <div key={image.id} className="h-full">
        {content}
      </div>
    )
  }

  return (
    <div className="mb-12">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        {displayMode === 'grid' ? (
          <div className={`grid ${getGridCols()} gap-6 ${columns === 4 ? 'max-w-4xl mx-auto' : ''}`}>
            {(columns === 4 ? images.slice(0, 4) : images).map((image, index) => renderImageItem(image, index))}
          </div>
        ) : (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-lg">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`,
                  width: `${images.length * 100}%`
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="w-full flex-shrink-0 px-2"
                    style={{ width: `${100 / images.length}%` }}
                  >
                    <div className="max-w-md mx-auto">
                      {renderImageItem(image, index)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                  onClick={nextSlide}
                  disabled={currentIndex === images.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Indicators */}
            {images.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}