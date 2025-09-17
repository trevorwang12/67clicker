const fs = require('fs').promises
const path = require('path')
const sharp = require('sharp')

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const WEBP_QUALITY = 85
const WEBP_COMPRESSION_LEVEL = 6

async function generateFileId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

async function convertBase64ToWebP(base64Data, prefix = 'extracted') {
  // 提取base64数据
  const matches = base64Data.match(/^data:image\/([^;]+);base64,(.+)$/)
  if (!matches) return null

  const [, mimeType, data] = matches
  const buffer = Buffer.from(data, 'base64')

  // 生成文件名
  const fileId = await generateFileId()
  const webpFileName = `${prefix}-${fileId}.webp`
  const filePath = path.join(UPLOAD_DIR, webpFileName)

  // 转换为WebP
  const webpBuffer = await sharp(buffer)
    .webp({
      quality: WEBP_QUALITY,
      effort: WEBP_COMPRESSION_LEVEL
    })
    .toBuffer()

  // 保存文件
  await fs.writeFile(filePath, webpBuffer)

  const compressionRatio = Math.round((1 - webpBuffer.length / buffer.length) * 100)
  console.log(`   ✅ ${webpFileName} (${Math.round(buffer.length/1024)}KB → ${Math.round(webpBuffer.length/1024)}KB, 压缩率${compressionRatio}%)`)

  return `/uploads/${webpFileName}`
}

async function replaceBase64InJson(filePath) {
  console.log(`\n🔧 处理 ${path.basename(filePath)}...`)

  const content = await fs.readFile(filePath, 'utf8')
  const originalSize = content.length

  let modifiedContent = content
  const base64Regex = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g
  const matches = content.match(base64Regex) || []

  if (matches.length === 0) {
    console.log('   ✅ 无base64数据')
    return
  }

  console.log(`   🔍 发现 ${matches.length} 个base64图片`)

  for (let i = 0; i < matches.length; i++) {
    const base64Data = matches[i]
    const prefix = path.basename(filePath, '.json')

    try {
      const webpUrl = await convertBase64ToWebP(base64Data, prefix)
      if (webpUrl) {
        modifiedContent = modifiedContent.replace(base64Data, webpUrl)
      }
    } catch (error) {
      console.log(`   ❌ 转换失败: ${error.message}`)
    }
  }

  // 保存修改后的文件
  await fs.writeFile(filePath, modifiedContent)

  const newSize = modifiedContent.length
  const reduction = Math.round((1 - newSize / originalSize) * 100)
  console.log(`   📉 文件大小: ${Math.round(originalSize/1024)}KB → ${Math.round(newSize/1024)}KB (减少${reduction}%)`)
}

async function finalBase64Cleanup() {
  console.log('🧹 最终base64清理...')

  // 确保上传目录存在
  await fs.mkdir(UPLOAD_DIR, { recursive: true })

  const filesToProcess = [
    '/Users/chuyoujing/Documents/编程项目/growden/data/seo-settings.json',
    '/Users/chuyoujing/Documents/编程项目/growden/data/homepage-content.json',
    '/Users/chuyoujing/Documents/编程项目/growden/data/featured-games.json'
  ]

  for (const filePath of filesToProcess) {
    try {
      await replaceBase64InJson(filePath)
    } catch (error) {
      console.log(`❌ 处理 ${path.basename(filePath)} 失败: ${error.message}`)
    }
  }

  console.log('\n✅ 最终清理完成！')
}

finalBase64Cleanup()