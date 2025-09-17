// 关键CSS内联组件 - 解决首屏渲染阻塞
// "Bad programmers worry about the code. Good programmers worry about data structures." - Linus
// 关键渲染路径的CSS必须内联，消除220ms阻塞

export function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        /* 关键首屏样式 - 内联以避免渲染阻塞 */
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, sans-serif;
          background: #ffffff;
          color: #000000;
        }

        /* 首页布局骨架 */
        .main-container {
          max-width: 1792px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .hero-section {
          height: 600px;
          background: linear-gradient(to right, #fb923c, #ec4899);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
        }

        /* 游戏网格骨架 */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .game-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          aspect-ratio: 4/3;
        }

        /* 加载占位符 */
        .loading-placeholder {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* 头部导航关键样式 */
        .header {
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .nav-container {
          max-width: 1792px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }

        /* 响应式断点 */
        @media (max-width: 768px) {
          .main-container {
            padding: 0 0.5rem;
          }

          .games-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .hero-section {
            height: 400px;
            margin-bottom: 1rem;
          }
        }
      `
    }} />
  )
}