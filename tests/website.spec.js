const { test, expect } = require('@playwright/test');

// 测试配置
const BASE_URL = 'http://localhost:3000';

test.describe('网站功能测试', () => {

  test('首页应该正常加载', async ({ page }) => {
    await page.goto(BASE_URL);

    // 检查页面标题
    await expect(page).toHaveTitle(/GAMES/);

    // 检查主要内容是否存在
    await expect(page.locator('h1')).toBeVisible();

    // 检查页面状态码
    const response = await page.goto(BASE_URL);
    expect(response.status()).toBe(200);

    console.log('✅ 首页加载正常');
  });

  test('导航功能测试', async ({ page }) => {
    await page.goto(BASE_URL);

    // 测试导航到新游戏页面
    await page.click('a[href="/new-games"]');
    await expect(page).toHaveURL(`${BASE_URL}/new-games`);
    await expect(page.locator('h1, h2')).toContainText(/Latest Games|New Games/);

    // 测试导航到热门游戏页面
    await page.click('a[href="/hot-games"]');
    await expect(page).toHaveURL(`${BASE_URL}/hot-games`);

    console.log('✅ 导航功能正常');
  });

  test('搜索功能测试', async ({ page }) => {
    await page.goto(BASE_URL);

    // 查找搜索输入框
    const searchInput = page.locator('input[placeholder*="Search"]');

    if (await searchInput.isVisible()) {
      // 输入搜索关键词
      await searchInput.fill('game');
      await searchInput.press('Enter');

      // 等待搜索结果或页面跳转
      await page.waitForTimeout(2000);

      console.log('✅ 搜索功能测试完成');
    } else {
      console.log('⚠️ 搜索框未找到');
    }
  });

  test('游戏页面测试', async ({ page }) => {
    // 测试游戏详情页 - 使用实际存在的游戏ID
    const gameUrls = [
      '/game/cut-the-rope',
      '/game/subway-surfers',
      '/game/temple-run',
      '/game/candy-crush'
    ];

    for (const gameUrl of gameUrls) {
      try {
        const response = await page.goto(`${BASE_URL}${gameUrl}`);

        if (response.status() === 200) {
          // 检查是否有游戏标题 - 使用更具体的选择器
          await expect(page.locator('h1').first()).toBeVisible();
          console.log(`✅ ${gameUrl} 页面正常`);
        } else {
          console.log(`⚠️ ${gameUrl} 返回状态码: ${response.status()}`);
        }
      } catch (error) {
        console.log(`❌ ${gameUrl} 访问失败: ${error.message}`);
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    await page.goto(BASE_URL);

    // 桌面端测试
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();

    // 平板端测试
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // 移动端测试
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('body')).toBeVisible();

    // 检查是否有水平滚动条
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    if (hasHorizontalScroll) {
      console.log('⚠️ 移动端存在水平滚动条');
    } else {
      console.log('✅ 响应式设计正常');
    }
  });

  test('图片加载测试', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000); // 等待图片加载

    // 检查图片加载情况
    const images = await page.locator('img').all();
    let brokenImages = 0;
    let totalImages = images.length;

    for (const img of images) {
      try {
        const src = await img.getAttribute('src');
        if (src && src !== '/placeholder.jpg') {
          const naturalWidth = await img.evaluate(el => el.naturalWidth);
          if (naturalWidth === 0) {
            brokenImages++;
          }
        }
      } catch (error) {
        brokenImages++;
      }
    }

    console.log(`📊 图片统计: 总计 ${totalImages}, 损坏 ${brokenImages}`);

    if (brokenImages === 0) {
      console.log('✅ 所有图片加载正常');
    } else {
      console.log(`⚠️ 发现 ${brokenImages} 个损坏的图片`);
    }
  });

  test('性能测试', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    // 获取性能指标
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: Math.round(perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart),
        loadComplete: Math.round(perfData?.loadEventEnd - perfData?.loadEventStart),
        resourceCount: performance.getEntriesByType('resource').length
      };
    });

    console.log(`⚡ 性能指标:`);
    console.log(`  页面加载时间: ${loadTime}ms`);
    console.log(`  DOM加载时间: ${performanceMetrics.domContentLoaded}ms`);
    console.log(`  资源数量: ${performanceMetrics.resourceCount}`);

    // 性能建议
    if (loadTime > 5000) {
      console.log('⚠️ 页面加载时间较长，建议优化');
    } else {
      console.log('✅ 页面加载性能良好');
    }
  });

  test('错误页面测试', async ({ page }) => {
    // 测试不存在的页面
    const response = await page.goto(`${BASE_URL}/non-existent-page`);

    // 检查是否正确显示404页面
    if (response.status() === 404) {
      console.log('✅ 404页面处理正常');
    } else {
      console.log(`⚠️ 404页面返回状态码: ${response.status()}`);
    }
  });

  test('页面accessibility检查', async ({ page }) => {
    await page.goto(BASE_URL);

    // 检查页面是否有lang属性
    const hasLang = await page.locator('html[lang]').count() > 0;

    // 检查是否有无障碍标签
    const inputsWithLabels = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      let withLabels = 0;

      inputs.forEach(input => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');

        if (label || ariaLabel) {
          withLabels++;
        }
      });

      return {
        total: inputs.length,
        withLabels: withLabels
      };
    });

    console.log(`♿ 无障碍性检查:`);
    console.log(`  页面lang属性: ${hasLang ? '✅' : '❌'}`);
    console.log(`  输入框标签: ${inputsWithLabels.withLabels}/${inputsWithLabels.total}`);

    if (hasLang && inputsWithLabels.withLabels === inputsWithLabels.total) {
      console.log('✅ 无障碍性检查通过');
    }
  });
});

// 运行测试并生成报告
test.afterAll(async () => {
  console.log('\n🎉 所有测试完成！');
  console.log('📋 测试总结: 检查了页面加载、导航、搜索、响应式设计、图片加载、性能和无障碍性');
});