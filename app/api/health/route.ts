// 健康检查 API - 用于 Dokploy 监控
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 基本健康检查
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: '67clicker',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      checks: {
        server: 'ok',
        memory: 'ok',
        filesystem: 'ok'
      }
    }

    // 检查内存使用情况
    const memUsage = process.memoryUsage()
    if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
      healthStatus.checks.memory = 'warning'
    }

    // 检查文件系统（数据目录和上传目录）
    try {
      const fs = await import('fs')
      const path = await import('path')

      const dataDir = path.join(process.cwd(), 'data')
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

      if (!fs.existsSync(dataDir) || !fs.existsSync(uploadsDir)) {
        healthStatus.checks.filesystem = 'warning'
      }
    } catch (error) {
      healthStatus.checks.filesystem = 'error'
    }

    // 如果有任何检查失败，返回 503
    const hasErrors = Object.values(healthStatus.checks).includes('error')
    const statusCode = hasErrors ? 503 : 200

    return NextResponse.json(healthStatus, { status: statusCode })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: '67clicker',
      error: 'Health check failed'
    }, { status: 503 })
  }
}