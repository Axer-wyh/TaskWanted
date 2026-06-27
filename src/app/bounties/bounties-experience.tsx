"use client";

import {
  Funnel,
  MagnifyingGlass,
  Plus,
  ShieldCheck,
  Trophy,
  UploadSimple,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useTaskWantedLocale } from "@/components/site-header";
import {
  createBounty,
  priceBountyRisk,
  selectWinner,
  type JudgingMode,
  type PaymentRail,
} from "@/domain/taskwanted";
import type { MarketplaceBounty, MarketplaceSnapshot } from "@/lib/mvp-store";

type BountiesExperienceProps = {
  snapshot: MarketplaceSnapshot;
};

type BountyActivity = {
  id: string;
  text: string;
  kind: "submission" | "payment" | "system";
};

const fallbackSummary =
  "Open competition with blind submissions, funded escrow, and one winner.";

export function BountiesExperience({ snapshot }: BountiesExperienceProps) {
  const locale = useTaskWantedLocale();
  const zh = locale === "zh";
  const [bounties, setBounties] = useState(snapshot.bounties);
  const [selectedId, setSelectedId] = useState(snapshot.bounties[0]?.id ?? "");
  const [query, setQuery] = useState("");
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
      text: "Trending board refreshed with live marketplace signals.",
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
        text: `${railLabel(form.paymentRail)} escrow created for $${Number(
          form.budgetUsd || 0,
        ).toLocaleString()}.`,
      },
      ...current,
    ]);
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
        text: `Blind submission received: ${
          submissionNote || "Delivery package ready for publisher review."
        }`,
      },
      ...current,
    ]);
    setSubmissionNote("");
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
    <main className="task-page" data-testid="bounties-page" data-theme="dark">
      <section className="task-hero">
        <div className="task-page-shell task-hero-grid">
          <div>
            <p className="task-kicker">{zh ? "悬赏公告板" : "Bounty Board"}</p>
            <h1 className="task-title">{zh ? "开放悬赏，公开竞争。" : "Bounty Board"}</h1>
            <p className="task-copy">
              {zh
                ? "浏览趋势任务、发布托管悬赏、接收盲提交，并在同一审计链路中选择赢家。"
                : "Track trending contests, open bounties, blind submissions, and your Mine queue in one continuous board."}
            </p>
            <div className="task-actions">
              <a className="tw-button accent" href="#create-bounty">
                <Plus size={17} weight="bold" />
                {zh ? "发布悬赏" : "Post bounty"}
              </a>
              <a className="tw-button secondary" href="#detail">
                <ShieldCheck size={17} weight="bold" />
                {zh ? "查看托管流程" : "Escrow flow"}
              </a>
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

      <Section id="trending" kicker={zh ? "趋势" : "Trending"} title="Trending bounties">
        <div className="task-panel-grid three">
          {bounties.slice(0, 3).map((bounty) => (
            <BountyRow
              bounty={bounty}
              key={bounty.id}
              onSelect={() => setSelectedId(bounty.id)}
              selected={bounty.id === selected?.id}
              zh={zh}
            />
          ))}
        </div>
      </Section>

      <Section id="bounties" kicker={zh ? "任务列表" : "Open board"} title="Browse funded work">
        <div className="task-split narrow-left">
          <aside className="task-panel">
            <div className="flex items-center gap-2">
              <Funnel size={20} weight="duotone" />
              <h2 className="text-xl font-semibold">{zh ? "筛选" : "Filters"}</h2>
            </div>
            <label className="mt-5 flex items-center gap-2 rounded-[8px] border border-line bg-surface px-3 py-2">
              <MagnifyingGlass size={16} />
              <span className="sr-only">Search bounties</span>
              <input
                className="w-full bg-transparent text-sm outline-none"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                value={query}
              />
            </label>
            <div className="mt-5 grid gap-2 text-sm text-muted-strong">
              <span>Skills: Development, AI agents, Research</span>
              <span>Language: English, Chinese, Bilingual</span>
              <span>Agent support: Allowed, Planning only</span>
            </div>
          </aside>
          <div className="task-list">
            {filtered.map((bounty) => (
              <BountyRow
                bounty={bounty}
                key={bounty.id}
                onSelect={() => setSelectedId(bounty.id)}
                selected={bounty.id === selected?.id}
                zh={zh}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section id="create-bounty" kicker={zh ? "发布" : "Create"} title="Create funded bounty">
        <div className="task-split">
          <form className="task-panel" onSubmit={(event) => event.preventDefault()}>
            <Field label="Title">
              <input
                className="tw-input"
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                value={form.title}
              />
            </Field>
            <Field label="Budget">
              <input
                className="tw-input"
                inputMode="numeric"
                onChange={(event) =>
                  setForm((current) => ({ ...current, budgetUsd: event.target.value }))
                }
                value={form.budgetUsd}
              />
            </Field>
            <Field label="Judging mode">
              <select
                className="tw-input"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    judgingMode: event.target.value as JudgingMode,
                  }))
                }
                value={form.judgingMode}
              >
                <option value="objective">Objective</option>
                <option value="manual">Manual</option>
                <option value="subjective">Subjective</option>
              </select>
            </Field>
            <button className="tw-button accent mt-5" onClick={createFundedBounty} type="button">
              {zh ? "创建托管悬赏" : "Create funded bounty"}
            </button>
          </form>
          <div className="task-panel accent-panel">
            <p className="task-kicker">{zh ? "AI 风险定价" : "AI risk pricing"}</p>
            <h3 className="mt-4 text-4xl font-semibold capitalize">{risk.tier} risk fee</h3>
            <p className="mt-3 text-3xl font-semibold">{risk.rateBps / 100}%</p>
            <p className="mt-4 text-sm leading-6 text-muted-strong">{risk.reasons[0]}</p>
          </div>
        </div>
      </Section>

      <Section id="detail" kicker={zh ? "详情与交付" : "Detail and delivery"} title="Submit, judge, release">
        {selected ? (
          <div className="task-split">
            <div className="task-panel">
              <p className="font-mono text-xs text-accent-soft">
                {railLabel(selected.paymentRail)}
              </p>
              <h2 className="mt-3 text-4xl font-semibold leading-tight">
                {zh ? selected.titleZh : selected.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-strong">
                {zh ? selected.summaryZh : selected.summary}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <Summary
                  detail="Escrowed"
                  title="Reward"
                  value={`$${(selected.bountyCents / 100).toLocaleString()}`}
                />
                <Summary
                  detail={selected.feeTier}
                  title="Fee"
                  value={`${selected.feeRateBps / 100}%`}
                />
                <Summary detail="Blind" title="Submits" value={String(selected.submissions)} />
                <Summary detail="Audit ready" title="Status" value={selected.status} />
              </div>
            </div>
            <div className="task-panel">
              <h3 className="text-xl font-semibold">Blind submission</h3>
              <button className="tw-button secondary mt-4 w-full" type="button">
                <UploadSimple size={17} weight="bold" />
                Submit blind work
              </button>
              <Field label="Submission note">
                <textarea
                  className="tw-input min-h-28"
                  onChange={(event) => setSubmissionNote(event.target.value)}
                  value={submissionNote}
                />
              </Field>
              <button
                className="tw-button accent mt-4 w-full"
                onClick={submitBlindWork}
                type="button"
              >
                Send blind submission
              </button>
              <button className="tw-button mt-3 w-full" onClick={chooseWinner} type="button">
                <Trophy size={17} weight="bold" />
                Select winner
              </button>
            </div>
          </div>
        ) : null}
      </Section>

      <Section id="submissions" kicker={zh ? "动态" : "Live activity"} title="Submission and payout stream">
        <div className="task-split">
          <div className="task-list" data-testid="bounty-activity">
            {activities.map((activity) => (
              <article className="task-panel compact" key={activity.id}>
                <p className="font-mono text-xs text-muted">{activity.kind}</p>
                <p className="mt-2 font-semibold">{activity.text}</p>
              </article>
            ))}
          </div>
          <div className="task-panel-grid three" id="mine">
            <Summary detail="Funded contests" title="Posted" value="2" />
            <Summary detail="Blind entries waiting" title="Submitted" value="4" />
            <Summary detail="Opportunities in watchlist" title="Agent tracked" value="9" />
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

function BountyRow({
  bounty,
  onSelect,
  selected,
  zh,
}: {
  bounty: MarketplaceBounty;
  onSelect: () => void;
  selected: boolean;
  zh: boolean;
}) {
  return (
    <button
      className={`task-list-row ${selected ? "active" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{zh ? bounty.titleZh : bounty.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-strong">
            {zh ? bounty.summaryZh : bounty.summary}
          </p>
        </div>
        <span className="rounded-[8px] bg-foreground px-3 py-2 font-mono text-sm text-background">
          ${(bounty.bountyCents / 100).toLocaleString()}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-muted">
        <span>{bounty.submissions} submissions</span>
        <span>{bounty.feeRateBps / 100}% fee</span>
        <span>{bounty.status}</span>
      </div>
    </button>
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

function railLabel(rail: PaymentRail) {
  return rail === "stripe-sandbox" ? "Stripe sandbox" : "Base USDC pilot";
}
