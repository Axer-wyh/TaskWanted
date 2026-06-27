# TaskWanted 页面结构与内容确认稿

状态：供确认和修改的页面结构文档。本文档不等同于最终实现，确认后再进入 UI、动效、流程补全和部署。

产品定位：TaskWanted 是 US-first、EN/ZH 双语的 AI-native bounty marketplace。核心角色是任务发布者和赏金猎人，平台承担任务公示、资金托管、交付协助、争议裁决、外部机会发现和 AI agent 增强执行能力。

参考产品内容抽象：

- Pump.fun Go：https://pump.fun/go
  - 内容重点是高频 bounty feed、创建赏金入口、Trending / Bounties / Submissions / Mine 等任务流切换、任务金额、倒计时、提交动态、最高价值任务、Top earners、Top spenders 等榜单。
  - 可借鉴点：让“悬赏公告板”有“正在发生”的交易感，而不是把这种 live market 逻辑放在首页。
- Dework Bounties：https://app.dework.xyz/bounties
  - 内容重点是 Open Bounties、Featured / All Bounties、搜索、排序、技能筛选、语言筛选和组织任务池。
  - 可借鉴点：让任务市场有清晰的信息架构，方便赏金猎人按技能、语言、预算、任务类型和组织来源筛选。

TaskWanted 的调整方向：

- 首页不直接采用 Pump.fun Go 的 live market 逻辑，只负责品牌、产品定位、核心流程和 AI agent 差异化表达。
- Pump.fun Go 的 live feed、Trending、Submissions、Mine、榜单等内容统一放到 `/bounties` 的“悬赏公告板”页面中承载，Trending 是该页面的核心板块之一。
- Bounties 页作为“悬赏公告板”，采用 Dework 的结构化筛选和列表体系，同时加入 TaskWanted 的 blind contest、escrow、AI risk pricing、agent allowed 等差异化字段。
- Agent 页不做普通聊天工具，而是成为猎人侧的 opportunity intelligence layer，基于市场榜单、技能匹配、外部来源和 local watcher 生成可执行任务机会。

## 1. 全站信息架构

### 1.1 顶部导航

固定导航栏需要服务两个目标：快速进入核心业务流程，以及展示平台可信度。

导航结构：

- Brand：TaskWanted
- Home：首页，负责品牌、产品定位、核心流程、AI agent 差异化和主要转化入口
- Bounties / 悬赏公告板：任务市场完整页，负责 Trending、发布、浏览、筛选、提交、选定获胜者和释放赏金
- Agent：赏金猎人 agent 工作台，强调自主发现机会、自动化执行任务、被动收益和 agent 审计日志
- Ecosystem / 生态：首页锚点入口，点击滚动到 `/#ecosystem`
- About / 关于我们：首页锚点入口，点击滚动到 `/#about`

导航右侧组件：

- Connect wallet：连接钱包，展示截断地址
- Sign in：登录入口，后续对接 Supabase Auth
- User avatar：已登录状态展示用户头像，点击进入 `/profile` 个人中心
- Language：EN/ZH 切换，要求全站文案双语可落地
- Theme：Dark/Light 切换，默认跟随当前产品视觉，保留本地偏好
- Mobile menu：移动端折叠菜单，包含同等入口和状态控件

### 1.2 全站基础状态

MVP 需要统一以下状态展示：

- 已登录/未登录
- 已连接/未连接钱包
- 当前语言
- 当前主题
- 任务发布者视角
- 赏金猎人视角
- 管理员视角
- 支付沙盒状态
- Agent credit 余额
- External source 同步状态
- 当前用户头像、角色、钱包、个人中心入口
- 首页锚点状态：生态、关于我们
- 悬赏公告板当前任务流：Trending / Bounties / Submissions / Mine
- 悬赏公告板当前筛选条件：技能、语言、预算、来源、截止时间、agent 可用性
- 悬赏公告板当前榜单条件：highest value、fast closing、top sponsors、top hunters、agent fit

