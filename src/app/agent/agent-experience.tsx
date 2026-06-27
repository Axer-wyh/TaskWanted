"use client";

import Link from "next/link";
import {
  ArrowRight,
  Browsers,
  GearSix,
  PlugsConnected,
  Robot,
  ShieldCheck,
  Sparkle,
  Warning,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FluidCubeStage, type FluidCubeFace } from "@/components/fluid-cube-stage";
import { useTaskWantedLocale } from "@/components/site-header";
import {
  ingestExternalOpportunity,
  spendAgentCredits,
  validateAgentPermission,
  type AgentPermission,
  type AgentTool,
} from "@/domain/taskwanted";
import type { ExternalOpportunity, MarketplaceSnapshot } from "@/lib/mvp-store";

type AgentExperienceProps = {
  snapshot: MarketplaceSnapshot;
};

type AgentRun = {
  id: string;
  title: string;
  detail: string;
  charged?: number;
};

const toolLabels: Record<AgentTool | "autopilot", string> = {
  opportunity_discovery: "Opportunity discovery",
  fit_cost_plan: "Fit and cost plan",
  delivery_framework: "Delivery framework",
  autopilot: "Autopilot execution",
};

export function AgentExperience({ snapshot }: AgentExperienceProps) {
  const locale = useTaskWantedLocale();
  const zh = locale === "zh";
  const [credits, setCredits] = useState(5_000);
  const [agentCreated, setAgentCreated] = useState(false);
  const [runs, setRuns] = useState<AgentRun[]>([
    {
      id: "run_seed",
      title: "Fit and cost plan completed",
      detail: "Mapped research scope, estimated 3.5 hours, prepared submission checklist.",
      charged: 120,
    },
  ]);
  const [opportunities, setOpportunities] = useState(snapshot.opportunities);
  const [watcherForm, setWatcherForm] = useState({
    url: "https://private-board.test/tasks/research-ai-tools",
    schedule: "*/45 * * * *",
    keywords: "",
    hints: "title: h1, budget: [data-budget]",
  });
  const [watcherMessage, setWatcherMessage] = useState("No third-party cookies stored.");
  const [policyMessage, setPolicyMessage] = useState("");

  const passiveStats = useMemo(
    () => [
      { label: "Passive earnings", value: "$420", detail: "Mock payout attribution" },
      { label: "Autopilot tasks", value: "6", detail: "Prepared or completed" },
      { label: "Need approval", value: "2", detail: "Submit actions paused" },
    ],
    [],
  );

  function createFreeAgent() {
    setAgentCreated(true);
    setRuns((current) => [
      {
        id: `run_${Date.now()}`,
        title: "Autopilot agent created",
        detail: "Skill, budget, risk, and passive income boundaries are ready.",
      },
      ...current,
    ]);
  }

  function buyPack(creditsToAdd: number) {
    setCredits((current) => current + creditsToAdd);
    setRuns((current) => [
      {
        id: `run_${Date.now()}`,
        title: "Credits purchased",
        detail: `${creditsToAdd.toLocaleString()} credits added to hunter account.`,
      },
      ...current,
    ]);
  }

  function runTool(tool: AgentTool | "autopilot") {
    const actualTool: AgentTool = tool === "autopilot" ? "delivery_framework" : tool;

    const permission = validateAgentPermission({
      requested:
        actualTool === "delivery_framework"
          ? "prepare_delivery_framework"
          : actualTool === "fit_cost_plan"
            ? "fit_cost_plan"
            : "opportunity_discovery",
      publisherAllowed: "prepare_delivery_framework",
      platformCeiling: "prepare_delivery_framework",
    });

    if (!permission.allowed) {
      setPolicyMessage(permission.reason);
      return;
    }

    try {
      const result = spendAgentCredits({ balance: credits, tool: actualTool, units: 1 });
      setCredits(result.balance);
      setPolicyMessage("");
      setRuns((current) => [
        {
          id: `run_${Date.now()}`,
          title: `${toolLabels[tool]} completed`,
          detail:
            tool === "autopilot"
              ? "Generated research draft, QA checklist, and submit-ready package pending user approval."
              : artifactDetail(actualTool),
          charged: result.charged,
        },
        ...current,
      ]);
    } catch (error) {
      setPolicyMessage(error instanceof Error ? error.message : "Agent run failed.");
    }
  }

  function tryExternalSubmit() {
    const permission = validateAgentPermission({
      requested: "external_submit" as AgentPermission,
      publisherAllowed: "prepare_delivery_framework",
      platformCeiling: "prepare_delivery_framework",
    });

    if (!permission.allowed) {
      setPolicyMessage(permission.reason);
    }
  }

  function syncLocalSource() {
    try {
      const opportunity = ingestExternalOpportunity({
        sourceId: "src_custom_local",
        sourceKind: "local-watcher",
        platform: "custom",
        url: watcherForm.url,
        title: watcherTitle(watcherForm.url),
        capturedAt: new Date("2026-06-26T09:00:00.000Z").toISOString(),
      }) as ExternalOpportunity;

      setOpportunities((current) => [
        {
          ...opportunity,
          fitScore: 84,
          level: "discovery",
        },
        ...current,
      ]);
      setWatcherMessage("No third-party cookies stored. Normalized opportunity received.");
    } catch (error) {
      setWatcherMessage(error instanceof Error ? error.message : "Watcher sync failed.");
    }
  }

  const faces: FluidCubeFace[] = [
    {
      id: "agent-hero",
      label: "Autonomous",
      labelZh: "自主",
      tone: "hero",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "自主赏金猎人 Agent" : "Autonomous hunter agents"}</p>
            <h1 className="cube-title">{zh ? "自主 Agent 被动赚钱。" : "Autonomous hunter agents"}</h1>
            <p className="cube-copy">
              {zh
                ? "免费创建 Agent，让它发现机会、自动执行可授权任务，并持续积累被动收益。"
                : "Create an agent that discovers tasks, prepares delivery, automates allowed work, and compounds passive bounty income."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="tw-button accent" onClick={createFreeAgent} type="button">
                <Sparkle size={17} weight="bold" />
                {zh ? "免费创建" : "Free create"}
              </button>
              <Link className="tw-button secondary" href="/agent/knowledge-base">
                {zh ? "了解更多" : "Learn more"}
                <ArrowRight size={17} weight="bold" />
              </Link>
            </div>
          </div>
          <div className="cube-metric-grid">
            <Metric label="Credit balance" value={credits.toLocaleString()} />
            <Metric label="Agents created" value={agentCreated ? "1" : "0"} />
            <Metric label="Autopilot tasks" value="6" />
            <Metric label="Passive earnings" value="$420" />
          </div>
        </div>
      ),
    },
    {
      id: "create-agent",
      label: "Free create",
      labelZh: "免费创建",
      tone: "accent",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "创建设置" : "Create setup"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">Free create</h2>
            <p className="cube-copy">
              {zh
                ? "配置技能、语言、最低赏金、风险边界和可投入时间。"
                : "Set skills, language, minimum bounty, risk limit, and available work time."}
            </p>
            <button className="tw-button accent mt-8" onClick={createFreeAgent} type="button">
              <Robot size={17} weight="bold" />
              {zh ? "免费创建 hunter agent" : "Free create hunter agent"}
            </button>
          </div>
          <div className="cube-list">
            <ConfigLine label="Skills" value="Research, writing, QA, AI agents" />
            <ConfigLine label="Language" value="English, Chinese, bilingual" />
            <ConfigLine label="Risk boundary" value="No unauthorized apply, bid, accept, submit" />
            <ConfigLine label="Minimum bounty" value="$180" />
          </div>
        </div>
      ),
    },
    {
      id: "autopilot",
      label: "Autopilot",
      labelZh: "自动执行",
      tone: "dark",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "自动执行" : "Autopilot execution"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">
              {zh ? "允许的任务，自动推进。" : "Allowed work moves by itself."}
            </h2>
            <p className="cube-copy">
              {zh
                ? "Agent 自动拆解任务、收集资料、生成草稿、检查交付包，需要提交时暂停等待确认。"
                : "The agent plans, researches, drafts, checks, and pauses before actions that need approval."}
            </p>
            <button className="tw-button accent mt-8" onClick={() => runTool("autopilot")} type="button">
              <GearSix size={17} weight="bold" />
              {zh ? "运行 Autopilot" : "Run autopilot"}
            </button>
          </div>
          <div className="cube-list">
            <ConfigLine label="Credits left" value={credits.toLocaleString()} />
            {passiveStats.map((stat) => (
              <ConfigLine key={stat.label} label={stat.label} value={`${stat.value} - ${stat.detail}`} />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "sources",
      label: "Sources",
      labelZh: "来源",
      tone: "plain",
      content: (
        <div className="grid gap-5 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="cube-list-item">
            <div className="flex items-center gap-2">
              <Browsers size={22} weight="duotone" />
              <h2 className="text-3xl font-semibold">{zh ? "外部来源" : "External sources"}</h2>
            </div>
            <Field label="Target URL">
              <input
                className="tw-input"
                onChange={(event) => setWatcherForm((current) => ({ ...current, url: event.target.value }))}
                value={watcherForm.url}
              />
            </Field>
            <Field label="Keywords">
              <input
                className="tw-input"
                onChange={(event) =>
                  setWatcherForm((current) => ({ ...current, keywords: event.target.value }))
                }
                value={watcherForm.keywords}
              />
            </Field>
            <button className="tw-button accent mt-5" onClick={syncLocalSource} type="button">
              <PlugsConnected size={17} weight="bold" />
              Sync local source
            </button>
            <p className="mt-4 text-sm leading-6 text-muted-strong">{watcherMessage}</p>
          </div>
          <div className="cube-list" data-testid="watcher-results">
            {opportunities.map((opportunity) => (
              <article className="cube-list-item" key={opportunity.id}>
                <p className="font-mono text-xs text-muted">{opportunity.platform}</p>
                <h3 className="mt-2 font-semibold">{opportunity.title}</h3>
                <p className="mt-2 text-sm text-muted-strong">{opportunity.url}</p>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "earnings",
      label: "Earnings",
      labelZh: "收益",
      tone: "accent",
      content: (
        <div className="cube-face-grid two">
          <div className="cube-face-grid three">
            {passiveStats.map((stat) => (
              <Metric key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
          <div className="cube-list-item">
            <p className="cube-kicker">{zh ? "Agent credits" : "Agent credits"}</p>
            <h2 className="mt-4 text-5xl font-semibold leading-none">
              {credits.toLocaleString()}
            </h2>
            <p className="cube-copy">
              {zh
                ? "猎人用 credits 购买 agent 执行能力，所有消耗都进入日志。"
                : "Hunters fund agent execution with credits, and every spend is logged."}
            </p>
            <button className="tw-button accent mt-6" onClick={() => buyPack(1_000)} type="button">
              {zh ? "购买 1,000 credits" : "Buy 1,000 credits"}
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "logs",
      label: "Logs",
      labelZh: "日志",
      tone: "plain",
      content: (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="cube-list">
            {runs.map((run) => (
              <article className="cube-list-item" key={run.id}>
                <p className="font-semibold">{run.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-strong">{run.detail}</p>
                {run.charged ? <p className="mt-2 font-mono text-xs text-muted">-{run.charged} credits</p> : null}
              </article>
            ))}
          </div>
          <div className="cube-list-item">
            <ShieldCheck size={24} weight="duotone" />
            <h2 className="mt-4 text-2xl font-semibold">Policy guardrails</h2>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              Allowed automation stays inside TaskWanted tasks or platform-approved API/OAuth actions.
            </p>
            <button className="tw-button secondary mt-5" onClick={tryExternalSubmit} type="button">
              <Warning size={17} weight="bold" />
              Try external submit
            </button>
            {policyMessage ? (
              <p className="mt-4 rounded-[8px] border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                {policyMessage}
              </p>
            ) : null}
          </div>
        </div>
      ),
    },
  ];

  return (
    <main>
      <FluidCubeStage
        faces={faces}
        initialFace="agent-hero"
        title="Autonomous hunter agents"
        titleZh="自主赏金猎人 Agent"
      />
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-4 grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
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

function ConfigLine({ label, value }: { label: string; value: string }) {
  return (
    <article className="cube-list-item">
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </article>
  );
}

function artifactDetail(tool: AgentTool) {
  if (tool === "opportunity_discovery") {
    return "Found external and TaskWanted opportunities with fit score and suggested next action.";
  }
  if (tool === "fit_cost_plan") {
    return "Estimated effort, competition level, payout risk, and execution plan.";
  }
  return "Prepared delivery framework, QA checklist, and submission package.";
}

function watcherTitle(url: string) {
  const tail = url.split("/").filter(Boolean).at(-1) ?? "custom-opportunity";
  return tail.replaceAll("-", " ");
}
