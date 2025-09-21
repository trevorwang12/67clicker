#!/usr/bin/env node

// 测试结构化数据验证
// 简化版本，直接检查JSON-LD输出

async function testStructuredData() {
  console.log('🧪 测试结构化数据验证...\n')

  try {
    // 测试基本Schema结构
    console.log('📝 测试Schema结构...')

    const testOrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: '67Clicker',
      url: 'https://67clickers.online'
    }

    const testWebSiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '67Clicker',
      url: 'https://67clickers.online',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://67clickers.online/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    }

    const testGameSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: 'Test Game',
      description: 'A test game for validation',
      url: 'https://67clickers.online/game/test-game',
      applicationCategory: 'Game',
      operatingSystem: 'Any',
      gamePlatform: 'Web Browser',
      genre: 'Action',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      publisher: {
        '@type': 'Organization',
        name: '67Clicker'
      }
    }

    // 验证每个Schema
    const schemas = [
      { name: 'Organization', schema: testOrganizationSchema },
      { name: 'WebSite', schema: testWebSiteSchema },
      { name: 'VideoGame', schema: testGameSchema }
    ]

    let allValid = true
    for (const { name, schema } of schemas) {
      const isValid = validateSchema(schema)
      console.log(`   ${isValid ? '✅' : '❌'} ${name} Schema: ${isValid ? '有效' : '无效'}`)
      if (!isValid) allValid = false
    }

    // 测试JSON-LD生成
    console.log('\n📝 测试JSON-LD生成...')
    const jsonLdScript = generateJSONLDScript([testOrganizationSchema, testWebSiteSchema])

    if (jsonLdScript && jsonLdScript.includes('<script type="application/ld+json">')) {
      console.log('✅ JSON-LD脚本生成成功')
      console.log('   脚本预览:')
      console.log(jsonLdScript.substring(0, 200) + '...')
    } else {
      console.log('❌ JSON-LD脚本生成失败')
      allValid = false
    }

    console.log(`\n🎉 ${allValid ? '所有测试通过!' : '部分测试失败!'}`)

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// 验证结构化数据
function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    return false
  }

  // 基本必需字段检查
  if (!schema['@context'] || !schema['@type']) {
    return false
  }

  // Schema.org上下文检查
  if (schema['@context'] !== 'https://schema.org') {
    return false
  }

  return true
}

// 生成JSON-LD脚本标签
function generateJSONLDScript(schemas) {
  const validSchemas = schemas.filter(schema => validateSchema(schema))

  if (validSchemas.length === 0) {
    return ''
  }

  // 如果只有一个schema，直接使用
  // 如果有多个，使用数组格式
  const data = validSchemas.length === 1 ? validSchemas[0] : validSchemas

  return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`
}

testStructuredData().catch(console.error)