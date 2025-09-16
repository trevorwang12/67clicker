'use client'

import { useEffect } from 'react'

export function CssOptimizer() {
  useEffect(() => {
    // 优化大CSS文件的加载
    const optimizeCssLoading = () => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]')

      stylesheets.forEach((link) => {
        const href = link.getAttribute('href')
        if (href && href.includes('_next/static/css')) {
          // 如果是大文件(>50KB估算)，使用异步加载
          if (href.includes('d3e2ec2353c7dbed') || link.getAttribute('data-size') === 'large') {
            const originalMedia = link.getAttribute('media') || 'all'
            link.setAttribute('media', 'print')
            link.onload = () => {
              link.setAttribute('media', originalMedia)
              link.onload = null
            }
          }
        }
      })
    }

    // 在DOMContentLoaded后优化CSS加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeCssLoading)
    } else {
      optimizeCssLoading()
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeCssLoading)
    }
  }, [])

  return null
}