import { NextResponse } from 'next/server'
import { createAdminResponse, logAdminAccess } from '@/lib/admin-security'
import { persistentDataManager } from '@/lib/persistent-data-manager'

export async function GET() {
  const adminCheck = createAdminResponse()
  if (adminCheck) {
    logAdminAccess('/api/admin/storage-status', false)
    return NextResponse.json(adminCheck, { status: adminCheck.status })
  }
  
  try {
    logAdminAccess('/api/admin/storage-status', true)
    
    const storageInfo = persistentDataManager.getStorageInfo()
    const isProduction = process.env.NODE_ENV === 'production'

    const status = {
      environment: process.env.NODE_ENV || 'development',
      storageMode: storageInfo.mode,
      isProduction,
      isPersistent: !isProduction, // 仅在开发环境持久化到文件
      warning: isProduction
        ? 'Production uses memory storage - changes reset on restart'
        : null,
      recommendations: []
    }

    // Add recommendations based on current configuration
    if (isProduction) {
      status.recommendations.push('Production uses memory storage for security')
    } else {
      status.recommendations.push('Development changes persist to JSON files')
    }
    
    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get storage status' }, { status: 500 })
  }
}