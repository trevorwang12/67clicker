import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

// 支持的图片格式
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-token-here'
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')

// WebP压缩质量配置
const WEBP_QUALITY = 85
const WEBP_COMPRESSION_LEVEL = 6

// 上传文件信息
interface UploadedFile {
  id: string
  fileName: string
  originalName: string
  url: string  // 文件路径，不是base64
  size: number
  type: string
  uploadDate: string
}

// 生成唯一文件ID
function generateFileId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

// 生成唯一文件名
function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop() || ''
  return `${timestamp}-${random}${extension ? '.' + extension : ''}`
}

export async function POST(request: NextRequest) {
  try {
    // 管理员权限检查
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.' },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // 确保上传目录存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    // 生成唯一文件名（强制使用.webp扩展名）
    const fileId = generateFileId()
    const originalName = file.name.replace(/\.[^/.]+$/, '') // 移除原扩展名
    const webpFileName = `${fileId}-${originalName}.webp`
    const filePath = path.join(UPLOAD_DIR, webpFileName)

    // 读取文件内容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 使用Sharp转换为WebP格式并压缩
    const webpBuffer = await sharp(buffer)
      .webp({
        quality: WEBP_QUALITY,
        effort: WEBP_COMPRESSION_LEVEL
      })
      .toBuffer()

    // 保存WebP文件
    await fs.writeFile(filePath, webpBuffer)

    // 生成URL路径（相对于public目录）
    const fileUrl = `/uploads/${webpFileName}`

    console.log(`✅ File converted to WebP: ${webpFileName}`)
    console.log(`📏 Original size: ${file.size} bytes`)
    console.log(`📏 WebP size: ${webpBuffer.length} bytes`)
    console.log(`📉 Compression ratio: ${Math.round((1 - webpBuffer.length / file.size) * 100)}%`)

    return NextResponse.json({
      success: true,
      url: fileUrl,  // 返回文件路径，不是base64
      fileName: webpFileName,
      size: webpBuffer.length,
      type: 'image/webp',
      id: fileId
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// 获取上传的文件列表
export async function GET(request: NextRequest) {
  try {
    // 管理员权限检查
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 确保上传目录存在
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    // 读取上传目录中的所有文件
    const files = await fs.readdir(UPLOAD_DIR)
    const fileInfos = []

    for (const fileName of files) {
      const filePath = path.join(UPLOAD_DIR, fileName)
      const stats = await fs.stat(filePath)

      if (stats.isFile()) {
        fileInfos.push({
          name: fileName,
          url: `/uploads/${fileName}`,
          size: stats.size,
          uploadDate: stats.mtime.toISOString()
        })
      }
    }

    // 按修改时间排序（最新的在前）
    fileInfos.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

    return NextResponse.json({ files: fileInfos })

  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}