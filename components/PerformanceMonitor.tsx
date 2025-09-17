'use client'

import { useEffect, useState } from 'react'

// 性能监控组件 - 实时监控优化效果
// "Measuring programming progress by lines of code is like measuring aircraft building progress by weight." - Bill Gates (Linus would agree)

interface PerformanceMetrics {
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  ttfb: number // Time to First Byte
  bundleSize: number
  imageOptimization: number
}

export default function PerformanceMonitor({ isDev = false }: { isDev?: boolean }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [visible, setVisible] = useState(isDev)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      const ttfb = navigation.responseStart - navigation.requestStart

      // Web Vitals 监控
      if ('PerformanceObserver' in window) {
        // LCP 监控
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcp = entries[entries.length - 1].startTime
          setMetrics(prev => prev ? { ...prev, lcp } : null)
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // CLS 监控
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const cls = entries.reduce((sum, entry) => sum + (entry as any).value, 0)
          setMetrics(prev => prev ? { ...prev, cls } : null)
        }).observe({ entryTypes: ['layout-shift'] })

        // FID 监控
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fid = entries[0].processingStart - entries[0].startTime
          setMetrics(prev => prev ? { ...prev, fid } : null)
        }).observe({ entryTypes: ['first-input'] })
      }

      // 基础指标
      setMetrics({
        fcp,
        lcp: 0,
        cls: 0,
        fid: 0,
        ttfb,
        bundleSize: document.querySelectorAll('script[src]').length,
        imageOptimization: calculateImageOptimization()
      })
    }

    // 页面加载完成后测量
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => window.removeEventListener('load', measurePerformance)
  }, [])

  const calculateImageOptimization = () => {
    const images = document.querySelectorAll('img')
    let optimizedCount = 0
    let totalCount = images.length

    images.forEach(img => {
      // 检查是否使用了现代格式
      if (img.src.includes('.webp') || img.src.includes('.avif')) {
        optimizedCount++
      }
      // 检查是否使用了懒加载
      if (img.loading === 'lazy') {
        optimizedCount++
      }
      // 检查是否是base64（性能杀手）
      if (img.src.startsWith('data:image') && img.src.length > 10000) {
        optimizedCount -= 2 // 严重扣分
      }
    })

    return totalCount > 0 ? Math.max(0, (optimizedCount / totalCount) * 100) : 100
  }

  const getScoreColor = (score: number, type: 'lcp' | 'fcp' | 'cls' | 'fid' | 'optimization') => {
    switch (type) {
      case 'lcp':
        return score <= 2500 ? 'text-green-600' : score <= 4000 ? 'text-yellow-600' : 'text-red-600'
      case 'fcp':
        return score <= 1800 ? 'text-green-600' : score <= 3000 ? 'text-yellow-600' : 'text-red-600'
      case 'cls':
        return score <= 0.1 ? 'text-green-600' : score <= 0.25 ? 'text-yellow-600' : 'text-red-600'
      case 'fid':
        return score <= 100 ? 'text-green-600' : score <= 300 ? 'text-yellow-600' : 'text-red-600'
      case 'optimization':
        return score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!visible || !metrics) return null

  return (
    <div className=\"fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs\">
      <div className=\"flex justify-between items-center mb-2\">
        <span className=\"font-bold\">⚡ Performance</span>
        <button
          onClick={() => setVisible(false)}
          className=\"text-gray-400 hover:text-white\"
        >
          ×
        </button>
      </div>

      <div className=\"space-y-1\">
        <div className={`flex justify-between ${getScoreColor(metrics.fcp, 'fcp')}`}>
          <span>FCP:</span>
          <span>{Math.round(metrics.fcp)}ms</span>
        </div>

        <div className={`flex justify-between ${getScoreColor(metrics.lcp, 'lcp')}`}>
          <span>LCP:</span>
          <span>{Math.round(metrics.lcp)}ms</span>
        </div>

        <div className={`flex justify-between ${getScoreColor(metrics.cls, 'cls')}`}>
          <span>CLS:</span>
          <span>{metrics.cls.toFixed(3)}</span>
        </div>

        <div className={`flex justify-between ${getScoreColor(metrics.fid, 'fid')}`}>
          <span>FID:</span>
          <span>{Math.round(metrics.fid)}ms</span>
        </div>

        <div className=\"flex justify-between text-blue-400\">
          <span>TTFB:</span>
          <span>{Math.round(metrics.ttfb)}ms</span>
        </div>

        <div className=\"flex justify-between text-purple-400\">
          <span>JS Chunks:</span>
          <span>{metrics.bundleSize}</span>
        </div>

        <div className={`flex justify-between ${getScoreColor(metrics.imageOptimization, 'optimization')}`}>
          <span>Img Opt:</span>
          <span>{Math.round(metrics.imageOptimization)}%</span>
        </div>
      </div>

      <div className=\"mt-2 pt-2 border-t border-gray-600 text-gray-400\">
        Linus-style optimization applied ✅
      </div>
    </div>
  )
}

// 性能测试快捷键
export function PerformanceHotkeys() {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P 显示性能面板
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        console.log('%c🚀 Performance Report', 'font-size: 16px; font-weight: bold; color: #00ff00;')

        // 输出详细性能报告
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        console.table({
          'DNS Lookup': `${nav.domainLookupEnd - nav.domainLookupStart}ms`,
          'TCP Connect': `${nav.connectEnd - nav.connectStart}ms`,
          'Request': `${nav.responseStart - nav.requestStart}ms`,
          'Response': `${nav.responseEnd - nav.responseStart}ms`,
          'DOM Processing': `${nav.domContentLoadedEventEnd - nav.responseEnd}ms`,
          'Load Complete': `${nav.loadEventEnd - nav.loadEventStart}ms`
        })
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  return null
}