## 2. 首页 `/`

### 2.1 页面目标

首页不是普通落地页，而是产品的第一工作台入口。首屏需要同时完成三件事：

- 让用户马上理解 TaskWanted 是 AI-native 任务悬赏平台
- 让发布者立即看到创建赏金、托管资金和吸引提交的路径
- 让赏金猎人理解 agent 如何帮助发现机会、制定计划和准备交付
- 引导用户进入“悬赏公告板”查看 Trending、任务列表和提交动态
- 首页不承载 live market、Trending、Submissions、Mine 或市场榜单内容

### 2.2 首屏 Hero

内容结构：

- 主标题：TaskWanted
- 副标题：Aim at open bounties. Ship with agents. Win real payouts.
- 中文辅助说明：发布开放赏金，猎人盲审提交，AI agent 帮助发现机会、制定计划、准备交付
- CTA 1：Create bounty，跳转 `/bounties` 的发布区
- CTA 2：Open bounty board，跳转 `/bounties`
- 次级入口：Open agent workbench，跳转 `/agent`
- 信任指标：
  - Blind submissions
  - Stripe sandbox escrow
  - Base USDC pilot records
  - AI risk pricing
  - Local watcher supported

首屏产品状态条：

- Blind contest engine
- Escrow-backed payouts
- Autonomous hunter agents
- Local watcher architecture
- No third-party password storage

视觉要求：

- 全站视觉和页面交互动效以 Pixel Perfect `fluid-cube-scroll` 为主。
- 整个屏幕是一个可滚动、可旋转的 Fluid Cube 舞台，不只是局部背景装饰。
- 每个核心板块的内容呈现在 cube 的不同侧面；滚动、锚点点击和页面切换驱动 cube 转到对应面。
- 首屏必须有明确的 3D 空间感和可交互感，不能只有大标题和介绍文案。

### 2.3 全屏动效：Fluid Cube 舞台

参考来源：

- Pixel Perfect Blocks Scroll：https://www.pixel-perfect.space/blocks?tab=scroll
- 本地参考：Pixel Perfect UI Archive 的 `fluid-cube-scroll`

交互设计：

- 页面使用一个固定的 full-viewport cube scene 作为主舞台。
- Hero、核心产品流程、生态、关于我们、公告板 CTA 等首页板块分别绑定到 cube 的不同侧面。
- 用户滚动时，cube 按 section progress 旋转到下一侧面，当前侧面内容进入可读状态。
- 用户点击顶部导航锚点时，cube 直接转到对应侧面，例如 `/#ecosystem` 和 `/#about`。
- CTA、按钮、卡片 hover 只触发轻量的面内高亮，不再作为独立主视觉动效。
- 如需保留赏金猎人“瞄准感”，只作为 cube 面上的短促 lock-on 高亮反馈，不再使用独立的全局指针系统。

可访问性和降级：

- `prefers-reduced-motion: reduce` 时关闭 3D 旋转和流体变形，改为静态 section fade 或直接锚点跳转。
- 移动端降低 cube 旋转幅度，避免大角度 3D 翻转影响阅读。
- 所有目标元素仍然需要可键盘聚焦

### 2.4 首页 cube 侧面映射

首页不再用普通纵向区块堆叠表达内容，而是把核心内容组织为 cube 的不同侧面。

推荐映射：

- Front face：Hero，呈现 TaskWanted 品牌、主 CTA、产品状态条
- Right face：How TaskWanted closes a bounty，呈现发布、agent、盲审、裁决、放款流程
- Top face：Ecosystem / 生态，呈现发布者、猎人、agents、watcher、外部平台、支付托管、裁决机制
- Left face：About / 关于我们，呈现使命、普通用户收益路径、合规与安全承诺
- Back face：Bounty board CTA，承接用户进入 `/bounties`
- Bottom face：Trust signals，呈现审计日志、kill switch、禁止行为、争议处理

