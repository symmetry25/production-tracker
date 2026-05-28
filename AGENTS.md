# Agent Development Standards

这个项目是剧组预算、人员、器材、通告、审计和资金流向管理工具。后续开发默认遵守下面的工作方式。

## Core Workflow Skills

优先使用 Matt Pocock skills 作为工程流程：

- `setup-matt-pocock-skills`：第一次进入仓库或项目规范缺失时使用，用来建立 issue、领域文档和 ADR 约定。
- `grill-with-docs`：需求还模糊时使用。先追问、澄清领域语言，再动代码。
- `to-prd`：当一个想法变成较大功能时使用，先整理成 PRD。
- `to-issues`：当 PRD 或计划较大时使用，拆成可独立完成的垂直任务。
- `diagnose`：遇到 bug、页面错位、金额错误、图表异常时使用。先建立可复现反馈循环，再修复。
- `tdd`：涉及核心计算、导入解析、审计规则、资金流向等高风险逻辑时使用测试驱动。
- `improve-codebase-architecture`：当文件继续膨胀、功能难改、概念混乱时使用，找出可加深的模块。
- `prototype`：界面方向、交互模型或数据结构不确定时，先做可丢弃原型。

## Product And UI Skills

从 `awesome-claude-code-skills` 和 `nexu-io/open-design` 清单中选定以下补充规范：

- `web-design-guidelines`：用于页面布局、图表、电脑屏幕体验、按钮密度、表格可读性和视觉层级检查。
- `product-marketing`：用于商业定位、目标用户、卖点、竞品、LinkedIn/朋友圈介绍、融资表达。
- `context7`：用于查询最新技术文档，尤其是 AI API、Netlify、GitHub、前端框架和第三方库。
- `taste-skill`：用于降低通用 AI UI 味道，控制视觉密度、动效强度和设计变化度，让后台界面更像专业制片工具。

## Default Development Rules

- 先理解当前页面和数据结构，再改代码。
- 面向电脑屏幕优先，但窄窗口不能坏。
- 预算、人员、器材、通告、审计、资金流向之间的数据必须一致。
- 图表优先服务判断：金额、占比、风险、进度必须清楚。
- UI 要克制、专业、可扫描，避免营销页式堆卡片。
- 重大功能先用 `grill-with-docs` 或 `to-prd` 明确范围。
- 复杂计算和导入解析优先用 `tdd`。
- bug 修复优先用 `diagnose`。
- 每次完成一组稳定修改后提交 Git 版本。

## Suggested User Phrases

- “用 grill-with-docs 帮我拷问这个功能”
- “把这个想法整理成 PRD”
- “把这个 PRD 拆成 issues”
- “用 diagnose 查这个 bug”
- “用 tdd 做这个计算逻辑”
- “用 web-design-guidelines 审查当前页面”
- “用 taste-skill 去掉 AI 排版味道”
- “用 product-marketing 帮我写商业介绍”
- “用 context7 查最新 API 文档”
