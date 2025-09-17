'use client'

import { useEffect } from 'react'

// 非关键CSS延迟加载组件
// "If you need more than 3 levels of indentation, you're screwed" - Linus
// 同样适用于CSS加载 - 关键CSS内联，非关键CSS延迟加载

interface DeferredCSSProps {
  href: string
  media?: string
  onLoad?: () => void
}

export function DeferredCSS({ href, media = 'all', onLoad }: DeferredCSSProps) {
  useEffect(() => {
    // 检查CSS是否已经加载
    const existingLink = document.querySelector(`link[href="${href}"]`)
    if (existingLink) return

    // 创建CSS加载器
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.media = 'print' // 先设为print避免阻塞渲染

    const onLoadHandler = () => {
      link.media = media // 加载完成后切换到正确media
      onLoad?.()
    }

    // 兼容性处理
    if (link.addEventListener) {
      link.addEventListener('load', onLoadHandler)
    } else {
      link.onload = onLoadHandler
    }

    // 添加到head
    document.head.appendChild(link)

    return () => {
      // 清理
      if (link.parentNode) {
        link.parentNode.removeChild(link)
      }
    }
  }, [href, media, onLoad])

  return null
}

// 批量延迟加载CSS
export function DeferredCSSBundle({ cssFiles }: { cssFiles: string[] }) {
  useEffect(() => {
    // 使用requestIdleCallback在浏览器空闲时加载
    const loadCSS = () => {
      cssFiles.forEach((href, index) => {
        setTimeout(() => {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = href
          link.media = 'print'

          link.onload = () => {
            link.media = 'all'
          }

          document.head.appendChild(link)
        }, index * 50) // 错开加载时间
      })
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadCSS, { timeout: 2000 })
    } else {
      setTimeout(loadCSS, 100)
    }
  }, [cssFiles])

  return null
}

// 预加载关键资源
export function PreloadResources({ resources }: { resources: Array<{ href: string; as: string }> }) {
  useEffect(() => {
    resources.forEach(({ href, as }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      document.head.appendChild(link)
    })
  }, [resources])

  return null
}