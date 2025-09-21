#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const sharp = require('sharp')

const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads')
const WEBP_QUALITY = 85
const WEBP_COMPRESSION_LEVEL = 6

// 高质量压缩配置
const compressionSettings = {
  quality: WEBP_QUALITY,
  effort: WEBP_COMPRESSION_LEVEL,
  lossless: false,
  nearLossless: false,
  smartSubsample: true,
  preset: 'photo', // 针对照片优化
  alphaQuality: 90, // 透明度质量
  method: 6 // 最高压缩方法
}

async function compressUploadsToWebP() {
  console.log('🚀 压缩uploads目录中的图片...\n')

  try {
    // 确保uploads目录存在
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    const files = await fs.readdir(UPLOADS_DIR)
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg)$/i.test(file) && !file.endsWith('.webp')
    )

    if (imageFiles.length === 0) {
      console.log('✅ uploads目录中没有需要压缩的图片')
      return
    }

    console.log(`📁 找到 ${imageFiles.length} 个图片需要压缩:\n`)

    let totalOriginalSize = 0
    let totalWebpSize = 0
    let successCount = 0

    for (const fileName of imageFiles) {
      const inputPath = path.join(UPLOADS_DIR, fileName)
      const ext = path.extname(fileName)
      const baseName = path.basename(fileName, ext)
      const webpFileName = `${baseName}.webp`
      const outputPath = path.join(UPLOADS_DIR, webpFileName)

      console.log(`🔄 压缩: ${fileName}`)

      try {
        const originalStats = await fs.stat(inputPath)
        const originalSize = originalStats.size

        // 压缩为WebP
        const webpBuffer = await sharp(inputPath)
          .webp(compressionSettings)
          .toBuffer()

        // 保存WebP文件
        await fs.writeFile(outputPath, webpBuffer)

        const compressionRatio = Math.round((1 - webpBuffer.length / originalSize) * 100)
        const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2)
        const webpSizeMB = (webpBuffer.length / 1024 / 1024).toFixed(2)

        console.log(`   📏 ${originalSizeMB}MB → ${webpSizeMB}MB (压缩率: ${compressionRatio}%)`)
        console.log(`   ✅ 生成: ${webpFileName}`)

        totalOriginalSize += originalSize
        totalWebpSize += webpBuffer.length
        successCount++

        // 删除原文件（可选，根据需要启用）
        // await fs.unlink(inputPath)
        // console.log(`   🗑️  删除原文件: ${fileName}`)

      } catch (error) {
        console.error(`   ❌ 压缩失败: ${error.message}`)
      }

      console.log('') // 添加空行分隔
    }

    // 显示统计信息
    if (successCount > 0) {
      const totalCompressionRatio = Math.round((1 - totalWebpSize / totalOriginalSize) * 100)
      const totalOriginalSizeMB = (totalOriginalSize / 1024 / 1024).toFixed(2)
      const totalWebpSizeMB = (totalWebpSize / 1024 / 1024).toFixed(2)
      const savedSizeMB = ((totalOriginalSize - totalWebpSize) / 1024 / 1024).toFixed(2)

      console.log('🎉 压缩完成!\n')
      console.log('📊 统计信息:')
      console.log(`   📁 成功压缩: ${successCount} 个图片`)
      console.log(`   📏 总大小: ${totalOriginalSizeMB}MB → ${totalWebpSizeMB}MB`)
      console.log(`   💾 节省空间: ${savedSizeMB}MB (${totalCompressionRatio}%)`)

      console.log('\n💡 提示:')
      console.log('   1. 原文件已保留，WebP文件已生成')
      console.log('   2. 建议在代码中优先使用WebP格式')
      console.log('   3. 上传API已配置自动转换新上传的图片为WebP')
    }

  } catch (error) {
    console.error('❌ 处理失败:', error)
    process.exit(1)
  }
}

// 检查依赖
async function checkDependencies() {
  try {
    require('sharp')
    return true
  } catch (error) {
    console.log('❌ Sharp 未安装')
    console.log('请运行: npm install sharp --save-dev')
    console.log('然后重新运行此脚本')
    return false
  }
}

// 主函数
async function main() {
  if (await checkDependencies()) {
    await compressUploadsToWebP()
  }
}

main().catch(console.error)