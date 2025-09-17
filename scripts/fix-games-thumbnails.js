const fs = require('fs').promises
const path = require('path')

async function fixGameThumbnails() {
  console.log('🔧 修复games.json中的缩略图路径...')

  try {
    // 读取games.json
    const gamesPath = path.join(process.cwd(), 'data/games.json')
    const gamesData = JSON.parse(await fs.readFile(gamesPath, 'utf8'))

    let updatedCount = 0

    // 更新每个游戏的缩略图路径
    for (const game of gamesData) {
      if (game.thumbnailUrl && game.thumbnailUrl.includes('/uploads/')) {
        const oldPath = game.thumbnailUrl

        // 将PNG/JPG路径转换为WebP路径
        const newPath = oldPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')

        if (oldPath !== newPath) {
          console.log(`  🔄 ${game.name}: ${oldPath} → ${newPath}`)
          game.thumbnailUrl = newPath
          updatedCount++
        }
      }
    }

    // 保存更新后的文件
    if (updatedCount > 0) {
      await fs.writeFile(gamesPath, JSON.stringify(gamesData, null, 2))
      console.log(`✅ 已更新 ${updatedCount} 个游戏的缩略图路径`)
    } else {
      console.log('✅ 所有缩略图路径都是正确的')
    }

  } catch (error) {
    console.error('❌ 修复失败:', error)
  }
}

fixGameThumbnails()