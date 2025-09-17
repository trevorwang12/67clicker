const { chromium } = require('playwright')

async function auditWebsite() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('🔍 开始网站审计...')

  try {
    // 监控网络请求
    const responses = []
    const base64Resources = []

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        contentType: response.headers()['content-type'] || '',
        size: response.headers()['content-length'] || '0'
      })
    })

    // 访问首页
    console.log('📋 检查首页...')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

    // 检查base64图片
    const base64Images = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      return images
        .filter(img => img.src.startsWith('data:image/'))
        .map(img => ({
          src: img.src.substring(0, 100) + '...',
          alt: img.alt,
          className: img.className,
          size: img.src.length
        }))
    })

    if (base64Images.length > 0) {
      console.log(`❌ 发现 ${base64Images.length} 个base64图片:`)
      base64Images.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.alt || '无alt'} (${Math.round(img.size/1024)}KB)`)
        console.log(`      Class: ${img.className}`)
        console.log(`      Src: ${img.src}`)
      })
    } else {
      console.log('✅ 首页无base64图片')
    }

    // 检查admin页面
    console.log('\n📋 检查admin页面...')
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' })

    const adminBase64Images = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      return images
        .filter(img => img.src.startsWith('data:image/'))
        .map(img => ({
          src: img.src.substring(0, 100) + '...',
          alt: img.alt,
          className: img.className,
          size: img.src.length
        }))
    })

    if (adminBase64Images.length > 0) {
      console.log(`❌ Admin页面发现 ${adminBase64Images.length} 个base64图片:`)
      adminBase64Images.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.alt || '无alt'} (${Math.round(img.size/1024)}KB)`)
        console.log(`      Class: ${img.className}`)
        console.log(`      Src: ${img.src}`)
      })
    } else {
      console.log('✅ Admin页面无base64图片')
    }

    // 点击SEO & Config标签
    console.log('\n📋 检查SEO Configuration页面...')
    try {
      await page.click('button[data-radix-collection-item][value="seo"]')
      await page.waitForTimeout(2000)

      const seoBase64Images = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'))
        return images
          .filter(img => img.src.startsWith('data:image/'))
          .map(img => ({
            src: img.src.substring(0, 100) + '...',
            alt: img.alt,
            className: img.className,
            size: img.src.length
          }))
      })

      if (seoBase64Images.length > 0) {
        console.log(`❌ SEO页面发现 ${seoBase64Images.length} 个base64图片:`)
        seoBase64Images.forEach((img, i) => {
          console.log(`   ${i + 1}. ${img.alt || '无alt'} (${Math.round(img.size/1024)}KB)`)
          console.log(`      Class: ${img.className}`)
          console.log(`      Src: ${img.src}`)
        })
      } else {
        console.log('✅ SEO Configuration页面无base64图片')
      }
    } catch (error) {
      console.log('⚠️ 无法访问SEO标签页:', error.message)
    }

    // 性能统计
    console.log('\n📊 网络请求统计:')
    const imageRequests = responses.filter(r => r.contentType.startsWith('image/'))
    const webpRequests = imageRequests.filter(r => r.contentType.includes('webp'))
    const nonWebpImages = imageRequests.filter(r => !r.contentType.includes('webp'))

    console.log(`📈 总图片请求: ${imageRequests.length}`)
    console.log(`🔧 WebP图片: ${webpRequests.length}`)
    console.log(`📊 非WebP图片: ${nonWebpImages.length}`)

    if (nonWebpImages.length > 0) {
      console.log('   非WebP图片列表:')
      nonWebpImages.forEach((img, i) => {
        console.log(`   ${i + 1}. ${img.url} (${img.contentType}, ${img.size} bytes)`)
      })
    }

    // 检查大文件
    const largeFiles = responses.filter(r => {
      const size = parseInt(r.size) || 0
      return size > 100000 // > 100KB
    })

    if (largeFiles.length > 0) {
      console.log('\n⚠️ 大文件 (>100KB):')
      largeFiles.forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.url} (${Math.round(parseInt(file.size)/1024)}KB)`)
      })
    }

    console.log('\n✅ 网站审计完成')

  } catch (error) {
    console.error('❌ 审计失败:', error)
  } finally {
    await browser.close()
  }
}

auditWebsite()