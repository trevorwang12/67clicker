/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [180, 242, 273, 285, 384, 400],
    minimumCacheTTL: 86400,
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'lucide-react',
    ],
    serverComponentsExternalPackages: [],
    cssChunking: 'strict',
    // 移除不兼容的特性，专注于已验证的优化
    optimizeCss: true,
  },

  webpack: (config, { isServer }) => {
    // 简化webpack配置，避免模块解析问题
    if (process.env.NODE_ENV === 'production' && !isServer) {
      config.devtool = false
    }
    return config
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: false,
    // 启用React编译器优化
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Bundle analyzer for production optimization
  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  // SEO and metadata optimizations
  generateEtags: true,

  // Redirects for SEO
  async redirects() {
    return [
      // Add any SEO redirects here if needed
    ]
  },

  // Headers for SEO optimization and compression
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600' // API缓存优化
          },
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
}

export default nextConfig