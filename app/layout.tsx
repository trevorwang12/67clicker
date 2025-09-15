import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import HydrationErrorBoundary from '@/components/HydrationErrorBoundary'
import HydrationFix from '@/components/HydrationFix'
import SafePreloadManager from '@/components/optimization/SafePreloadManager'
import SafeAnalytics from '@/components/SafeAnalytics'
import SafeVerificationTags from '@/components/SafeVerificationTags'
import SafeCustomHeadTags from '@/components/SafeCustomHeadTags'
import { SeoService } from '@/lib/seo-service'
import './globals.css'

// "Simplicity is the ultimate sophistication." - Leonardo (Linus would approve)
export async function generateMetadata(): Promise<Metadata> {
  return SeoService.generateMetadata()
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />

        {/* Favicon - explicit for search engines */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* Performance Optimization Headers */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Critical CSS inlining prevention */}
        <meta httpEquiv="Content-Security-Policy" content="style-src 'self' 'unsafe-inline' fonts.googleapis.com;" />
        
        <SafeAnalytics />
        <SafeVerificationTags />
        <SafeCustomHeadTags />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* 关键CSS内联 - 防止CLS和阻塞渲染 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                margin: 0;
                padding: 0;
                height: 100%;
                overflow-x: hidden;
                font-display: swap;
                -webkit-text-size-adjust: 100%;
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }

              /* 确保主容器正确布局 */
              #__next {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
              }

              /* Footer 应该在页面底部 */
              footer {
                margin-top: auto;
              }

              /* 关键布局样式 - 防止CLS */
              .max-w-7xl {
                max-width: 80rem;
                width: 100%;
                margin-left: auto;
                margin-right: auto;
              }
              .max-w-6xl {
                max-width: 72rem;
                width: 100%;
                margin-left: auto;
                margin-right: auto;
              }
              .mx-auto { margin-left: auto; margin-right: auto; }
              .px-4 { padding-left: 1rem; padding-right: 1rem; }
              .px-8 { padding-left: 2rem; padding-right: 2rem; }
              .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
              .mb-8 { margin-bottom: 2rem; }
              .mt-12 { margin-top: 3rem; }

              /* 图片容器 - 预留空间防止CLS */
              .aspect-ratio-4-3 {
                aspect-ratio: 4/3;
                width: 100%;
                height: auto;
                display: block;
              }

              /* 游戏卡片预设尺寸 */
              .game-card {
                min-height: 280px;
                display: block;
              }
              .game-card img {
                width: 100%;
                height: 200px;
                object-fit: cover;
                display: block;
              }

              /* Hero区域固定高度 */
              .hero-section {
                min-height: 400px;
                display: flex;
                align-items: center;
              }

              /* Footer 自适应高度 */
              footer {
                height: auto;
                margin-top: auto;
              }

              /* 字体优化 */
              .font-sans { font-display: swap; }

              /* 图片优化 */
              img {
                max-width: 100%;
                height: auto;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                display: block;
              }

              /* 网格布局 */
              .grid { display: grid; gap: 1rem; }
              .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
              .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
              @media (min-width: 640px) {
                .sm\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
              }
              @media (min-width: 768px) {
                .md\\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
              }

              /* 性能优化 - 只应用到需要的元素 */
              .game-card {
                will-change: auto;
                transform: translateZ(0);
              }
              .group:hover .group-hover\\:scale-105 {
                transform: scale(1.05);
                transition: transform 0.2s ease;
              }

              /* 布局容器预设 */
              .relative { position: relative; }
              .z-10 { z-index: 10; }
              .flex { display: flex; }
              .items-center { align-items: center; }
              .gap-8 { gap: 2rem; }
            `,
          }}
        />
      </head>
      <body 
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        suppressHydrationWarning={true}
      >
        <div id="__next" suppressHydrationWarning={true}>
          <HydrationErrorBoundary>
            <HydrationFix />
            <SafePreloadManager />
            {children}
          </HydrationErrorBoundary>
        </div>
      </body>
    </html>
  )
}