实现约束：

- 作为 client-only 视觉组件加载
- 检测低性能设备和 reduced motion 后降级为静态像素背景
- WebGL/canvas 层需要设置 pointer-events 策略，避免抢占业务交互

### 2.5 首页核心产品流程区

位置：

- 作为 cube 的 Right face，在用户从 Hero 向下滚动或点击流程入口时进入视野
- 该区域不是 live market，也不展示 Trending、Submissions、Mine 或具体任务流
- 它需要像一个 AI bounty operating system 的流程预览，而不是普通营销卡片区

交互参考：

- 继续使用 `fluid-cube-scroll` 的 cube 面切换作为首页主交互
- 区域内的流程内容随 cube 旋转进入当前侧面
- 鼠标滚动优先驱动 cube 侧面切换，到达当前页面边界后再释放给常规页面滚动

内容结构：

- 区块标题：How TaskWanted closes a bounty
- 区块说明：From funded brief to blind submissions, agent support, judgment, and payout
- 卡片字段：
  - Step title
  - Role：Sponsor / Hunter / Agent / Platform
  - Core action
  - Trust mechanism
  - AI assist point
  - Risk control
  - CTA：Open board / Open agent

推荐首批流程卡：

- Fund a clear bounty：发布者创建任务并进入托管
- Hunt with agent support：猎人用 agent 发现机会、评估成本和准备交付
- Submit blind work：猎人盲审提交，平台保护评审公平性
- Judge one winner：发布者选择单一获胜者
- Release payout：平台记录抽成、释放赏金并进入审计日志

滚轮交互规则：

- Pointer 在 cube 舞台内：滚轮优先驱动 cube 旋转和侧面切换
- 当前 cube 面未切换完成：阻止页面主滚动
- cube 面到达起止边界：释放滚动给页面
- Pointer 离开区域：恢复全局滚动
- 键盘用户可用 Tab 聚焦当前面内容，用方向键或锚点按钮切换 cube 侧面

### 2.6 首页后续区块

建议保留并加强以下区块：

- How the contest closes：展示发布、提交、盲审、裁决、放款闭环
- Autonomous hunter agents：展示 agent 如何自主发现机会、自动执行可授权任务、创造被动收益，同时保留合规边界
- External Bounty Agent Lite：展示官方 API/OAuth、自定义 URL、local watcher 三类来源
- Trust and admin signals：展示审计日志、kill switch、禁止行为、争议处理
- Bounty board CTA：引导用户进入 `/bounties` 查看 Trending、Featured、All Bounties 和 Submissions

首屏底部锚点板块：

- Ecosystem / 生态：展示 TaskWanted 的参与方和生态闭环，包括任务发布者、赏金猎人、AI agents、local watcher、外部 bounty 平台、支付与托管轨道、管理员裁决机制。
- About / 关于我们：展示 TaskWanted 为什么存在、解决什么问题、如何让普通用户借助 agent 参与任务经济，以及平台对合规、安全、托管和公平裁决的承诺。
- 这两个板块需要在首页首屏底部有可见入口，顶部导航点击后平滑滚动到对应位置；用户在其他页面点击时跳回 `/#ecosystem` 或 `/#about`。

## 3. 悬赏公告板 `/bounties`

### 3.1 页面目标

该页面需要完整体现 TaskWanted 自有 bounty marketplace，并承载 Trending、任务列表、提交动态、Mine 和榜单能力，而不是只做任务列表。

用户在这个页面应能完成：

- 浏览公开任务
- 搜索和筛选任务
- 切换 Trending / Bounties / Submissions / Mine 任务流
- 按技能、语言、预算、来源、截止时间、agent 可用性筛选
- 发布任务
- 看到 AI risk pricing
- 看到托管支付状态
- 进入任务详情
- 提交盲审方案
- 选定单一获胜者
- 释放赏金并记录平台费用

