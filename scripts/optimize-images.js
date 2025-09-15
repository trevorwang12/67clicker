const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function optimizeImage(inputPath, outputPath) {
  try {
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newSize = newStats.size;
    const savings = ((originalSize - newSize) / originalSize) * 100;

    console.log(`✅ ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    console.log(`   Size: ${(originalSize/1024/1024).toFixed(2)}MB -> ${(newSize/1024/1024).toFixed(2)}MB (${savings.toFixed(1)}% savings)`);

    return { originalSize, newSize, savings };
  } catch (error) {
    console.error(`❌ Failed to optimize ${inputPath}:`, error.message);
    return null;
  }
}

async function optimizeAllImages() {
  const files = fs.readdirSync(PUBLIC_DIR);
  const gameImages = files.filter(file => file.endsWith('-game.png'));

  console.log(`🔍 Found ${gameImages.length} game images to optimize\n`);

  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let optimizedCount = 0;

  for (const filename of gameImages) {
    const inputPath = path.join(PUBLIC_DIR, filename);
    const outputPath = path.join(PUBLIC_DIR, filename.replace('.png', '.webp'));

    const result = await optimizeImage(inputPath, outputPath);
    if (result) {
      totalOriginalSize += result.originalSize;
      totalNewSize += result.newSize;
      optimizedCount++;
    }
    console.log(''); // Add spacing between images
  }

  if (optimizedCount > 0) {
    const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100;
    console.log(`🎉 Optimization Complete!`);
    console.log(`📊 Total: ${(totalOriginalSize/1024/1024).toFixed(2)}MB -> ${(totalNewSize/1024/1024).toFixed(2)}MB`);
    console.log(`💾 Saved: ${((totalOriginalSize - totalNewSize)/1024/1024).toFixed(2)}MB (${totalSavings.toFixed(1)}%)`);
    console.log(`📁 Optimized ${optimizedCount} images`);

    console.log('\n🔧 Next steps:');
    console.log('1. Update your code to use .webp files with .png fallbacks');
    console.log('2. Consider removing original .png files after testing');
    console.log('3. Update image loading logic to prefer WebP format');
  }
}

// Check if sharp is available
try {
  require('sharp');
  optimizeAllImages().catch(console.error);
} catch (error) {
  console.log('❌ Sharp not found. Installing...');
  console.log('Run: npm install sharp --save-dev');
  console.log('Then run this script again.');
}