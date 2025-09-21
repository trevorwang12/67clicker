// 结构化数据组件 - 生成JSON-LD标签
// "Talk is cheap. Show me the code." - Linus

import { StructuredDataService } from '@/lib/structured-data-service'

interface StructuredDataProps {
  pageType: 'homepage' | 'game' | 'category'
  pageData?: any
}

export default async function StructuredData({ pageType, pageData }: StructuredDataProps) {
  try {
    const schemas = await StructuredDataService.generatePageStructuredData(pageType, pageData)

    if (schemas.length === 0) {
      return null
    }

    // 生成JSON-LD脚本
    const jsonLdScript = StructuredDataService.generateJSONLDScript(schemas)

    if (!jsonLdScript) {
      return null
    }

    // 返回dangerouslySetInnerHTML的脚本标签
    return (
      <div dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
    )
  } catch (error) {
    console.error('Failed to render structured data:', error)
    return null
  }
}

// 客户端版本（用于动态数据）
export function ClientStructuredData({ schemas }: { schemas: any[] }) {
  const jsonLdScript = StructuredDataService.generateJSONLDScript(schemas)

  if (!jsonLdScript) {
    return null
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: jsonLdScript }} />
  )
}