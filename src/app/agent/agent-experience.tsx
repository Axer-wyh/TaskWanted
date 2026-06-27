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

  return (
    <main className="task-page" data-testid="agent-page" data-theme="dark">
      <section className="task-hero">
        <div className="task-page-shell task-hero-grid">
          <div>
            <p className="task-kicker">{zh ? "自主赏金猎人 Agent" : "Autonomous hunter agents"}</p>
            <h1 className="task-title">
              {zh ? "让 Agent 替你赚取被动收益。" : "Autonomous hunter agents"}
            </h1>
            <p className="task-copy">
              {zh
                ? "免费创建 Agent，让它自主发现机会、自动完成可授权任务，并把可提交状态交给你确认。"
                : "Create an agent that discovers tasks, prepares delivery, automates allowed work, and compounds passive bounty income."}
            </p>
            <div className="task-actions">
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
          <div className="task-cube-scene" aria-hidden="true">
            <div className="task-cube">
              {Array.from({ length: 6 }).map((_, index) => (
                <span className={`task-cube-face face-${index}`} key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section id="agent-overview" kicker={zh ? "收益概览" : "Agent yield"} title="Passive earning cockpit">
        <div className="task-panel-grid four">
          <Metric label="Credit balance" value={credits.toLocaleString()} />
          <Metric label="Agents created" value={agentCreated ? "1" : "0"} />
          <Metric label="Autopilot tasks" value="6" />
          <Metric label="Passive earnings" value="$420" />
        </div>
      </Section>

      <Section id="create-agent" kicker={zh ? "免费创建" : "Free create"} title="Configure the hunter agent">
        <div className="task-split">
          <div className="task-panel">
            <p className="task-copy mt-0">
              {zh
                ? "配置技能、语言、最低赏金、风险边界和可投入时间。创建后 Agent 会先发现机会，再准备执行方案。"
                : "Set skills, language, minimum bounty, risk limit, and available work time before the agent starts hunting."}
            </p>
            <button className="tw-button accent mt-8" onClick={createFreeAgent} type="button">
              <Robot size={17} weight="bold" />
              {zh ? "创建 hunter agent" : "Create hunter agent"}
            </button>
          </div>
          <div className="task-list">
            <ConfigLine label="Skills" value="Research, writing, QA, AI agents" />
            <ConfigLine label="Language" value="English, Chinese, bilingual" />
            <ConfigLine label="Risk boundary" value="No unauthorized apply, bid, accept, submit" />
            <ConfigLine label="Minimum bounty" value="$180" />
          </div>
        </div>
      </Section>

      <Section id="autopilot" kicker={zh ? "自动执行" : "Autopilot"} title="Allowed work moves by itself">
        <div className="task-split">
          <div className="task-panel accent-panel">
            <p className="task-copy mt-0">
              {zh
                ? "Agent 自动拆解任务、收集资料、生成草稿、检查交付包，需要提交时暂停等待确认。"
                : "The agent plans, researches, drafts, checks, and pauses before actions that need approval."}
            </p>
            <button className="tw-button accent mt-8" onClick={() => runTool("autopilot")} type="button">
              <GearSix size={17} weight="bold" />
              {zh ? "运行 Autopilot" : "Run autopilot"}
            </button>
          </div>
          <div className="task-list">
            <ConfigLine label="Credits left" value={credits.toLocaleString()} />
            {passiveStats.map((stat) => (
              <ConfigLine
                key={stat.label}
                label={stat.label}
                value={`${stat.value} - ${stat.detail}`}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section id="sources" kicker={zh ? "外部机会" : "External sources"} title="Discover work beyond TaskWanted">
        <div className="task-split narrow-left">
          <div className="task-panel">
            <div className="flex items-center gap-2">
              <Browsers size={22} weight="duotone" />
              <h2 className="text-3xl font-semibold">{zh ? "本地监控源" : "Local watcher source"}</h2>
            </div>
            <Field label="Target URL">
              <input
                className="tw-input"
                onChange={(event) =>
                  setWatcherForm((current) => ({ ...current, url: event.target.value }))
                }
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
            <Field label="Schedule">
              <input
                className="tw-input"
                onChange={(event) =>
                  setWatcherForm((current) => ({ ...current, schedule: event.target.value }))
                }
                value={watcherForm.schedule}
              />
            </Field>
            <Field label="Parsing hints">
              <textarea
                className="tw-input min-h-24"
                onChange={(event) =>
                  setWatcherForm((current) => ({ ...current, hints: event.target.value }))
                }
                value={watcherForm.hints}
              />
            </Field>
            <button className="tw-button accent mt-5" onClick={syncLocalSource} type="button">
              <PlugsConnected size={17} weight="bold" />
              Sync local source
            </button>
            <p className="mt-4 text-sm leading-6 text-muted-strong">{watcherMessage}</p>
          </div>
          <div className="task-list" data-testid="watcher-results">
            {opportunities.map((opportunity) => (
              <article className="task-panel compact" key={opportunity.id}>
                <p className="font-mono text-xs text-muted">{opportunity.platform}</p>
                <h3 className="mt-2 font-semibold">{opportunity.title}</h3>
                <p className="mt-2 text-sm text-muted-strong">{opportunity.url}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="earnings" kicker={zh ? "Credits 与收益" : "Credits and earnings"} title="Fund execution, attribute payouts">
        <div className="task-split">
          <div className="task-panel-grid three">
            {passiveStats.map((stat) => (
              <Summary key={stat.label} detail={stat.detail} title={stat.label} value={stat.value} />
            ))}
          </div>
          <div className="task-list">
            {snapshot.agentCreditPacks.map((pack) => (
              <button
                className="task-list-row"
                key={pack.name}
                onClick={() => buyPack(pack.credits)}
                type="button"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{pack.name}</h3>
                    <p className="mt-2 text-sm text-muted-strong">{pack.bestFor}</p>
                  </div>
                  <span className="rounded-[8px] bg-foreground px-3 py-2 font-mono text-sm text-background">
                    ${pack.priceUsd}
                  </span>
                </div>
                <p className="mt-3 font-mono text-xs text-muted">
                  {pack.credits.toLocaleString()} credits
                </p>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section id="logs" kicker={zh ? "日志与边界" : "Logs and guardrails"} title="Every agent action stays auditable">
        <div className="task-split">
          <div className="task-list">
            {runs.map((run) => (
              <article className="task-panel compact" key={run.id}>
                <p className="font-semibold">{run.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-strong">{run.detail}</p>
                {run.charged ? (
                  <p className="mt-2 font-mono text-xs text-muted">-{run.charged} credits</p>
                ) : null}
              </article>
            ))}
          </div>
          <div className="task-panel">
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
      </Section>
    </main>
  );
}

function Section({
  id,
  kicker,
  title,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="task-section" id={id}>
      <div className="task-page-shell">
        <div className="task-section-header">
          <p className="task-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
        {children}
      </div>
    </section>
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
    <div className="task-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Summary({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="task-metric">
      <span>{title}</span>
      <strong>{value}</strong>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </div>
  );
}

function ConfigLine({ label, value }: { label: string; value: string }) {
  return (
    <article className="task-panel compact">
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