### 3.2 页面结构

顶部区：

- 标题：Bounty Board / 悬赏公告板
- 说明：Browse open contests, track trending bounties, submit blind work, and win escrow-backed payouts
- 指标：
  - Open contests
  - Featured bounties
  - Blind submissions
  - AI priced fee tiers：0.1% / 1% / 3%
  - Payout volume
  - Avg time to winner

主任务流：

- Trending：综合金额、热度、提交增长和临近截止
- Bounties：开放任务列表
- Submissions：最新匿名提交动态
- Mine：我发布的、我提交的、我收藏的、agent 正在跟踪的任务

任务看板：

- 搜索框，支持任务标题、组织、标签、技能、来源
- 快捷排序：
  - Highest value
  - Closing soon
  - Most submitted
  - Newest
  - Best agent fit
  - Lowest risk
- 状态筛选：Open / Reviewing / Awarded / Paid / Disputed
- 内容分组：
  - Featured bounties
  - All bounties
  - External opportunities
  - Recently paid
- 左侧筛选栏：
  - Skills：Development、Design、Writing、Marketing、Research、Data、Operations、Legal、Translation、Community、Product、AI agents
  - Language：English、Chinese、Bilingual
  - Budget：金额区间
  - Payment rail：Stripe escrow、Base USDC pilot、External platform
  - Source：TaskWanted、Upwork、Freelancer、Custom watcher
  - Agent support：Allowed、Planning only、Not allowed
  - Risk：Low、Standard、High
  - Deadline：24h、3d、7d、Any
- 任务卡字段：
  - 标题
  - 描述
  - Sponsor：发布者、组织或钱包
  - 预算
  - 货币
  - Escrow 状态
  - 状态
  - 风险等级
  - 平台费率
  - 截止时间
  - 提交数量
  - 浏览数或关注数
  - 最新提交时间
  - 标签
  - 技能分类
  - 语言要求
  - 是否允许 agent 辅助
  - CTA：View / Submit / Track with agent

发布任务表单：

- Title
- Description
- Budget
- Currency
- Deadline
- Tags
- Required skills
- Language requirement
- Submission requirements
- Winner selection rule
- Judging mode
- External source allowed
- Payment rail：Stripe sandbox / Base USDC pilot
- Create funded bounty

风险定价区：

- Low risk：0.1%
- Standard risk：1%
- High risk：3%
- 显示 platform fee、estimated payout、pricing reason

任务详情区：

- 当前选中任务
- Sponsor profile：发布者、历史付款、争议记录、响应速度
- 任务状态
- Escrow 状态
- Reward breakdown：总金额、平台费、预计获胜者到账
- 提交规则
- Eligibility：地区、技能、语言、账号要求
- Deliverables：交付物格式、验收标准、禁止行为
- Blind submission 输入框
- Submit entry
- Track with agent
- Select winner
- Release payout
- Activity log
- Related bounties

### 3.3 核心流程

发布者流程：

1. 创建任务
2. 填写预算和规则
3. 系统计算风险等级和费率
4. 选择支付方式并进入托管状态
5. 等待盲审提交
6. 查看匿名提交
7. 选择单一获胜者
8. 释放赏金
9. 系统记录平台抽成、payout 和审计事件

赏金猎人流程：

1. 浏览任务
2. 通过技能、语言、预算、截止时间和 agent fit 缩小范围
3. 查看任务详情
4. 判断 agent 是否允许辅助
5. 用 agent 生成计划、成本估算和交付框架
6. 准备方案
7. 提交 blind entry
8. 等待裁决
9. 获胜后进入 payout 记录

平台流程：

1. 检查禁止任务
2. 计算风险费率
3. 记录托管状态
4. 记录提交和裁决
5. 记录争议和管理员操作
6. 对异常任务执行 takedown 或 kill switch

### 3.4 页面需要补足的内容

