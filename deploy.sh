#!/bin/bash

# 67Clicker Dokploy 部署脚本
# 使用方法: ./deploy.sh [环境]

set -e  # 出错时退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 检查 Node.js 和 npm
check_prerequisites() {
    print_message "检查部署前置条件..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm 未安装"
        exit 1
    fi

    print_success "前置条件检查通过"
}

# 清理和构建
build_application() {
    print_message "清理和构建应用..."

    # 清理旧的构建文件
    rm -rf .next
    rm -rf out

    # 安装依赖
    print_message "安装依赖包..."
    npm ci --only=production

    # 构建应用
    print_message "构建 Next.js 应用..."
    npm run build

    print_success "应用构建完成"
}

# 运行测试
run_tests() {
    print_message "运行基本检查..."

    # 检查构建产物
    if [ ! -d ".next" ]; then
        print_error "构建失败：.next 目录不存在"
        exit 1
    fi

    # 检查必要文件
    if [ ! -f "package.json" ]; then
        print_error "package.json 文件不存在"
        exit 1
    fi

    if [ ! -f "next.config.mjs" ]; then
        print_error "next.config.mjs 文件不存在"
        exit 1
    fi

    print_success "基本检查通过"
}

# 验证部署配置
validate_config() {
    print_message "验证部署配置..."

    if [ ! -f "dokploy.yml" ]; then
        print_error "dokploy.yml 配置文件不存在"
        exit 1
    fi

    if [ ! -f "Dockerfile" ]; then
        print_warning "Dockerfile 不存在（可选）"
    fi

    print_success "部署配置验证通过"
}

# 备份数据
backup_data() {
    print_message "备份重要数据..."

    # 创建备份目录
    BACKUP_DIR="backup_$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"

    # 备份数据文件
    if [ -d "data" ]; then
        cp -r data "$BACKUP_DIR/"
        print_success "数据文件已备份到 $BACKUP_DIR"
    fi

    # 备份上传文件（只备份最近的）
    if [ -d "public/uploads" ]; then
        mkdir -p "$BACKUP_DIR/uploads"
        find public/uploads -name "*.webp" -mtime -7 -exec cp {} "$BACKUP_DIR/uploads/" \;
        print_success "最近上传文件已备份"
    fi
}

# 主部署流程
main() {
    print_message "开始 67Clicker 部署流程"

    # 检查参数
    ENV=${1:-production}
    print_message "部署环境: $ENV"

    # 执行部署步骤
    check_prerequisites
    validate_config
    backup_data
    build_application
    run_tests

    print_success "🚀 部署准备完成！"
    echo ""
    print_message "接下来的步骤:"
    echo "1. 将代码推送到 Git 仓库"
    echo "2. 在 Dokploy 面板中连接仓库"
    echo "3. 使用 dokploy.yml 配置进行部署"
    echo ""
    print_message "健康检查端点: /api/health"
    print_message "部署配置文件: dokploy.yml"
}

# 捕获错误
trap 'print_error "部署过程中发生错误"' ERR

# 运行主函数
main "$@"