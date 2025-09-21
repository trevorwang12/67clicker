#!/usr/bin/env node

const { chromium } = require('@playwright/test')

const BASE_URL = 'http://localhost:3001'

async function simpleWebsiteCheck() {
  console.log('🚀 快速网站检查...\n')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    console.log('🏠 检查首页...')
    const startTime = Date.now()

    const response = await page.goto(BASE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    })

    const loadTime = Date.now() - startTime
    console.log(`   ✅ 状态码: ${response?.status()}, 加载时间: ${loadTime}ms`)

    // 检查页面标题
    const title = await page.title()
    console.log(`   📄 页面标题: ${title}`)

    // 检查基本元素
    const images = await page.locator('img').count()
    const links = await page.locator('a').count()
    const headings = await page.locator('h1, h2, h3').count()

    console.log(`\n📊 页面元素统计:`)
    console.log(`   🖼️  图片: ${images}`)
    console.log(`   🔗 链接: ${links}`)
    console.log(`   📝 标题: ${headings}`)

    // 检查WebP使用情况
    const allImages = await page.locator('img').all()
    let webpCount = 0

    for (let i = 0; i < Math.min(allImages.length, 20); i++) {
      const src = await allImages[i].getAttribute('src')
      if (src && src.includes('.webp')) {
        webpCount++
      }
    }

    const checkedImages = Math.min(allImages.length, 20)
    const webpRatio = checkedImages > 0 ? (webpCount / checkedImages) * 100 : 0
    console.log(`\n🖼️  WebP优化状态:`)
    console.log(`   检查了前 ${checkedImages} 张图片`)
    console.log(`   WebP使用率: ${webpRatio.toFixed(1)}%`)

    // 检查响应式
    console.log(`\n📱 响应式检查:`)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    console.log(`   ✅ 移动端视口正常`)

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)
    console.log(`   ✅ 桌面端视口正常`)

    // 简单的错误检查
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 5000 })

    console.log(`\n🐛 错误检查:`)
    if (errors.length === 0) {
      console.log(`   ✅ 无控制台错误`)
    } else {
      console.log(`   ⚠️  发现 ${errors.length} 个控制台错误`)
    }

    // 总结
    console.log(`\n🎯 检查总结:`)

    const score = calculateScore({
      loadTime,
      hasContent: images > 0 && links > 0,
      webpRatio,
      noErrors: errors.length === 0
    })

    console.log(`   评分: ${score}/100`)

    if (score >= 80) {
      console.log(`   🎉 网站状态优秀!`)
    } else if (score >= 60) {
      console.log(`   👍 网站状态良好!`)
    } else {
      console.log(`   ⚠️  网站需要优化!`)
    }

  } catch (error) {
    console.error(`❌ 检查失败: ${error.message}`)
  } finally {
    await browser.close()
  }
}

function calculateScore({ loadTime, hasContent, webpRatio, noErrors }) {
  let score = 0

  // 加载时间评分 (30分)
  if (loadTime < 1000) score += 30
  else if (loadTime < 2000) score += 25
  else if (loadTime < 3000) score += 20
  else if (loadTime < 5000) score += 10

  // 内容评分 (20分)
  if (hasContent) score += 20

  // WebP优化评分 (30分)
  if (webpRatio >= 80) score += 30
  else if (webpRatio >= 50) score += 25
  else if (webpRatio >= 30) score += 20
  else if (webpRatio >= 10) score += 10

  // 错误检查评分 (20分)
  if (noErrors) score += 20

  return score
}

// 主函数
simpleWebsiteCheck().catch(console.error)