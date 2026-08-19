# muxinqi.com

个人网站的源码。Astro + Tailwind CSS，构建成静态资源，由 Cloudflare Workers 托管。

规范域名是 `https://muxinqi.com`（写在 `astro.config.mjs` 的 `site` 里，canonical、sitemap
和 RSS 的绝对地址都从这里来）。

> **main 分支 push 之后会自动构建并部署到生产环境**，提交即发布。
> 改动先在分支上做。

## 命令

| 命令              | 作用                                     |
| ----------------- | ---------------------------------------- |
| `npm install`     | 安装依赖                                 |
| `npm run dev`     | 本地开发服务器（**草稿内容在这里可见**） |
| `npm run check`   | 类型检查（`astro check`）                |
| `npm run build`   | 生产构建到 `dist/`（草稿会被排除）       |
| `npm run preview` | 构建后用 `wrangler dev` 本地跑一遍       |
| `npm run deploy`  | 手动构建并部署（平时不需要，push 即部署）|

## 写内容

所有内容是 `src/content/` 下的 Markdown。怎么加文章、加项目、改首页的 Now 区块，
以及还有哪些地方等着填，见 [`src/content/README.md`](src/content/README.md)。

`draft: true` 的条目只在 `npm run dev` 里可见，永远不会进生产构建。

## 结构

```
src/
  content.config.ts        内容集合的 schema
  content/
    projects/              项目
    posts/                 文章
    now/                   首页 Now 区块
  lib/                     取内容和格式化日期的辅助函数
  layouts/BaseLayout.astro 文档外壳：metadata、导航、页脚
  components/              跨页面复用的组件
  pages/                   路由
  styles/global.css        design tokens（换视觉只改这里）+ 基础排版
```

视觉方向还没定。颜色和字体全部是 `global.css` 顶部的 CSS 变量，
换皮时不需要动页面结构。
