'use client'

import { lazy, Suspense } from 'react'

// 激进的代码分割策略 - 减少1.6秒的主线程阻塞
// "Talk is cheap. Show me the code." - Linus

// 懒加载管理员组件 - 只有在需要时才加载
const AdminPanel = lazy(() => import('@/components/admin/AdminPanel'))
const GamePlayer = lazy(() => import('@/components/GamePlayer'))
const GameGallery = lazy(() => import('@/components/GameGallery'))

// 懒加载Radix UI组件 - 减少vendor chunk大小
const Dialog = lazy(() => import('@radix-ui/react-dialog').then(mod => ({ default: mod.Dialog })))
const Dropdown = lazy(() => import('@radix-ui/react-dropdown-menu').then(mod => ({ default: mod.DropdownMenu })))
const Toast = lazy(() => import('@radix-ui/react-toast').then(mod => ({ default: mod.Toast })))

// 加载状态组件
function LoadingFallback({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'h-8',
    default: 'h-24',
    large: 'h-48'
  }

  return (
    <div className={`animate-pulse bg-gray-200 rounded ${sizeClasses[size]} flex items-center justify-center`}>
      <div className=\"w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin\"></div>
    </div>
  )
}

// 智能懒加载包装器
export function LazyComponent({
  component,
  fallback,
  threshold = 0.1
}: {
  component: React.ComponentType<any>
  fallback?: React.ReactNode
  threshold?: number
}) {
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      {React.createElement(component)}
    </Suspense>
  )
}

// 导出懒加载组件
export {
  AdminPanel as LazyAdminPanel,
  GamePlayer as LazyGamePlayer,
  GameGallery as LazyGameGallery,
  Dialog as LazyDialog,
  Dropdown as LazyDropdown,
  Toast as LazyToast,
  LoadingFallback
}