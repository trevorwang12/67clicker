const fs = require('fs').promises
const path = require('path')

async function extractRemainingBase64() {
  const dataDir = path.join(process.cwd(), 'data')
  const files = ['seo-settings.json', 'homepage-content.json', 'featured-games.json']

  console.log('🔍 检查剩余base64数据...')

  for (const fileName of files) {
    const filePath = path.join(dataDir, fileName)

    try {
      const content = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(content)

      console.log(`\n📄 检查 ${fileName}:`)

      // 统计base64数据
      const base64Matches = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g) || []

      if (base64Matches.length > 0) {
        console.log(`❌ 发现 ${base64Matches.length} 个base64图片`)

        // 计算总大小
        const totalSize = base64Matches.reduce((sum, match) => sum + match.length, 0)
        console.log(`📏 总大小: ${Math.round(totalSize / 1024)}KB`)

        // 显示前几个
        base64Matches.slice(0, 3).forEach((match, i) => {
          const size = Math.round(match.length / 1024)
          const type = match.match(/data:image\/([^;]+)/)?.[1] || 'unknown'
          console.log(`   ${i + 1}. ${type}格式 (${size}KB)`)
        })

        if (base64Matches.length > 3) {
          console.log(`   ... 还有 ${base64Matches.length - 3} 个`)
        }
      } else {
        console.log('✅ 无base64数据')
      }

    } catch (error) {
      console.log(`⚠️ 无法读取 ${fileName}: ${error.message}`)
    }
  }

  console.log('\n🔍 完成检查')
}

extractRemainingBase64()