# 67Clicker Next.js 应用 Dockerfile
# 优化的多阶段构建，适用于 Dokploy 部署

# 基础镜像：Node.js 18 Alpine（轻量级）
FROM node:18-alpine AS base

# 安装依赖阶段
FROM base AS deps
# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装依赖（包括 sharp 用于图像优化）
RUN npm ci --only=production && npm cache clean --force

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 复制源代码
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN npm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

# 创建 nextjs 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public

# 复制 standalone 构建产物
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 创建并设置数据目录权限
RUN mkdir -p ./data ./public/uploads
RUN chown -R nextjs:nodejs ./data ./public/uploads

# 切换到 nextjs 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
CMD ["node", "server.js"]