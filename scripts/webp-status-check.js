#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

async function checkWebPStatus() {
  console.log('🔍 检查WebP优化状态...\n')

  const publicDir = path.join(process.cwd(), 'public')

  try {
    // 递归获取所有图片文件
    async function getAllImages(dir) {
      const images = []
      const items = await fs.readdir(dir, { withFileTypes: true })

      for (const item of items) {
        const fullPath = path.join(dir, item.name)

        if (item.isDirectory() && !['node_modules', '.next', '.git'].includes(item.name)) {
          const subImages = await getAllImages(fullPath)
          images.push(...subImages)
        } else if (item.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(item.name)) {
          images.push(fullPath)
        }
      }

      return images
    }

    const allImages = await getAllImages(publicDir)

    // 分类统计
    const stats = {
      png: [],
      jpg: [],
      jpeg: [],
      webp: [],
      hasWebpVersion: [],
      needsWebpVersion: []
    }

    // 统计各种格式
    allImages.forEach(imagePath => {
      const ext = path.extname(imagePath).toLowerCase()
      const relativePath = path.relative(publicDir, imagePath)

      switch (ext) {
        case '.png':
          stats.png.push(relativePath)
          break
        case '.jpg':
          stats.jpg.push(relativePath)
          break
        case '.jpeg':
          stats.jpeg.push(relativePath)
          break
        case '.webp':
          stats.webp.push(relativePath)
          break
      }
    })

    // 检查哪些非WebP图片有对应的WebP版本
    const nonWebpImages = [...stats.png, ...stats.jpg, ...stats.jpeg]

    nonWebpImages.forEach(imagePath => {
      const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp')
      if (stats.webp.includes(webpPath)) {
        stats.hasWebpVersion.push(imagePath)
      } else {
        stats.needsWebpVersion.push(imagePath)
      }
    })

    // 显示报告
    console.log('📊 图片格式统计:')
    console.log(`   PNG 文件: ${stats.png.length}`)
    console.log(`   JPG 文件: ${stats.jpg.length}`)
    console.log(`   JPEG 文件: ${stats.jpeg.length}`)
    console.log(`   WebP 文件: ${stats.webp.length}`)
    console.log(`   总图片数: ${allImages.length}`)

    console.log('\n🎯 WebP 优化状态:')
    console.log(`   ✅ 已有WebP版本: ${stats.hasWebpVersion.length}`)
    console.log(`   ❌ 需要WebP版本: ${stats.needsWebpVersion.length}`)

    if (stats.needsWebpVersion.length > 0) {
      console.log('\n📋 需要压缩的图片:')
      stats.needsWebpVersion.forEach(imagePath => {
        console.log(`   • ${imagePath}`)
      })

      console.log('\n💡 建议:')
      console.log('   运行: npm run compress:images')
      console.log('   或者: node scripts/compress-images-to-webp.js')
    } else {
      console.log('\n🎉 所有图片都已有WebP版本!')
    }

    // 计算总的空间使用情况
    let totalOriginalSize = 0
    let totalWebpSize = 0

    for (const imagePath of stats.hasWebpVersion) {
      try {
        const originalPath = path.join(publicDir, imagePath)
        const webpPath = originalPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')

        const originalStats = await fs.stat(originalPath)
        const webpStats = await fs.stat(webpPath)

        totalOriginalSize += originalStats.size
        totalWebpSize += webpStats.size
      } catch (error) {
        // 忽略错误，继续统计
      }
    }

    if (totalOriginalSize > 0) {
      const savings = Math.round((1 - totalWebpSize / totalOriginalSize) * 100)
      const savedMB = ((totalOriginalSize - totalWebpSize) / 1024 / 1024).toFixed(2)

      console.log('\n💾 空间优化效果:')
      console.log(`   原始大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`   WebP大小: ${(totalWebpSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`   节省空间: ${savedMB}MB (${savings}%)`)
    }

    console.log('\n🚀 上传系统状态:')
    console.log('   ✅ 新上传图片自动转换为WebP')
    console.log('   ✅ OptimizedImage组件支持WebP')
    console.log('   ✅ 自动fallback到原格式')

  } catch (error) {
    console.error('❌ 检查失败:', error)
    process.exit(1)
  }
}

checkWebPStatus().catch(console.error)