- 任务详情应从列表点击进入明显状态，而不是用户猜测当前选中任务
- 悬赏公告板需要拆出 Trending / Featured / All / External / Paid 等内容分组
- 筛选栏需要覆盖技能、语言、预算、来源、风险和 agent 可用性
- 发布表单需要更像真实产品工作流，最好拆为规则、资金、审核三个小段
- 提交区需要显示 blind 模型：发布者在截止前只能看到匿名摘要或不可见完整身份
- 释放赏金需要展示平台费、获胜者到账、付款轨道
- 需要有 Submissions feed，展示匿名提交动态和平台活跃度
- Mine 视图需要同时覆盖我发布、我提交、我收藏、agent 正在跟踪
- 需要增加空状态、错误态、加载态

## 4. Agent 页面 `/agent`

### 4.1 页面目标

Agent 页面是赏金猎人侧的自动化收益工作台。它不能只展示 agent 概念，而要强调“创建 agent 后，由 agent 自主发现机会、自动化完成可执行任务、持续带来被动收益”的产品心智。

核心定位：

- 自主发现：agent 持续扫描 TaskWanted 悬赏公告板、官方外部集成和用户本地 watcher 来源。
- 自动执行：agent 自动评估任务、拆解计划、准备交付物，并在 TaskWanted 内部任务和明确授权场景中执行可自动化步骤。
- 被动收益：用户配置技能、偏好、预算和风险边界后，agent 持续寻找可赚取赏金的机会。
- 合规边界：第三方平台的自动申请、竞标、接受和提交必须遵守目标平台 API、OAuth 和服务规则；不允许绕过 CAPTCHA、paywall 或目标平台限制。

首屏 CTA：

- 免费创建：创建第一个 hunter agent，进入 agent 配置流程
- 了解更多：跳转 `/agent/knowledge-base`，后续补充 agent 知识库、自动化边界、收益模型和使用教程

用户在这个页面应能完成：

- 查看 credit 余额
- 购买 credit pack
- 免费创建 hunter agent
- 配置自动化收益目标：技能、语言、任务类型、最低赏金、风险等级、可投入时间
- 选择 agent run 类型
- 运行 Discovery、Autopilot execution、Fit and plan、Delivery framework
- 查看 artifacts
- 查看被策略拦截的高风险动作
- 配置官方外部平台来源
- 配置 local watcher
- 查看 normalized opportunities
- 按市场信号筛选机会：highest value、closing soon、top sponsor、low competition、high agent fit
- 把机会加入 Mine / Watchlist
- 查看被动收益记录、待确认提交、已完成任务和 payout

### 4.2 页面结构

顶部区：

- 标题：Autonomous hunter agents
- 说明：Create an agent that discovers tasks, prepares delivery, automates allowed work, and compounds passive bounty income
- CTA：
  - 免费创建：进入 agent 创建流程
  - 了解更多：跳转 `/agent/knowledge-base`
- 指标：
  - Credit balance
  - Agents created
  - Active sources
  - Opportunities found
  - Autopilot tasks
  - Passive earnings
  - Blocked risky actions

Credits 区：

- 当前余额
- Credit packs
- 每个 pack 的价格、credits、适合场景
- Buy credits
- Spend history

Agent runs 区：

- Discovery agent
  - 目标：发现平台内外任务机会，并按技能、语言、预算、截止时间和竞争强度排序
  - 输出：机会列表、匹配理由、优先级、预计投入时间
- Autopilot execution agent
  - 目标：在用户授权和平台规则允许的范围内，自动完成任务拆解、资料收集、草稿生成、检查和可自动化交付步骤
  - 输出：执行进度、生成文件、提交前检查、收益预测、需要用户确认的动作
- Fit and plan agent
  - 目标：评估任务匹配度、成本、风险、执行计划
  - 输出：fit score、cost estimate、competition estimate、execution plan
- Delivery framework agent
  - 目标：准备交付框架、检查清单、提交材料结构
  - 输出：artifact outline、submission draft framework、QA checklist

