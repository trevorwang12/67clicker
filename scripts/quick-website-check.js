#!/usr/bin/env node

const { chromium } = require('@playwright/test')

const BASE_URL = 'http://localhost:3001'

async function quickWebsiteCheck() {
  console.log('🚀 开始快速网站检查...\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  const page = await context.newPage()

  const results = {
    passed: [],
    failed: [],
    warnings: []
  }

  try {
    // 1. 首页加载检查
    console.log('🏠 检查首页加载...')
    try {
      const startTime = Date.now()
      const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime

      if (response?.status() === 200) {
        results.passed.push(`首页加载成功 (${loadTime}ms)`)
        console.log(`   ✅ 状态码: ${response.status()}, 加载时间: ${loadTime}ms`)
      } else {
        results.failed.push(`首页加载失败，状态码: ${response?.status()}`)
      }

      // 检查页面标题
      const title = await page.title()
      if (title.includes('67Clicker')) {
        results.passed.push('页面标题正确')
      } else {
        results.warnings.push(`页面标题可能不正确: ${title}`)
      }

    } catch (error) {
      results.failed.push(`首页加载失败: ${error.message}`)
    }

    // 2. 关键元素检查
    console.log('🔍 检查关键页面元素...')
    try {
      // 检查导航
      const nav = await page.locator('nav, header').count()
      if (nav > 0) {
        results.passed.push('导航元素存在')
      } else {
        results.warnings.push('未找到导航元素')
      }

      // 检查游戏区域
      const gameArea = await page.locator('.game-grid, .featured-games, [data-testid*="game"]').count()
      if (gameArea > 0) {
        results.passed.push('游戏展示区域存在')
      } else {
        results.warnings.push('未找到游戏展示区域')
      }

      // 检查图片
      const images = await page.locator('img').count()
      console.log(`   📸 找到 ${images} 张图片`)
      if (images > 0) {
        results.passed.push(`找到 ${images} 张图片`)
      }

    } catch (error) {
      results.failed.push(`元素检查失败: ${error.message}`)
    }

    // 3. 链接检查
    console.log('🔗 检查主要链接...')
    try {
      const links = await page.locator('a[href]').all()
      let validLinks = 0
      let internalLinks = 0

      for (const link of links.slice(0, 10)) { // 只检查前10个链接
        const href = await link.getAttribute('href')
        if (href) {
          if (href.startsWith('/') || href.includes('localhost')) {
            internalLinks++
          }
          validLinks++
        }
      }

      results.passed.push(`检查了 ${validLinks} 个链接，其中 ${internalLinks} 个内部链接`)

    } catch (error) {
      results.warnings.push(`链接检查失败: ${error.message}`)
    }

    // 4. 响应式检查
    console.log('📱 检查响应式设计...')
    try {
      // 移动端
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(1000)
      const mobileContent = await page.locator('body').isVisible()

      if (mobileContent) {
        results.passed.push('移动端响应式正常')
      } else {
        results.failed.push('移动端响应式有问题')
      }

    } catch (error) {
      results.warnings.push(`响应式检查失败: ${error.message}`)
    }

    // 5. 性能检查
    console.log('⚡ 检查页面性能...')
    try {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })

      const performanceMetrics = await page.evaluate(() => {
        return {
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          resources: performance.getEntriesByType('resource').length
        }
      })

      console.log(`   ⏱️  加载时间: ${performanceMetrics.loadTime}ms`)
      console.log(`   📊 DOM时间: ${performanceMetrics.domContentLoaded}ms`)
      console.log(`   📦 资源数量: ${performanceMetrics.resources}`)

      if (performanceMetrics.loadTime < 3000) {
        results.passed.push(`页面加载快速 (${performanceMetrics.loadTime}ms)`)
      } else if (performanceMetrics.loadTime < 5000) {
        results.warnings.push(`页面加载较慢 (${performanceMetrics.loadTime}ms)`)
      } else {
        results.failed.push(`页面加载过慢 (${performanceMetrics.loadTime}ms)`)
      }

    } catch (error) {
      results.warnings.push(`性能检查失败: ${error.message}`)
    }

    // 6. WebP使用情况检查
    console.log('🖼️  检查WebP使用情况...')
    try {
      const allImages = await page.locator('img').all()
      let webpCount = 0

      for (const img of allImages) {
        const src = await img.getAttribute('src')
        if (src && src.includes('.webp')) {
          webpCount++
        }
      }

      const webpRatio = allImages.length > 0 ? (webpCount / allImages.length) * 100 : 0
      console.log(`   📈 WebP使用率: ${webpRatio.toFixed(1)}% (${webpCount}/${allImages.length})`)

      if (webpRatio > 50) {
        results.passed.push(`WebP使用率良好 (${webpRatio.toFixed(1)}%)`)
      } else if (webpRatio > 20) {
        results.warnings.push(`WebP使用率中等 (${webpRatio.toFixed(1)}%)`)
      } else {
        results.warnings.push(`WebP使用率较低 (${webpRatio.toFixed(1)}%)`)
      }

    } catch (error) {
      results.warnings.push(`WebP检查失败: ${error.message}`)
    }

    // 7. 错误检查
    console.log('🐛 检查JavaScript错误...')
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.reload({ waitUntil: 'networkidle' })

    if (errors.length === 0) {
      results.passed.push('无JavaScript错误')
    } else {
      results.warnings.push(`发现 ${errors.length} 个JavaScript错误`)
    }

  } catch (error) {
    results.failed.push(`检查过程中出现错误: ${error.message}`)
  } finally {
    await browser.close()
  }

  // 生成报告
  console.log('\n📋 网站检查报告:')
  console.log('=' * 50)

  console.log(`\n✅ 通过的检查 (${results.passed.length}):`)
  results.passed.forEach(item => console.log(`   • ${item}`))

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  警告 (${results.warnings.length}):`)
    results.warnings.forEach(item => console.log(`   • ${item}`))
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ 失败的检查 (${results.failed.length}):`)
    results.failed.forEach(item => console.log(`   • ${item}`))
  }

  // 总体评分
  const totalChecks = results.passed.length + results.warnings.length + results.failed.length
  const score = Math.round((results.passed.length / totalChecks) * 100)

  console.log(`\n🎯 总体评分: ${score}/100`)

  if (score >= 90) {
    console.log('🎉 网站状态优秀!')
  } else if (score >= 70) {
    console.log('👍 网站状态良好!')
  } else if (score >= 50) {
    console.log('⚠️  网站需要优化!')
  } else {
    console.log('❌ 网站存在严重问题!')
  }

  console.log(`\n🕒 检查完成时间: ${new Date().toLocaleString()}`)
}

// 检查依赖
async function checkDependencies() {
  try {
    require('@playwright/test')
    return true
  } catch (error) {
    console.log('❌ Playwright 未安装')
    console.log('请运行: npm install @playwright/test --save-dev')
    console.log('然后运行: npx playwright install')
    return false
  }
}

// 主函数
async function main() {
  if (await checkDependencies()) {
    await quickWebsiteCheck()
  }
}

main().catch(console.error)