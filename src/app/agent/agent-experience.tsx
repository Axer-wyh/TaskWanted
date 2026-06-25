"use client";

import {
  ArrowRight,
  BellRinging,
  Browsers,
  CheckCircle,
  Coins,
  FileLock,
  GearSix,
  LinkSimple,
  LockKey,
  PlugsConnected,
  Robot,
  ShieldCheck,
  Sparkle,
  TerminalWindow,
  Warning,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  ingestExternalOpportunity,
  spendAgentCredits,
  validateAgentPermission,
  type AgentPermission,
  type AgentTool,
} from "@/domain/taskwanted";
import { DecryptedText } from "@/components/decrypted-text";
import { useTaskWantedLocale } from "@/components/site-header";
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

const toolLabels: Record<AgentTool, string> = {
  opportunity_discovery: "Opportunity discovery",
  fit_cost_plan: "Fit and cost plan",
  delivery_framework: "Delivery framework",
};

export function AgentExperience({ snapshot }: AgentExperienceProps) {
  const locale = useTaskWantedLocale();
  const zh = locale === "zh";
  const [credits, setCredits] = useState(5_000);
  const [activePanel, setActivePanel] = useState<"run" | "sources" | "policy">("run");
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

  const estimatedRun = useMemo(
    () => [
      "Discover matching third-party bounty sources",
      "Score fit against hunter skills and credit budget",
      "Prepare delivery outline and submission checklist",
    ],
    [],
  );

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

  function runTool(tool: AgentTool) {
    const permission = validateAgentPermission({
      requested:
        tool === "delivery_framework"
          ? "prepare_delivery_framework"
          : tool === "fit_cost_plan"
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
      const result = spendAgentCredits({ balance: credits, tool, units: 1 });
      setCredits(result.balance);
      setPolicyMessage("");
      setRuns((current) => [
        {
          id: `run_${Date.now()}`,
          title: `${toolLabels[tool]} completed`,
          detail: artifactDetail(tool),
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
      setActivePanel("policy");
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
    <main className="overflow-hidden">
      <section className="relative border-b border-line">
        <div className="pixel-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100dvh-68px)] max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div
            className="self-end pb-4"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52 }}
          >
            <DecryptedText
              className="font-mono text-xs font-semibold text-muted-strong"
              encryptedClassName="text-accent-soft"
              text={zh ? "猎人付费 Agent / 外部机会发现" : "Hunter-paid agents / External source discovery"}
            />
            <h1 className="mt-6 max-w-4xl text-[clamp(3.2rem,8vw,7.2rem)] font-semibold leading-[0.88] tracking-normal">
              {zh ? "赏金猎人的 Agent 工作台。" : "Hunter agent workbench"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-7 text-muted-strong">
              {zh
                ? "Agent 只做发现、评估和交付框架准备。自动申请、竞标、接单、提交和绕过限制都被阻断。"
                : "Agents discover opportunities, evaluate fit, and prepare delivery frameworks. They do not apply, bid, accept, or submit."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="tw-button accent" onClick={() => runTool("opportunity_discovery")} type="button">
                <Sparkle size={17} weight="bold" />
                {zh ? "运行发现" : "Run discovery"}
              </button>
              <button className="tw-button secondary" onClick={() => setActivePanel("sources")} type="button">
                <PlugsConnected size={17} weight="bold" />
                {zh ? "配置外部来源" : "Configure watcher"}
              </button>
            </div>
          </motion.div>

          <div className="tw-panel self-end p-5">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="font-mono text-xs text-muted">{zh ? "猎人余额" : "Hunter balance"}</p>
                <p className="mt-2 text-4xl font-semibold">{credits.toLocaleString()}</p>
                <p className="mt-1 text-sm text-muted-strong">credits left</p>
              </div>
              <Coins size={46} weight="duotone" />
            </div>
            <div className="mt-4 grid gap-3">
              {snapshot.agentCreditPacks.map((pack) => (
                <button
                  className="flex items-center justify-between rounded-[8px] border border-line bg-surface px-4 py-3 text-left transition hover:bg-surface-muted"
                  key={pack.name}
                  onClick={() => buyPack(pack.credits)}
                  type="button"
                >
                  <span>
                    <span className="block font-semibold">{pack.name}</span>
                    <span className="mt-1 block text-sm text-muted">{pack.bestFor}</span>
                  </span>
                  <span className="font-mono text-sm">
                    {pack.credits.toLocaleString()} / ${pack.priceUsd}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <aside className="tw-panel p-4">
          <div className="grid gap-2">
            <PanelButton
              active={activePanel === "run"}
              icon={<Robot size={18} />}
              label={zh ? "Agent 运行" : "Agent runs"}
              onClick={() => setActivePanel("run")}
            />
            <PanelButton
              active={activePanel === "sources"}
              icon={<Browsers size={18} />}
              label={zh ? "外部来源" : "External sources"}
              onClick={() => setActivePanel("sources")}
            />
            <PanelButton
              active={activePanel === "policy"}
              icon={<ShieldCheck size={18} />}
              label={zh ? "权限边界" : "Policy guardrails"}
              onClick={() => setActivePanel("policy")}
            />
          </div>

          <div className="mt-5 rounded-[8px] border border-line bg-surface-muted p-4">
            <p className="font-semibold">{zh ? "运行计划" : "Execution plan"}</p>
            <div className="mt-3 grid gap-2">
              {estimatedRun.map((item) => (
                <div className="flex items-start gap-2 text-sm text-muted-strong" key={item}>
                  <CheckCircle className="mt-0.5 text-accent-soft" size={16} weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="min-h-[680px]">
          <AnimatePresence mode="wait">
            {activePanel === "run" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="tw-panel p-5"
                exit={{ opacity: 0, y: -12 }}
                initial={false}
                key="run"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{zh ? "Agent 能力" : "Agent capabilities"}</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-strong">
                      {zh
                        ? "每次运行都会扣减 credits，并生成可审计日志和交付物框架。"
                        : "Each run consumes credits and leaves auditable logs plus delivery artifacts."}
                    </p>
                  </div>
                  <button className="tw-button secondary" onClick={tryExternalSubmit} type="button">
                    <LockKey size={17} weight="bold" />
                    {zh ? "尝试禁止动作" : "Try external submit"}
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <RunCard
                    body="Find matching tasks across TaskWanted, Upwork, Freelancer.com, and approved local watcher sources."
                    cta="Run discovery"
                    icon={<BellRinging size={24} weight="duotone" />}
                    onRun={() => runTool("opportunity_discovery")}
                    price="50 credits"
                    title="Discovery"
                  />
                  <RunCard
                    body="Estimate fit, time, cost, delivery risk, and whether the task is worth a hunter bid."
                    cta="Run fit plan"
                    icon={<GearSix size={24} weight="duotone" />}
                    onRun={() => runTool("fit_cost_plan")}
                    price="120 credits"
                    title="Fit and plan"
                  />
                  <RunCard
                    body="Prepare outlines, acceptance checks, evidence folders, and submission-ready framing."
                    cta="Prepare framework"
                    icon={<FileLock size={24} weight="duotone" />}
                    onRun={() => runTool("delivery_framework")}
                    price="220 credits"
                    title="Delivery framework"
                  />
                </div>

                {policyMessage ? (
                  <div className="mt-5 rounded-[8px] border border-danger bg-surface-muted p-4 text-sm text-danger">
                    {policyMessage}
                  </div>
                ) : null}

                <div className="mt-6">
                  <h3 className="font-semibold">{zh ? "Agent 日志" : "Agent logs"}</h3>
                  <div className="mt-3 grid gap-3">
                    {runs.map((run) => (
                      <div className="rounded-[8px] border border-line bg-surface p-4" key={run.id}>
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-semibold">{run.title}</p>
                          {run.charged ? (
                            <span className="font-mono text-xs text-muted">-{run.charged}</span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-strong">{run.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}

            {activePanel === "sources" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="tw-panel p-5"
                exit={{ opacity: 0, y: -12 }}
                initial={false}
                key="sources"
              >
                <div className="flex items-center gap-2">
                  <PlugsConnected size={22} weight="duotone" />
                  <h2 className="text-2xl font-semibold">{zh ? "外部机会来源" : "External sources"}</h2>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {snapshot.externalSources.map((source) => (
                    <article className="rounded-[8px] border border-line bg-surface-muted p-4" key={source.id}>
                      <p className="font-semibold">{source.name}</p>
                      <p className="mt-2 font-mono text-xs text-muted">
                        {source.platform} / {source.mode}
                      </p>
                      <p className="mt-4 rounded-[6px] border border-line px-2 py-1 font-mono text-xs">
                        {source.status}
                      </p>
                    </article>
                  ))}
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[8px] border border-line bg-surface-muted p-4">
                    <div className="flex items-center gap-2">
                      <TerminalWindow size={20} weight="duotone" />
                      <h3 className="font-semibold">{zh ? "本地 watcher 配置" : "Local watcher config"}</h3>
                    </div>
                    <div className="mt-4 grid gap-3">
                      <label className="field-label">
                        Target URL
                        <input
                          className="field-control"
                          onChange={(event) =>
                            setWatcherForm({ ...watcherForm, url: event.target.value })
                          }
                          value={watcherForm.url}
                        />
                      </label>
                      <label className="field-label">
                        Schedule
                        <input
                          className="field-control"
                          onChange={(event) =>
                            setWatcherForm({ ...watcherForm, schedule: event.target.value })
                          }
                          value={watcherForm.schedule}
                        />
                      </label>
                      <label className="field-label">
                        Keywords
                        <input
                          className="field-control"
                          onChange={(event) =>
                            setWatcherForm({ ...watcherForm, keywords: event.target.value })
                          }
                          value={watcherForm.keywords}
                        />
                      </label>
                      <label className="field-label">
                        Parsing hints
                        <textarea
                          className="field-control min-h-24"
                          onChange={(event) =>
                            setWatcherForm({ ...watcherForm, hints: event.target.value })
                          }
                          value={watcherForm.hints}
                        />
                      </label>
                    </div>
                    <button className="tw-button mt-4 w-full" onClick={syncLocalSource} type="button">
                      <LinkSimple size={17} weight="bold" />
                      {zh ? "同步本地来源" : "Sync local source"}
                    </button>
                    <p className="mt-3 text-sm text-muted-strong">{watcherMessage}</p>
                  </div>

                  <div data-testid="watcher-results">
                    <h3 className="font-semibold">{zh ? "机会池" : "Opportunity pool"}</h3>
                    <div className="mt-3 grid gap-3">
                      {opportunities.map((opportunity) => (
                        <article
                          className="rounded-[8px] border border-line bg-surface p-4"
                          key={opportunity.id}
                        >
                          <p className="font-semibold">{opportunity.title}</p>
                          <p className="mt-2 font-mono text-xs text-muted">
                            {opportunity.platform} / fit {opportunity.fitScore} / {opportunity.level}
                          </p>
                          <p className="mt-3 truncate text-sm text-muted-strong">
                            {opportunity.url}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {activePanel === "policy" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="tw-panel p-5"
                exit={{ opacity: 0, y: -12 }}
                initial={false}
                key="policy"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} weight="duotone" />
                  <h2 className="text-2xl font-semibold">{zh ? "权限边界" : "Guardrails"}</h2>
                </div>
                {policyMessage ? (
                  <div className="mt-5 rounded-[8px] border border-danger bg-surface-muted p-4 text-sm text-danger">
                    {policyMessage}
                  </div>
                ) : null}
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <PolicyItem
                    title="Allowed"
                    body="Opportunity discovery, fit and cost evaluation, execution planning, and delivery framework preparation."
                    icon={<CheckCircle size={24} weight="duotone" />}
                  />
                  <PolicyItem
                    title="Blocked"
                    body="Automatic application, bidding, acceptance, submission, CAPTCHA solving, paywall bypass, and credential storage."
                    icon={<Warning size={24} weight="duotone" />}
                  />
                  <PolicyItem
                    title="Local watcher"
                    body="Runs on user device and sends normalized opportunity records, not account sessions."
                    icon={<TerminalWindow size={24} weight="duotone" />}
                  />
                  <PolicyItem
                    title="Audit trail"
                    body="Every agent tool call produces policy, credit, artifact, and admin-inspectable log records."
                    icon={<FileLock size={24} weight="duotone" />}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function PanelButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex items-center gap-3 rounded-[8px] border px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-line bg-surface hover:bg-surface-muted"
      }`}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function RunCard({
  body,
  cta,
  icon,
  onRun,
  price,
  title,
}: {
  body: string;
  cta: string;
  icon: ReactNode;
  onRun: () => void;
  price: string;
  title: string;
}) {
  return (
    <article className="rounded-[8px] border border-line bg-surface-muted p-4">
      {icon}
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 min-h-24 text-sm leading-6 text-muted-strong">{body}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="font-mono text-xs text-muted">{price}</span>
        <button className="tw-button secondary min-h-10 px-3" onClick={onRun} type="button">
          {cta}
          <ArrowRight size={15} weight="bold" />
        </button>
      </div>
    </article>
  );
}

function PolicyItem({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-[8px] border border-line bg-surface-muted p-4">
      {icon}
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-strong">{body}</p>
    </article>
  );
}

function artifactDetail(tool: AgentTool) {
  if (tool === "opportunity_discovery") {
    return "Opportunity discovery completed with ranked sources, duplicate checks, and source policy notes.";
  }

  if (tool === "fit_cost_plan") {
    return "Fit and cost plan completed with estimated effort, risks, and go or no-go recommendation.";
  }

  return "Delivery framework completed with outline, evidence checklist, and submission-ready package structure.";
}

function watcherTitle(urlValue: string) {
  try {
    const url = new URL(urlValue);
    const segment = url.pathname.split("/").filter(Boolean).at(-1);
    return segment || url.hostname;
  } catch {
    return "Custom watched opportunity";
  }
}