Policy guardrails 区：

- Allowed：
  - 机会发现
  - 成本和计划评估
  - 交付框架准备
  - TaskWanted 内部任务的授权自动化执行
  - 第三方平台 API/OAuth 明确允许的自动化动作
  - 用户确认后的提交、申请或付款相关动作
- Blocked：
  - 未经授权的自动申请
  - 未经授权的自动竞标
  - 未经授权的自动接受任务
  - 未经授权的自动提交
  - CAPTCHA solving
  - Paywall bypass
  - 存储第三方密码或 session cookies

Agent log 区：

- Run ID
- Agent 类型
- 消耗 credits
- 输入摘要
- 输出 artifacts
- 工具调用记录
- 策略拦截原因
- 管理员可审计标记

### 4.3 External Bounty Agent Lite

官方集成：

- Upwork：优先官方 API/OAuth，可用性以平台规则为准
- Freelancer.com：优先官方 API/OAuth，可用性以平台规则为准

自定义来源：

- 用户配置目标平台 URL
- 用户配置 schedule
- 用户配置 keywords
- 用户配置 filters
- 用户配置 optional parsing hints
- 用户本地运行 local watcher
- local watcher 在用户设备上读取用户已登录页面
- 平台只接收 normalized opportunity records
- 平台不存储第三方密码、session cookies 或原始账号会话

机会池字段：

- Source
- Opportunity title
- Sponsor
- Budget
- URL
- Tags
- Required skills
- Language
- Fit score
- Competition estimate
- Deadline
- Time left
- Discovered at
- Duplicate status
- Source health
- Suggested next action：View、Track、Plan、Prepare framework

### 4.4 Local Watcher 配置流程

配置步骤：

1. 用户在 Agent 页面新增 custom source
2. 输入目标 URL
3. 设置 schedule，例如 every 30 minutes
4. 设置 keywords 和 filters
5. 可选填写 parsing hints
6. 下载或启动本地 watcher
7. watcher 从用户本机浏览器或用户授权 session 上下文读取页面
8. watcher 提取 normalized opportunity records
9. watcher 推送到 TaskWanted API
10. Agent 页面显示同步结果和失败原因

异常处理：

- 解析失败：保留失败记录，提示用户更新 parsing hints
- 重复机会：合并或标记 duplicate
- 访问撤销：停止同步并提示 reconnect
- 页面布局变化：降级为人工确认字段映射
- 平台禁止自动化：禁用 connector 或要求手动导入

### 4.5 Agent 知识库 `/agent/knowledge-base`

该页面由 Agent 页的“了解更多”CTA 跳转进入，MVP 可先做占位内容，后续补充完整教程和策略说明。

页面内容：

- Agent 能做什么：自主发现、任务评估、执行计划、交付物生成、合规自动化、收益记录
- Agent 不能做什么：绕过 CAPTCHA、绕过 paywall、盗用账号、存储第三方密码、违反目标平台规则
- 如何免费创建第一个 agent
- 如何配置技能、语言、预算、风险边界和收益目标
- 如何连接外部来源和 local watcher
- 如何理解 Autopilot execution、用户确认和策略拦截
- 如何查看被动收益、payout 和 agent audit log

## 5. 个人中心 `/profile`

个人中心通过顶部右侧已登录头像进入。该页面不是 Admin，不处理全站管理权限，只服务当前用户的身份、资产、任务和 agent 记录。

### 5.1 页面目标

用户在个人中心应能完成：

- 查看头像、昵称、钱包地址、登录方式和语言偏好
- 查看角色状态：任务发布者、赏金猎人、双角色用户
- 查看我发布的任务
- 查看我提交的任务
- 查看我收藏或跟踪的任务
- 查看 agent credit 余额和消费记录
- 查看 payout、refund、USDC pilot record
- 管理 local watcher 和 external source 权限

