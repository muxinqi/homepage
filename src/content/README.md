# 怎么往站点里加内容

所有内容都是这个目录下的 Markdown 文件。文件名就是 URL：
`projects/cosplit.md` → `/projects/cosplit/`。

## draft 开关

每个文件的 frontmatter 里都有 `draft`：

- `draft: true` —— 只在本地 `npm run dev` 里看得到，**永远不会进生产构建**。
- 删掉这一行（或写 `draft: false`）—— 下次构建就会发布。

写到一半可以放心提交，只要 draft 还在就不会上线。

> **注意：main 分支 push 之后会自动构建部署到 muxinqi.com。**
> 提交即发布，没有额外的确认步骤。

## 加一篇文章

复制 `posts/example.md`，改文件名（用短横线，别用空格和中文），然后：

```yaml
title: 收据取整为什么不能总把零头给同一个人   # 具体的问题或完整的结论，别写"关于 X 的一些记录"
summary: 列表页和 RSS 里显示的一句话
created: 2026-08-18
updated: 2026-09-02   # 可选，改过才写
tags: [astro, cloudflare]   # 可选
lang: zh                    # zh 或 en
draft: true
```

## 加一个项目

复制 `projects/menu.md`：

```yaml
title: CoSplit
summary: 列表页显示的一句话
status: shipped        # active / shipped / paused / retired / unfinished
created: 2026-01-15
updated: 2026-08-18    # 可选
url: https://cosplit.net       # 可选
repo: https://github.com/...   # 可选
featured: true         # 首页只显示 featured 的项目
lang: zh
draft: true
```

`status` 要诚实——停掉的写 `paused`，不做了的写 `retired`，没做完的写 `unfinished`。
这是这个站点的一条设计前提：不把不动了的东西说成还在维护。

## 首页的 Now 区块

改 `now/current.md`，最多四条。删掉 `draft: true` 才会显示；
把整个文件删掉，首页那一块就整块消失。

## 正文里别用 HTML 注释

`<!-- 这样的注释 -->` 会原样出现在生成的页面源码里。要留备忘就写在
frontmatter 里，用 `#` 开头的 YAML 注释——那些不会输出。

---

## 还没写、等你补的内容

- **`projects/cosplit.md`** —— 现在只有从公开信息能确认的部分。缺：真实的起止日期、
  当初为什么做、现在到底还维护不维护、关键的产品和技术决策、做过的取舍、截图、学到了什么。
- **`projects/menu.md`** —— 缺：为什么做、真实日期。
- **`now/current.md`** —— 三条现状。
- **`src/pages/about.astro`** —— 现在只有 GitHub profile 上那两句已公开的话。缺：
  简短个人经历、你喜欢做什么样的东西、工作之外愿意公开的兴趣、
  是否公开邮箱（公开哪个）、要不要放简历。
- **`public/images/avatar.jpg`** —— 现在是从 GitHub 头像下载的 192px 版本。
  要换成别的（照片 / 字母组合 / 别的图）直接替换这个文件。
