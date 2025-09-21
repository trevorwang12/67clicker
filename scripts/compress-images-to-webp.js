#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const sharp = require('sharp')

const WEBP_QUALITY = 85
const WEBP_COMPRESSION_LEVEL = 6

// 压缩配置
const compressionSettings = {
  quality: WEBP_QUALITY,
  effort: WEBP_COMPRESSION_LEVEL,
  // 保持图片透明度
  lossless: false,
  // 针对小图片优化
  nearLossless: false,
  // 智能子采样
  smartSubsample: true
}

async function findImageFiles(dir, extensions = ['.png', '.jpg', '.jpeg']) {
  const files = []

  try {
    const items = await fs.readdir(dir, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(dir, item.name)

      if (item.isDirectory()) {
        // 跳过 node_modules 等目录
        if (!['node_modules', '.next', '.git', 'uploads'].includes(item.name)) {
          const subFiles = await findImageFiles(fullPath, extensions)
          files.push(...subFiles)
        }
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase()
        if (extensions.includes(ext)) {
          // 检查是否已经有对应的webp文件
          const webpPath = fullPath.replace(new RegExp(ext + '$'), '.webp')
          try {
            await fs.access(webpPath)
            console.log(`⏭️  跳过: ${path.relative(process.cwd(), fullPath)} (WebP版本已存在)`)
          } catch {
            // WebP文件不存在，需要转换
            files.push(fullPath)
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️  无法访问目录: ${dir}`)
  }

  return files
}

async function compressImage(inputPath) {
  try {
    const originalStats = await fs.stat(inputPath)
    const originalSize = originalStats.size

    // 生成WebP文件路径
    const ext = path.extname(inputPath)
    const webpPath = inputPath.replace(new RegExp(ext + '$'), '.webp')

    console.log(`🔄 压缩: ${path.relative(process.cwd(), inputPath)}`)

    // 使用Sharp转换为WebP
    const webpBuffer = await sharp(inputPath)
      .webp(compressionSettings)
      .toBuffer()

    // 保存WebP文件
    await fs.writeFile(webpPath, webpBuffer)

    const compressionRatio = Math.round((1 - webpBuffer.length / originalSize) * 100)
    const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2)
    const webpSizeMB = (webpBuffer.length / 1024 / 1024).toFixed(2)

    console.log(`   📏 ${originalSizeMB}MB → ${webpSizeMB}MB (压缩率: ${compressionRatio}%)`)
    console.log(`   ✅ 生成: ${path.relative(process.cwd(), webpPath)}`)

    return {
      originalSize,
      webpSize: webpBuffer.length,
      compressionRatio,
      inputPath,
      webpPath
    }
  } catch (error) {
    console.error(`❌ 压缩失败 ${inputPath}:`, error.message)
    return null
  }
}

async function compressAllImages() {
  console.log('🚀 开始批量压缩图片为WebP格式...\n')

  const publicDir = path.join(process.cwd(), 'public')
  console.log(`📁 扫描目录: ${publicDir}`)

  // 查找所有需要压缩的图片
  const imageFiles = await findImageFiles(publicDir, ['.png', '.jpg', '.jpeg'])

  if (imageFiles.length === 0) {
    console.log('✅ 没有需要压缩的图片')
    return
  }

  console.log(`\n🔍 找到 ${imageFiles.length} 个图片需要压缩:\n`)

  let totalOriginalSize = 0
  let totalWebpSize = 0
  let successCount = 0

  // 逐个压缩图片
  for (const imagePath of imageFiles) {
    const result = await compressImage(imagePath)

    if (result) {
      totalOriginalSize += result.originalSize
      totalWebpSize += result.webpSize
      successCount++
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
    console.log('   1. WebP文件已生成，原文件保持不变')
    console.log('   2. 建议更新代码使用WebP格式，并保留原文件作为fallback')
    console.log('   3. 现代浏览器都支持WebP格式，可以显著提升加载速度')
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
    await compressAllImages()
  }
}

main().catch(console.error)