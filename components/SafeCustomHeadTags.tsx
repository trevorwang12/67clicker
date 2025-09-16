// 安全的自定义头部标签组件 - 支持Plausible等分析工具
import { SeoService } from '@/lib/seo-service'

export default async function SafeCustomHeadTags() {
  const customHeadTags = await SeoService.getCustomHeadTags()
  
  console.log('[DEBUG SafeCustomHeadTags] Custom head tags:', customHeadTags)
  
  if (!customHeadTags) {
    console.log('[DEBUG SafeCustomHeadTags] No custom head tags, returning null')
    return null
  }
  
  // 解析 HTML 并返回合适的 script 标签
  console.log('[DEBUG SafeCustomHeadTags] Rendering custom head tags as script elements')
  
  // 提取 script 标签的 src 和内容
  const scriptSrcMatch = customHeadTags.match(/<script[^>]+src="([^"]+)"[^>]*>/);
  const scriptContentMatch = customHeadTags.match(/<script>([^<]+)<\/script>/);
  const dataDomainMatch = customHeadTags.match(/data-domain="([^"]+)"/);
  const isDeferMatch = customHeadTags.match(/\sdefer\s/);
  
  return (
    <>
      {scriptSrcMatch && (
        <script
          defer={isDeferMatch ? true : undefined}
          data-domain={dataDomainMatch ? dataDomainMatch[1] : "worldguessr.pro"}
          src={scriptSrcMatch[1]}
        />
      )}
      {scriptContentMatch && (
        <script 
          dangerouslySetInnerHTML={{
            __html: scriptContentMatch[1]
          }}
        />
      )}
    </>
  )
}