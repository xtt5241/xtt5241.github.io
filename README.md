# XTT Blog

一个前后端分离的个人博客：

- `apps/web`：公开站点，Next.js，默认端口 `3000`
- `apps/cms`：内容管理后台与 API，Payload CMS，默认端口 `3001`
- 本地开发使用 SQLite；前台在 CMS 未启动或没有文章时会显示示例内容

## 一、第一次启动

需要 Node.js 20.9 或更高版本，推荐使用 pnpm。

```bash
pnpm install
pnpm setup
pnpm dev
```

`pnpm setup` 会完成两件事：

- 创建 `apps/web/.env.local`，让前台连接本地 CMS
- 创建 `apps/cms/.env`，并生成随机的后台安全密钥

命令不会覆盖已经存在的配置。

启动后打开：

- 博客前台：<http://localhost:3000>
- 管理后台：<http://localhost:3001/admin>

第一次打开管理后台会看到 `Welcome` 页面。填写邮箱、密码和昵称，创建第一个管理员。这个账号只保存在本地数据库中。

## 二、第一次发布文章

建议按照下面的顺序操作。

### 1. 创建分类

进入后台左侧的 **内容 → 分类 → Create New**：

- `名称`：例如“计算机视觉”
- `网址标识`：可以不填，保存时会自动生成
- `简介`：可选

### 2. 创建标签

进入 **内容 → 标签**，创建“目标检测”“C++”等标签。网址标识同样可以留空。

### 3. 上传图片

进入 **内容 → 媒体库**：

- 上传图片
- 填写替代文本，用于无障碍访问和图片加载失败时的说明
- 图片说明可选

### 4. 撰写文章

进入 **内容 → 文章 → Create New**：

- `标题`：必填
- `正文`：必填，支持标题、列表、引用、链接、代码块和图片
- `摘要`：可留空，系统会从正文自动截取；推荐发布前手动润色
- `网址标识`：可留空，系统会根据标题生成
- `封面`、`分类`、`标签`：从已有内容中选择
- `首页精选`：勾选后优先显示在首页大卡片中
- `预计阅读分钟`：可留空，系统会自动估算
- `发布时间`：首次发布时自动填写，也可手动指定旧文章日期

编辑过程会自动保存草稿，但自动保存不会更新公开页面。也可以使用 `Ctrl+S`（macOS 为 `Command+S`）明确保存当前草稿；这两个动作都不会公开文章。准备好后点击 **Publish**；若文章已经发布过，则点击 **Publish changes**。保存草稿后，即使表单不再显示未保存修改，**Publish changes** 仍然可以继续使用。发布成功后刷新前台即可看到最新内容。

已经发布的文章会出现预览入口，可直接打开对应前台页面。草稿不会被公开 API 返回。

小x代写博客时，默认会直接在 CMS 中创建或更新草稿，不会自动发布。项目内的 Markdown 仅作为编辑源，后台文章草稿才是后续修改和发布入口。

## 三、修改“关于我”

进入后台左侧的 **站点 → 个人资料**，可以维护：

- 名字与一句话介绍
- 所在地
- 头像
- 关于我的正文
- GitHub、邮箱或其他社交链接

保存后，前台 `/about` 页面会自动读取这些内容。后台没有填写个人资料时，前台使用本地默认资料。

## 四、修改站点名称与首页文案

品牌名、首页描述、默认头像和 GitHub 地址集中在：

```text
apps/web/src/config/site.ts
```

修改后开发服务器会自动刷新。首页背景图位于：

```text
apps/web/public/images/hero-legacy.png
```

可以用同名图片替换，也可以修改 `site.ts` 中的 `heroImage` 路径。

## 五、常用命令

```bash
pnpm dev          # 同时启动前台和 CMS
pnpm dev:web      # 只启动前台
pnpm dev:cms      # 只启动 CMS
pnpm typecheck    # TypeScript 检查
pnpm lint         # 代码规范检查
pnpm build        # 前后台生产构建
pnpm export:content # 导出已发布内容和媒体文件
pnpm build:pages  # 本地验证 GitHub Pages 静态产物
```

停止开发服务器时，在运行命令的终端按 `Ctrl+C`。

## 六、发布到 GitHub Pages

公开站点由 `xtt5241/xtt5241.github.io` 仓库的 GitHub Actions 发布，地址为：

```text
https://xtt5241.github.io/
```

GitHub Pages 只托管静态文件。后台文章点击 **Publish changes** 后，会自动导出公开内容并推送到 GitHub，随后由 GitHub Actions 更新 Pages。文章编辑页也提供 **同步到 GitHub Pages** 按钮，可用于手动重试。

如果自动同步暂时失败，也可以在 CMS 运行期间执行：

```bash
pnpm export:content
git add apps/web/src/content/snapshot.json apps/web/public/media
git commit -m "Update blog content"
git push
```

`export:content` 只导出已发布文章、公开个人资料和媒体文件，不会导出管理员、密码哈希、草稿或 CMS 数据库。推送后 GitHub Actions 会自动构建和更新 Pages。

## 七、环境变量

前台配置位于 `apps/web/.env.local`：

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CMS_URL=http://localhost:3001
```

CMS 配置位于 `apps/cms/.env`：

```dotenv
DATABASE_URI=file:./xtt-blog.db
PAYLOAD_SECRET=由 pnpm setup 自动生成
WEB_URL=http://localhost:3000
CMS_URL=http://localhost:3001
```

当前 GitHub Pages 使用公开内容快照，不需要部署 CMS，也不会读取仓库中的环境变量。

## 八、常见问题

### 前台一直显示示例文章

确认以下条件：

1. `apps/web/.env.local` 中存在 `NEXT_PUBLIC_CMS_URL`
2. CMS 正在运行
3. 文章状态是 `Published`，而不是 `Draft`
4. 修改环境变量后重新启动了开发服务器

### 图片在后台能看到，前台看不到

确认 `NEXT_PUBLIC_CMS_URL` 与实际 CMS 地址完全一致，然后重启前台。前台会根据这个地址生成图片白名单。

### 端口被占用

先停止旧的 `pnpm dev` 进程。前台和 CMS 必须分别使用不同端口，并同步修改环境变量中的地址。

### 忘记管理员密码或需要重置本地数据

数据库文件是 `apps/cms/xtt-blog.db`。先停止服务器并备份这个文件；移动它之后重新启动 CMS，会进入首次创建管理员的状态。不要在已有正式内容时直接删除数据库。

本地开发没有配置邮件服务，`Forgot password?` 生成的重置邮件只会输出在运行 CMS 的终端中，不会真的发送到邮箱。正式部署时需要增加邮件适配器。
