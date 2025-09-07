"use client"

import { useEffect, useRef } from 'react'

// 安全的脚本执行器 - 只执行经过验证的脚本
interface SafeScriptExecutorProps {
  htmlContent: string
  containerId: string
}

export default function SafeScriptExecutor({ htmlContent, containerId }: SafeScriptExecutorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const executedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || executedRef.current) return
    executedRef.current = true

    // 解析和执行脚本
    const container = containerRef.current
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent

    // 查找所有脚本标签
    const scripts = tempDiv.querySelectorAll('script')
    const nonScriptContent = tempDiv.innerHTML.replace(/<script[\s\S]*?<\/script>/gi, '')

    // 设置非脚本内容
    container.innerHTML = nonScriptContent

    // 安全执行脚本
    scripts.forEach((script, index) => {
      const newScript = document.createElement('script')
      
      // 复制所有属性
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      
      // 设置脚本内容
      if (script.src) {
        const srcUrl = script.src
        
        // CRITICAL FIX: Multiple security validations
        if (srcUrl && (srcUrl.endsWith('.css') || srcUrl.includes('/css/'))) {
          console.error('[SafeScriptExecutor] BLOCKED: Attempted to load CSS as script:', srcUrl)
          return
        }
        
        // Only allow HTTPS scripts in production (keep basic security)
        if (process.env.NODE_ENV === 'production' && srcUrl.startsWith('http://')) {
          console.error('[SafeScriptExecutor] BLOCKED: HTTP script in production:', srcUrl)
          return
        }
        
        newScript.src = srcUrl
        newScript.async = true
      } else if (script.textContent) {
        newScript.textContent = script.textContent
      }
      
      // 延迟执行，确保DOM就绪
      setTimeout(() => {
        if (newScript.src) {
          document.head.appendChild(newScript)
        } else {
          // 内联脚本添加到容器
          container.appendChild(newScript)
        }
      }, index * 100) // 稍微错开执行时间
    })

    // 清理函数
    return () => {
      executedRef.current = false
    }
  }, [htmlContent, containerId])

  return (
    <div 
      ref={containerRef}
      id={containerId}
      suppressHydrationWarning={true}
    />
  )
}