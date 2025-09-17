const fs = require('fs').promises
const path = require('path')
const sharp = require('sharp')

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads')
const WEBP_QUALITY = 85
const WEBP_COMPRESSION_LEVEL = 6

async function convertToWebP() {
  try {
    console.log('🔍 扫描需要转换的图片...')

    const files = await fs.readdir(UPLOAD_DIR)
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg)$/i.test(file)
    )

    if (imageFiles.length === 0) {
      console.log('✅ 没有需要转换的图片')
      return
    }

    console.log(`📁 找到 ${imageFiles.length} 个需要转换的图片:`)
    imageFiles.forEach(file => console.log(`   - ${file}`))

    for (const fileName of imageFiles) {
      const inputPath = path.join(UPLOAD_DIR, fileName)
      const webpFileName = fileName.replace(/\.(png|jpg|jpeg)$/i, '.webp')
      const outputPath = path.join(UPLOAD_DIR, webpFileName)

      console.log(`🔄 转换: ${fileName} → ${webpFileName}`)

      const originalStats = await fs.stat(inputPath)

      const webpBuffer = await sharp(inputPath)
        .webp({
          quality: WEBP_QUALITY,
          effort: WEBP_COMPRESSION_LEVEL
        })
        .toBuffer()

      await fs.writeFile(outputPath, webpBuffer)

      const compressionRatio = Math.round((1 - webpBuffer.length / originalStats.size) * 100)
      console.log(`   📏 ${originalStats.size} → ${webpBuffer.length} bytes (压缩率: ${compressionRatio}%)`)

      // 删除原文件
      await fs.unlink(inputPath)
      console.log(`   🗑️  删除原文件: ${fileName}`)
    }

    console.log('✅ 批量转换完成!')

  } catch (error) {
    console.error('❌ 转换失败:', error)
    process.exit(1)
  }
}

convertToWebP()