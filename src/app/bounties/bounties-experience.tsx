"use client";

import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  CurrencyEth,
  EyeSlash,
  Funnel,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Target,
  Trophy,
  UploadSimple,
  Warning,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  createBounty,
  priceBountyRisk,
  selectWinner,
  type JudgingMode,
  type PaymentRail,
} from "@/domain/taskwanted";
import { DecryptedText } from "@/components/decrypted-text";
import { useTaskWantedLocale } from "@/components/site-header";
import type { MarketplaceBounty, MarketplaceSnapshot } from "@/lib/mvp-store";

type BountiesExperienceProps = {
  snapshot: MarketplaceSnapshot;
};

type BountyActivity = {
  id: string;
  text: string;
  kind: "submission" | "payment" | "system";
};

type SubmissionMode = "idle" | "submitting";

const fallbackSummary =
  "Open competition with blind submissions, funded escrow, and one winner.";

export function BountiesExperience({ snapshot }: BountiesExperienceProps) {
  const locale = useTaskWantedLocale();
  const zh = locale === "zh";
  const [bounties, setBounties] = useState(snapshot.bounties);
  const [selectedId, setSelectedId] = useState(snapshot.bounties[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"board" | "post" | "escrow">("board");
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>("idle");
  const [submissionNote, setSubmissionNote] = useState("");
  const [activities, setActivities] = useState<BountyActivity[]>([
    {
      id: "act_seed_1",
      kind: "payment",
      text: "Stripe sandbox escrow funded and waiting for winner selection.",
    },
    {
      id: "act_seed_2",
      kind: "system",
      text: "Blind submissions hidden from public board until settlement.",
    },
  ]);
  const [form, setForm] = useState({
    title: "Score agent safety traces",
    budgetUsd: "2100",
    judgingMode: "manual" as JudgingMode,
    externalSourceCount: "1",
    disputeSupport: true,
    paymentRail: "stripe-sandbox" as PaymentRail,
  });

  const selected = bounties.find((bounty) => bounty.id === selectedId) ?? bounties[0];
  const budgetCents = Math.max(0, Math.round(Number(form.budgetUsd || 0) * 100));
  const risk = priceBountyRisk({
    bountyCents: budgetCents,
    judgingMode: form.judgingMode,
    requiresPlatformDisputeSupport: form.disputeSupport,
    externalSourceCount: Number(form.externalSourceCount || 0),
  });

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return bounties;
    }

    return bounties.filter((bounty) =>
      [bounty.title, bounty.titleZh, bounty.summary, bounty.summaryZh]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [bounties, query]);

  function createFundedBounty() {
    const bounty = createBounty({
      title: form.title.trim() || "Untitled bounty",
      bountyCents: budgetCents || 100_000,
      submissionVisibility: "blind",
      prizeStructure: "single-winner",
      paymentRail: form.paymentRail,
      publisherId: "publisher_demo",
    });

    const marketplaceBounty: MarketplaceBounty = {
      ...bounty,
      titleZh: form.title.trim() || "新悬赏任务",
      summary: fallbackSummary,
      summaryZh: "开放竞赏、盲提交、资金托管、单一赢家。",
      feeRateBps: risk.rateBps,
      feeTier: risk.tier,
      feeReasons: risk.reasons,
      submissions: 0,
    };

    setBounties((current) => [marketplaceBounty, ...current]);
    setSelectedId(marketplaceBounty.id);
    setActivities((current) => [
      {
        id: `act_${Date.now()}`,
        kind: "payment",
        text: `${railLabel(form.paymentRail)} escrow created for $${Number(form.budgetUsd || 0).toLocaleString()}.`,
      },
      ...current,
    ]);
    setView("board");
  }

  function submitBlindWork() {
    if (!selected) {
      return;
    }

    setBounties((current) =>
      current.map((bounty) =>
        bounty.id === selected.id
          ? { ...bounty, submissions: bounty.submissions + 1 }
          : bounty,
      ),
    );
    setActivities((current) => [
      {
        id: `act_${Date.now()}`,
        kind: "submission",
        text: `Blind submission received: ${submissionNote || "Delivery package ready for publisher review."}`,
      },
      ...current,
    ]);
    setSubmissionNote("");
    setSubmissionMode("idle");
  }

  function chooseWinner() {
    if (!selected) {
      return;
    }

    const withWinner = selectWinner(selected, {
      submissionId: "sub_demo_winner",
      publisherId: selected.publisherId,
    });

    setBounties((current) =>
      current.map((bounty) =>
        bounty.id === selected.id
          ? {
              ...bounty,
              status: withWinner.status,
              winnerSubmissionId: withWinner.winnerSubmissionId,
              auditLog: withWinner.auditLog,
            }
          : bounty,
      ),
    );
    setActivities((current) => [
      {
        id: `act_${Date.now()}`,
        kind: "payment",
        text: "Winner selected. Escrow release queued for payout review.",
      },
      ...current,
    ]);
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
              text={zh ? "开放竞赏 / 盲提交 / 资金托管" : "Open contest / Blind submissions / Escrow"}
            />
            <h1 className="mt-6 max-w-4xl text-[clamp(3.2rem,8vw,7.4rem)] font-semibold leading-[0.88] tracking-normal">
              {zh ? "悬赏市场完整流程。" : "Open bounty marketplace"}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-7 text-muted-strong">
              {zh
                ? "发布者创建并托管资金，赏金猎人盲提交，平台在争议、支付和审计上兜底。"
                : "Publishers fund contests, hunters submit blind work, and TaskWanted coordinates dispute, payout, and audit rails."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="tw-button accent" onClick={() => setView("post")} type="button">
                <Plus size={17} weight="bold" />
                {zh ? "发布悬赏" : "Post bounty"}
              </button>
              <button className="tw-button secondary" onClick={() => setView("escrow")} type="button">
                <ShieldCheck size={17} weight="bold" />
                {zh ? "查看托管规则" : "Escrow rails"}
              </button>
            </div>
          </motion.div>

          <div className="tw-panel self-end p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroMetric label={zh ? "风险费率" : "Risk fee"} value="0.1 / 1 / 3%" />
              <HeroMetric label={zh ? "提交方式" : "Visibility"} value="Blind" />
              <HeroMetric label={zh ? "奖项" : "Prize"} value="Single" />
            </div>
            <div className="mt-5 rounded-[8px] border border-line bg-surface-muted p-4">
              <p className="font-mono text-xs text-muted">{railLabel(selected?.paymentRail ?? "stripe-sandbox")}</p>
              <h2 className="mt-3 text-2xl font-semibold">
                {selected ? (zh ? selected.titleZh : selected.title) : "No bounty"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-strong">
                {selected ? (zh ? selected.summaryZh : selected.summary) : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="tw-panel p-4">
          <div className="flex flex-col gap-3 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Target size={22} weight="duotone" />
              <h2 className="text-xl font-semibold">{zh ? "悬赏池" : "Live board"}</h2>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-line bg-surface px-3 py-2">
              <MagnifyingGlass size={16} />
              <label className="sr-only" htmlFor="bounty-search">
                Search bounties
              </label>
              <input
                className="w-full bg-transparent text-sm outline-none"
                id="bounty-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={zh ? "搜索悬赏" : "Search"}
                value={query}
              />
              <Funnel size={16} />
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {filtered.map((bounty) => (
              <button
                className={`rounded-[8px] border p-4 text-left transition ${
                  selected?.id === bounty.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-line bg-surface hover:bg-surface-muted"
                }`}
                key={bounty.id}
                onClick={() => {
                  setSelectedId(bounty.id);
                  setView("board");
                }}
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{zh ? bounty.titleZh : bounty.title}</p>
                    <p className="mt-2 text-sm opacity-78">
                      {zh ? bounty.summaryZh : bounty.summary}
                    </p>
                  </div>
                  <span className="font-mono text-sm">
                    ${(bounty.bountyCents / 100).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 font-mono text-[11px]">
                  <span>{bounty.submissions} submissions</span>
                  <span>{bounty.feeRateBps / 100}% fee</span>
                  <span>{bounty.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[640px]">
          <AnimatePresence mode="wait">
            {view === "post" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="tw-panel p-5"
                exit={{ opacity: 0, y: -12 }}
                initial={false}
                key="post"
              >
                <div className="flex items-center gap-2">
                  <Plus size={22} weight="duotone" />
                  <h2 className="text-2xl font-semibold">{zh ? "发布悬赏" : "Post bounty"}</h2>
                </div>
                <div className="mt-6 grid gap-4">
                  <label className="field-label">
                    Title
                    <input
                      className="field-control"
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                      value={form.title}
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="field-label">
                      Budget
                      <input
                        className="field-control"
                        inputMode="numeric"
                        onChange={(event) =>
                          setForm({ ...form, budgetUsd: event.target.value })
                        }
                        value={form.budgetUsd}
                      />
                    </label>
                    <label className="field-label">
                      Judging mode
                      <select
                        className="field-control"
                        onChange={(event) =>
                          setForm({
                            ...form,
                            judgingMode: event.target.value as JudgingMode,
                            disputeSupport: event.target.value === "subjective",
                          })
                        }
                        value={form.judgingMode}
                      >
                        <option value="objective">Objective</option>
                        <option value="manual">Manual review</option>
                        <option value="subjective">Subjective</option>
                      </select>
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="field-label">
                      External sources
                      <select
                        className="field-control"
                        onChange={(event) =>
                          setForm({ ...form, externalSourceCount: event.target.value })
                        }
                        value={form.externalSourceCount}
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3+</option>
                      </select>
                    </label>
                    <label className="field-label">
                      Payment rail
                      <select
                        className="field-control"
                        onChange={(event) =>
                          setForm({ ...form, paymentRail: event.target.value as PaymentRail })
                        }
                        value={form.paymentRail}
                      >
                        <option value="stripe-sandbox">Stripe sandbox</option>
                        <option value="usdc-base-pilot">Base USDC pilot</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="mt-5 rounded-[8px] border border-line bg-surface-muted p-4">
                  <p className="font-mono text-sm font-semibold">
                    {capitalize(risk.tier)} risk fee {risk.rateBps / 100}%
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-strong">{risk.reasons[0]}</p>
                </div>
                <button className="tw-button mt-5 w-full" onClick={createFundedBounty} type="button">
                  {zh ? "创建并托管" : "Create funded bounty"}
                  <ArrowRight size={17} weight="bold" />
                </button>
              </motion.div>
            ) : null}

            {view === "escrow" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="tw-panel p-5"
                exit={{ opacity: 0, y: -12 }}
                initial={false}
                key="escrow"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck size={22} weight="duotone" />
                  <h2 className="text-2xl font-semibold">{zh ? "资金与结算" : "Escrow and payout"}</h2>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <RailCard
                    body="Stripe Connect sandbox records checkout, webhook replay, duplicate webhook, refund, and failed payout cases."
                    icon={<CreditCard size={24} weight="duotone" />}
                    title="Stripe sandbox"
                  />
                  <RailCard
                    body="Base USDC pilot records transaction hash, destination, review state, and manual release status."
                    icon={<CurrencyEth size={24} weight="duotone" />}
                    title="Base USDC pilot"
                  />
                </div>
                <div className="mt-5 rounded-[8px] border border-line bg-surface-muted p-4">
                  <p className="font-semibold">{zh ? "结算规则" : "Settlement rule"}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-strong">
                    {zh
                      ? "MVP 只支持开放盲提交和单一赢家。争议进入后台审查，自动投标与自动提交不在范围内。"
                      : "MVP supports open blind submissions and one winner. Disputes go to admin review. Automatic bidding and submission stay out of scope."}
                  </p>
                </div>
              </motion.div>
            ) : null}

            {view === "board" ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="tw-panel p-5"
                exit={{ opacity: 0, y: -12 }}
                initial={false}
                key="board"
              >
                {selected ? (
                  <>
                    <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-mono text-xs text-accent-soft">
                          {railLabel(selected.paymentRail)} / {selected.feeTier}
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold leading-tight">
                          {zh ? selected.titleZh : selected.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-strong">
                          {zh ? selected.summaryZh : selected.summary}
                        </p>
                      </div>
                      <div className="rounded-[8px] bg-accent px-4 py-3 font-mono text-accent-ink">
                        ${(selected.bountyCents / 100).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <DetailMetric label={zh ? "提交" : "Submissions"} value={String(selected.submissions)} />
                      <DetailMetric label={zh ? "状态" : "Status"} value={selected.status} />
                      <DetailMetric label={zh ? "费率" : "Fee"} value={`${selected.feeRateBps / 100}%`} />
                      <DetailMetric label={zh ? "可见性" : "Visibility"} value="blind" />
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-[8px] border border-line bg-surface-muted p-4">
                        <div className="flex items-center gap-2">
                          <EyeSlash size={20} weight="duotone" />
                          <h3 className="font-semibold">{zh ? "盲提交" : "Blind submission"}</h3>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-strong">
                          {zh
                            ? "猎人的交付内容只进入发布者审查队列，不在公示板公开。"
                            : "Hunter work enters publisher review and stays hidden from the public board."}
                        </p>
                        {submissionMode === "submitting" ? (
                          <div className="mt-4 grid gap-3">
                            <label className="field-label">
                              Submission note
                              <textarea
                                className="field-control min-h-24"
                                onChange={(event) => setSubmissionNote(event.target.value)}
                                value={submissionNote}
                              />
                            </label>
                            <button className="tw-button" onClick={submitBlindWork} type="button">
                              <UploadSimple size={17} weight="bold" />
                              {zh ? "发送盲提交" : "Send blind submission"}
                            </button>
                          </div>
                        ) : (
                          <button
                            className="tw-button secondary mt-4 w-full"
                            onClick={() => setSubmissionMode("submitting")}
                            type="button"
                          >
                            <UploadSimple size={17} weight="bold" />
                            {zh ? "提交作品" : "Submit blind work"}
                          </button>
                        )}
                      </div>

                      <div className="rounded-[8px] border border-line bg-surface-muted p-4">
                        <div className="flex items-center gap-2">
                          <Trophy size={20} weight="duotone" />
                          <h3 className="font-semibold">{zh ? "发布者裁决" : "Publisher decision"}</h3>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-muted-strong">
                          {selected.status === "winner_selected"
                            ? "Winner selected. Payout release is ready for admin review."
                            : "Select one winner, then release payout through Stripe sandbox or USDC pilot record."}
                        </p>
                        <button
                          className="tw-button mt-4 w-full"
                          disabled={selected.status === "winner_selected"}
                          onClick={chooseWinner}
                          type="button"
                        >
                          <CheckCircle size={17} weight="bold" />
                          {selected.status === "winner_selected"
                            ? zh
                              ? "已选赢家"
                              : "Winner selected"
                            : zh
                              ? "选择赢家"
                              : "Select winner"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-6" data-testid="bounty-activity">
                      <h3 className="font-semibold">{zh ? "活动日志" : "Activity"}</h3>
                      <div className="mt-3 grid gap-2">
                        {activities.map((activity) => (
                          <div
                            className="flex items-start gap-3 rounded-[8px] border border-line bg-surface px-3 py-3 text-sm"
                            key={activity.id}
                          >
                            {activity.kind === "submission" ? (
                              <UploadSimple className="mt-0.5 text-accent-soft" size={16} />
                            ) : activity.kind === "payment" ? (
                              <CreditCard className="mt-0.5 text-success" size={16} />
                            ) : (
                              <Warning className="mt-0.5 text-warning" size={16} />
                            )}
                            <span>{activity.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-line bg-surface px-3 py-4">
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-surface-muted px-3 py-3">
      <p className="font-mono text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function RailCard({
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

function railLabel(rail: PaymentRail) {
  return rail === "stripe-sandbox" ? "Stripe sandbox" : "Base USDC pilot";
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