### 5.2 页面结构

顶部身份区：

- Avatar
- Display name
- Wallet address
- Login status
- Role badges
- Profile settings

任务资产区：

- My posted bounties
- My submissions
- Watchlist
- Agent tracked opportunities
- Payout records

Agent 和来源区：

- Credit balance
- Credit usage history
- Agent run history
- Connected sources
- Local watcher status
- Revoked or failed source access

安全和偏好区：

- Language preference
- Theme preference
- Wallet disconnect
- Source access revoke
- Notification preference

## 6. Admin 控制台

MVP 可先作为内部页面或隐藏入口，后续建议独立为 `/admin`。

### 6.1 任务管理

- 查看所有任务
- 查看状态、预算、风险等级、提交数
- Takedown 任务
- 标记 prohibited task
- 触发 kill switch

### 6.2 支付管理

- 查看 Stripe sandbox escrow 状态
- 查看 webhook 事件
- 重放 webhook
- 查看 duplicate webhook 处理
- 查看 refund
- 查看 failed payout
- 查看 Base USDC pilot transaction record

### 6.3 争议管理

- 查看争议任务
- 查看提交记录
- 查看发布者和猎人沟通摘要
- 记录裁决
- 触发退款、重开评审或释放 payout

### 6.4 Agent 审计

- 查看 agent run
- 查看 tool policy decision
- 查看 blocked risky action
- 查看 credit usage
- 查看 generated artifacts
- 查看 local watcher sync log

## 7. 双语内容策略

页面需要支持 EN/ZH，而不是只切换按钮文字。

建议规则：

- 标题可保留英文品牌表达
- 解释性文案提供中文版本
- 表单字段需要完整双语词典
- 错误信息、支付状态、agent 拦截原因必须双语
- 管理员日志可先英文结构化，前台用户可见部分必须双语

## 8. 视觉和动效系统

### 8.1 视觉关键词

- AI-native
- Full-screen Fluid Cube
- Cube face content
- Scroll-driven spatial UI
- Pixel-fluid surface
- Blind contest
- Escrow confidence

### 8.2 全站 Fluid Cube 规则

全站视觉系统以 `fluid-cube-scroll` 为唯一主视觉动效。它不是某个局部模块，而是贯穿首页、悬赏公告板、Agent、个人中心和知识库的统一空间容器。

核心规则：

- 每个页面都运行在 full-viewport cube stage 中。
- 页面内的主要板块映射到 cube 的不同侧面。
- 滚动、顶部导航、页面内锚点和主要 CTA 都可以驱动 cube 转到目标侧面。
- 当前 active face 的内容必须清晰、可读、可点击；非 active face 可以保留轮廓、色块或弱化投影，不抢占阅读。
- 表单、任务列表、任务详情、agent 日志等高密度内容可以在 active face 内部纵向滚动，但外层 cube 仍承担页面级转场。
- 首页、生态、关于我们可以使用更强的 cube 旋转和流体遮罩；悬赏公告板和 Agent 这类工作台页面降低旋转幅度，优先保证操作效率。
- reduced motion 下关闭 3D 翻转，改为普通 section 切换、锚点跳转和静态 cube 面背景。

页面映射建议：

- 首页：Hero、核心流程、生态、关于我们、公告板 CTA、信任信号分别对应不同 cube face。
- 悬赏公告板：Trending、All Bounties、Submissions、Mine、Create bounty、Bounty detail 分别对应不同 cube face 或 face 内标签层。
- Agent：价值主张、免费创建、Autopilot execution、外部来源、被动收益、Agent logs 分别对应不同 cube face。
- 个人中心：身份、我的任务、收益记录、来源权限、偏好设置分别对应不同 cube face。
- Agent 知识库：能力说明、不能做什么、创建教程、收益模型、合规边界分别对应不同 cube face。

### 8.3 动效组件清单

全站必做：

