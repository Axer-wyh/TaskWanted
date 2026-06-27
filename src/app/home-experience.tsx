"use client";

import Link from "next/link";
import {
  ArrowRight,
  CurrencyCircleDollar,
  Database,
  PlugsConnected,
  Robot,
  Scales,
  ShieldCheck,
  Target,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { FluidCubeStage, type FluidCubeFace } from "@/components/fluid-cube-stage";
import { useTaskWantedLocale } from "@/components/site-header";
import type { MarketplaceSnapshot } from "@/lib/mvp-store";

type HomeExperienceProps = {
  snapshot: MarketplaceSnapshot;
};

const flowSteps = [
  {
    title: "Fund a clear bounty",
    titleZh: "托管清晰悬赏",
    body: "Sponsors publish a funded brief with deliverables, rules, payment rail, and winner criteria.",
    bodyZh: "发布者创建已托管任务，声明交付物、规则、支付轨道和获胜标准。",
  },
  {
    title: "Hunt with agents",
    titleZh: "用 Agent 接近任务",
    body: "Hunters configure autonomous agents to discover, assess, and prepare allowed work.",
    bodyZh: "猎人配置自主 Agent，持续发现机会、评估适配度并准备可执行交付。",
  },
  {
    title: "Submit blind work",
    titleZh: "盲审提交",
    body: "Entries stay blind until judgment, keeping the contest open and fair.",
    bodyZh: "提交在裁决前保持盲审，让开放竞赏更公平。",
  },
  {
    title: "Release payout",
    titleZh: "释放收益",
    body: "One winner receives payout, fees and audit events are recorded.",
    bodyZh: "单一获胜者获得收益，平台记录抽成和审计事件。",
  },
];

export function HomeExperience({ snapshot }: HomeExperienceProps) {
  const locale = useTaskWantedLocale();
  const zh = locale === "zh";

  const faces: FluidCubeFace[] = [
    {
      id: "hero",
      label: "Hero",
      labelZh: "首屏",
      tone: "hero",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">
              {zh ? "AI 原生悬赏平台" : "AI-native bounty platform"}
            </p>
            <h1 className="cube-title">TaskWanted</h1>
            <p className="cube-copy">
              {zh
                ? "发布开放悬赏。让自主 Agent 发现、执行并放大被动收益。"
                : "Open bounties for autonomous hunters, blind submissions, and escrow-backed payouts."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="tw-button accent" href="/bounties">
                {zh ? "打开悬赏公告板" : "Open bounty board"}
                <ArrowRight size={17} weight="bold" />
              </Link>
              <Link className="tw-button secondary" href="/agent">
                {zh ? "免费创建" : "Free create"}
                <Robot size={17} weight="bold" />
              </Link>
            </div>
          </div>
          <div className="cube-metric-grid">
            <Metric label={zh ? "盲审引擎" : "Blind engine"} value="Single winner" />
            <Metric label={zh ? "托管支付" : "Escrow rails"} value="Stripe + Base" />
            <Metric label={zh ? "自主 Agent" : "Autonomous agents"} value="Autopilot" />
            <Metric label={zh ? "本地监听" : "Local watcher"} value="No cookies" />
          </div>
        </div>
      ),
    },
    {
      id: "flow",
      label: "Flow",
      labelZh: "流程",
      tone: "accent",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "任务闭环" : "Bounty close loop"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">
              {zh ? "How TaskWanted closes a bounty" : "How TaskWanted closes a bounty"}
            </h2>
            <p className="cube-copy">
              {zh
                ? "从资金托管、Agent 辅助、盲审提交到裁决放款，每一步都可审计。"
                : "From funded brief to autonomous support, blind work, judgment, and payout."}
            </p>
          </div>
          <div className="cube-list">
            {flowSteps.map((step) => (
              <article className="cube-list-item" key={step.title}>
                <h3 className="font-semibold">{zh ? step.titleZh : step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-strong">
                  {zh ? step.bodyZh : step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "ecosystem",
      label: "Ecosystem",
      labelZh: "生态",
      tone: "plain",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "生态" : "Ecosystem"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">
              {zh ? "任务经济的三方操作系统。" : "A three-sided operating system."}
            </h2>
            <p className="cube-copy">
              {zh
                ? "发布者、猎人、Agent、外部平台、本地 watcher 和支付托管共同组成闭环。"
                : "Sponsors, hunters, agents, external boards, local watchers, and payout rails share one workflow."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Signal icon={<Target size={22} />} title="Sponsors" body="Fund clear bounty briefs." />
            <Signal icon={<Robot size={22} />} title="Agents" body="Discover and execute allowed work." />
            <Signal icon={<PlugsConnected size={22} />} title="Sources" body="OAuth, APIs, and local watcher." />
            <Signal icon={<CurrencyCircleDollar size={22} />} title="Payouts" body="Escrow, USDC records, audit logs." />
          </div>
        </div>
      ),
    },
    {
      id: "about",
      label: "About",
      labelZh: "关于我们",
      tone: "dark",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "关于我们" : "About TaskWanted"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">
              {zh ? "让普通用户也能参与任务收益。" : "Let everyday users earn from open work."}
            </h2>
            <p className="cube-copy">
              {zh
                ? "TaskWanted 把悬赏、Agent、合规自动化和资金托管组合成一个可参与、可验证、可结算的任务平台。"
                : "TaskWanted combines bounty contests, compliant automation, local monitoring, and escrow into one verifiable flow."}
            </p>
          </div>
          <div className="cube-list">
            <Signal icon={<ShieldCheck size={22} />} title="Safety" body="No third-party passwords or session storage." />
            <Signal icon={<Scales size={22} />} title="Fairness" body="Blind submissions and single-winner decisions." />
            <Signal icon={<Database size={22} />} title="Records" body="Payments, disputes, and agent actions are inspectable." />
          </div>
        </div>
      ),
    },
    {
      id: "board",
      label: "Board CTA",
      labelZh: "公告板",
      tone: "accent",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "悬赏公告板" : "Bounty board"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">
              {zh ? "市场动态留给公告板。" : "Market motion lives on the board."}
            </h2>
            <p className="cube-copy">
              {zh
                ? "首页只讲产品机制。Trending、Submissions、Mine 和榜单全部进入悬赏公告板。"
                : "Home explains the system. Trending, submissions, Mine, and rankings live inside Bounty Board."}
            </p>
            <Link className="tw-button accent mt-8" href="/bounties">
              {zh ? "进入悬赏公告板" : "Open bounty board"}
              <ArrowRight size={17} weight="bold" />
            </Link>
          </div>
          <div className="cube-metric-grid">
            <Metric label="Open contests" value={String(snapshot.bounties.length)} />
            <Metric label="External sources" value={String(snapshot.externalSources.length)} />
            <Metric label="Agent opportunities" value={String(snapshot.opportunities.length)} />
            <Metric label="Risk pricing" value="0.1 / 1 / 3%" />
          </div>
        </div>
      ),
    },
    {
      id: "trust",
      label: "Trust",
      labelZh: "信任",
      tone: "plain",
      content: (
        <div className="cube-face-grid three">
          <Signal icon={<ShieldCheck size={22} />} title="Kill switch" body="Admin can pause risky tasks and connectors." />
          <Signal icon={<Scales size={22} />} title="Blind submissions" body="Contest review protects identities until judgment." />
          <Signal icon={<Database size={22} />} title="Audit trail" body="Payments, agent runs, and watcher syncs stay inspectable." />
        </div>
      ),
    },
  ];

  return (
    <main>
      <FluidCubeStage faces={faces} initialFace="hero" title="TaskWanted home" titleZh="首页" />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="cube-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Signal({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="cube-list-item">
      <div className="text-accent-soft">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-strong">{body}</p>
    </article>
  );
}
