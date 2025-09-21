"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'

// 优化的图片组件 - 解决base64内联问题和懒加载
// "The enemy of performance is not slow hardware, it's bad software." - Linus

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  loading?: 'lazy' | 'eager'
}

export default function OptimizedImage({
  src,
  alt,
  className,
  priority = false,
  fill = false,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  loading = 'lazy'
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)

  // 检测base64图片 - 这是性能杀手
  const isBase64 = src?.startsWith('data:image')
  const isLargeBase64 = isBase64 && src.length > 50000 // 大于50KB的base64

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' } // 提前100px开始加载
    )

    const element = document.querySelector(`[data-img-src="${src}"]`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [src])

  // 对于大型base64图片，延迟处理
  useEffect(() => {
    if (isLargeBase64 && isInView) {
      // 延迟加载大型base64图片
      const timer = setTimeout(() => {
        setImgSrc(src)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [src, isLargeBase64, isInView])

  // Convert to WebP if available (but not for base64)
  const getOptimizedSrc = (originalSrc: string) => {
    if (isBase64) return originalSrc

    // Try to convert various formats to WebP
    return originalSrc
      .replace(/\.(png|jpg|jpeg)$/i, '.webp')
  }

  const optimizedSrc = getOptimizedSrc(imgSrc)

  const handleError = () => {
    if (!hasError && optimizedSrc !== imgSrc && !isBase64) {
      // Fallback to original format if WebP fails
      setImgSrc(src)
      setHasError(true)
    }
  }

  // 默认占位符
  const defaultPlaceholder = `data:image/svg+xml;base64,${Buffer.from(
    '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">Loading...</text></svg>'
  ).toString('base64')}`

  // 如果是大型base64且还未进入视口，显示占位符
  const shouldShowPlaceholder = isLargeBase64 && !isInView

  const imageProps = {
    src: shouldShowPlaceholder ? defaultPlaceholder : (hasError ? src : optimizedSrc),
    alt,
    className: `${className || ''} transition-opacity duration-300`,
    priority: priority && !isBase64, // base64图片不设为priority
    quality: isBase64 ? 100 : quality, // base64保持原质量
    sizes,
    placeholder,
    blurDataURL: blurDataURL || defaultPlaceholder,
    onError: handleError,
    loading: isBase64 ? 'lazy' : loading, // base64强制懒加载
    ...(fill
      ? { fill: true }
      : { width: width || 400, height: height || 300 }
    ),
    // base64图片特殊处理
    ...(isBase64 && {
      unoptimized: true, // 跳过Next.js优化
      decoding: 'async', // 异步解码
    })
  }

  return (
    <div className="relative overflow-hidden" data-img-src={src}>
      <Image {...imageProps} />
      {/* 针对base64图片的警告 */}
      {isLargeBase64 && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs p-1 z-10">
          PERF: Large base64 image ({Math.round(src.length / 1024)}KB)
        </div>
      )}
      {/* 优化的图片渲染 */}
      <style jsx>{`
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          content-visibility: auto; /* 现代浏览器优化 */
        }
      `}</style>
    </div>
  )
}