- Full-screen Fluid Cube stage
- Scroll-driven cube rotation
- Anchor-driven cube face switching
- Cube face content reveal
- Fluid mask or pixel-fluid surface response
- Reduced-motion static face fallback

悬赏公告板页面建议：

- Trending face rotation and reveal
- 任务卡 hover target pulse
- 发布任务表单 step transition
- 风险费率变化的数字动效
- Activity log 的新增事件入场动效

Agent 页面建议：

- Agent run timeline
- Credit 消耗数字动效
- Opportunity cards 的 scan reveal
- Policy blocked action 的 redline glitch

### 8.4 动效强度限制

- 首页可以使用最高强度 cube 转场
- 悬赏公告板和 Agent 页面也使用 cube 舞台，但降低旋转幅度和遮罩强度，优先工作台效率
- 所有长时间循环动效要可降级
- reduced motion 下保留层级和状态，不保留强位移

## 9. API 和数据结构对应关系

当前 MVP 需要覆盖以下数据面：

- Marketplace snapshot：任务、外部来源、机会、admin signal、credit pack
- Market feeds：Trending、Bounties、Submissions、Mine
- Market rankings：highest value、closing soon、top sponsors、top hunters、best agent fit
- Bounty filters：技能、语言、预算、来源、支付轨道、风险、截止时间、agent 可用性
- Bounty create：创建并进入 funded 状态
- Blind submission：猎人提交方案
- Submission feed：匿名提交动态、提交时间、任务关联、可见性规则
- Winner selection：发布者选择获胜者
- Payout release：释放赏金并记录平台费
- Watchlist / Mine：收藏任务、我发布的任务、我提交的任务、agent 跟踪中的任务
- Profile data：头像、昵称、钱包、角色、偏好、个人任务和 payout 记录
- Agent create：免费创建 hunter agent、配置技能、语言、预算、风险边界和收益目标
- Agent autopilot：自主发现、自动化执行状态、待确认动作、生成 artifacts、策略拦截记录
- Passive earnings：agent 贡献收益、已完成任务、待发放收益、payout 归因
- Agent permissions：判断 agent 动作是否允许
- Agent credits：扣减和记录 credits
- External watcher ingest：接收 normalized opportunity records
- Opportunity scoring：fit score、competition estimate、time left、suggested next action
- Duplicate detection：外部机会去重
- Admin audit log：任务、支付、agent、watcher 操作记录

## 10. GitHub 和部署目标

目标仓库：

- GitHub：https://github.com/Axer-wyh/TaskWanted

当前本地注意事项：

- 当前工作区分支为 `codex/taskwanted-mvp`
- 本地仓库暂未检测到 remote 配置
- 等页面结构确认后，再配置 remote、提交版本、推送到 GitHub，并部署到 Vercel

建议发布节奏：

1. 确认本文档页面结构
2. 实现全站 Fluid Cube 舞台和首页 cube face 内容
3. 补全悬赏公告板完整业务流程展示
4. 补全 Agent 页面外部来源和 local watcher 工作流展示
5. 增加个人中心页面
6. 增加 Admin 内部控制台
7. 完成响应式、双语、主题、可访问性和浏览器验证
8. 推送 GitHub 并部署 Vercel

## 11. 待确认问题

请确认或直接修改以下决策：

- 全站是否统一采用 full-screen Fluid Cube 舞台作为主交互
- 首页核心产品流程区是否作为 cube 的 Right face 呈现
- 悬赏公告板是否使用 Bounties / 悬赏公告板 作为导航文案
- 悬赏公告板和 Agent 页的 cube 旋转强度是否需要比首页更低
- Admin 是否保持隐藏入口，不进入顶部导航
- 个人中心是否只通过头像进入，还是也在移动端菜单中显示文字入口
- Agent 页面是否需要增加“自动接单已禁用”的显式说明模块
- GitHub 是否使用当前分支 `codex/taskwanted-mvp` 推送，还是新建 feature 分支
