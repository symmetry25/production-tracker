# Production Tracker

Production Tracker 是一个面向剧组、VFX、动画和制片团队的后台系统，用来管理项目、人员、镜头、资产、任务、媒体审阅、资源排期、预算审计、资金流向、AI 单据识别和自定义数据看板。

## Quick Start

```bash
npm install
npm run dev -- --hostname 127.0.0.1 --port 3100
```

打开 [http://127.0.0.1:3100/login](http://127.0.0.1:3100/login)。

本地无数据库时会进入演示模式：

- Email: `admin@studio.com`
- Password: `admin123`

演示模式包含 `Mkali's Mission` 示例项目、镜头、资产、任务、资源规划、媒体审阅、资金流向、动态数据模板和人员评分。

## Database Mode

复制环境变量文件：

```bash
cp .env.example .env.local
```

设置 `DATABASE_URL` 后运行：

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev -- --hostname 127.0.0.1 --port 3100
```

Seed 会创建管理员账号、示例用户、项目、镜头、资产、任务、版本、备注、阶段、工单和日历例外。

## Useful Scripts

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

建议每次提交前至少跑：

```bash
npm run typecheck
npm run lint
npm test -- --run src/app/api/extensions-route.test.ts src/app/api/reports/reports-route.test.ts src/app/api/permissions-route.test.ts src/lib/project-bootstrap.test.ts src/lib/formula.test.ts src/lib/importer.test.ts src/lib/resource-planning.test.ts src/lib/schedule-suggestions.test.ts
npm run build
```

## Core Features

- 项目网格：新建项目、删除项目、项目进度概览。
- 新项目初始化：可自动生成阶段、`MAIN` 分组、基础镜头、资产、任务和启动工单。
- 镜头/资产流水线：状态列、筛选、右键菜单、CSV 导出。
- 任务与甘特：任务表、预算风险、依赖、时间线视图。
- 媒体审阅：版本上传、播放、对比、播放列表、备注和审批状态。
- 资源规划：人天网格、容量图、部门下钻、日历例外、CSV 导出。
- 预算与资金：部门占比、资金流向、审计提示、供应商/个人/器材/住宿/车辆等数据。
- 通用录入：动态实体、字段管理、Excel/文本导入、导出、自定义可视化。
- AI 识别：发票、表格、手写单据、采购单等识别，支持 mock、OpenAI、Anthropic。
- 权限护栏：Admin/Producer/Supervisor/Artist/Reviewer 分层控制关键写操作。

## AI Providers

默认没有 API key 时使用 mock/rules 模式，便于演示。

启用 OpenAI：

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

启用 Anthropic：

```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

AI 功能会用于单据识别和排期建议。没有 key 时页面仍可试用。

## Deployment

### Vercel

推荐用于 Next.js。设置环境变量：

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL=https://your-domain.com`
- `NEXTAUTH_URL=https://your-domain.com`
- 可选：`OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`

部署后执行数据库迁移和 seed：

```bash
npm run db:migrate -- --name init
npm run db:seed
```

### Netlify

仓库根目录和 `production-tracker/` 内都包含 Netlify 配置。若从仓库根目录导入，根目录 `netlify.toml` 会自动把 Base directory 指到：

```text
production-tracker
```

构建命令：

```text
npm run build
```

发布目录：

```text
.next
```

Netlify 会通过 Next.js/OpenNext 适配运行服务端路由。

先发演示版时，可以暂时不配置 `DATABASE_URL`，但需要设置：

```env
AUTH_SECRET=generate-a-long-random-secret
NEXTAUTH_SECRET=generate-a-long-random-secret
AUTH_URL=https://your-netlify-site.netlify.app
NEXTAUTH_URL=https://your-netlify-site.netlify.app
NEXT_PUBLIC_APP_URL=https://your-netlify-site.netlify.app
DEMO_LOGIN_ENABLED=true
AI_PROVIDER=mock
NOTIFICATIONS_ENABLED=false
```

演示账号仍然是 `admin@studio.com` / `admin123`。此模式适合给人看功能，不适合真实多人生产。

正式试用或商业化时，关闭 `DEMO_LOGIN_ENABLED`，配置 `DATABASE_URL`，并执行数据库迁移和 seed。

## Storage

默认上传文件写入 `UPLOAD_DIR`，本地通常是 `./public/uploads`。生产环境可以打开 S3：

```env
USE_S3=true
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=production-tracker-media
S3_PUBLIC_URL=https://your-cdn-or-bucket-url
```

版本上传和通用记录附件会自动使用同一套存储适配器；没有开启 S3 时继续走本地目录。

## Trial Checklist

给别人试用前建议检查：

1. `/login` 能登录。
2. `/app/projects` 能看到示例项目或新建项目。
3. 新建项目勾选“初始化基础制作结构”后，进入项目能看到镜头、资产、任务、阶段和工单。
4. `/app/resource-planning` 能显示容量图和人天网格。
5. `/app/projects/demo-mkali-mission/resources` 能看到预算、审计和资金流向。
6. `/app/ai/recognize` 在无 API key 时能跑 mock 识别。
7. `npm run build` 通过。

## Notes

- 本地演示模式不需要数据库，但写操作通常只在前端模拟或内存态中生效。
- 真实多人试用必须连接 PostgreSQL，并设置强随机 `AUTH_SECRET`。
- Google OAuth 配置后会显示 Google 登录按钮；未配置时只显示账号密码登录。
