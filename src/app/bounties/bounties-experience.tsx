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
import { FluidCubeStage, type FluidCubeFace } from "@/components/fluid-cube-stage";
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
      text: "Trending face refreshed with live board signals.",
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

  const faces: FluidCubeFace[] = [
    {
      id: "trending",
      label: "Trending",
      labelZh: "趋势",
      tone: "hero",
      content: (
        <div className="cube-face-grid two">
          <div>
            <p className="cube-kicker">{zh ? "悬赏公告板" : "Bounty Board"}</p>
            <h1 className="mt-4 text-6xl font-semibold leading-none">Bounty Board</h1>
            <p className="cube-copy">
              {zh
                ? "Trending、悬赏、提交动态和 Mine 都在这个 cube 空间内切换。"
                : "Track trending contests, open bounties, blind submissions, and your Mine queue."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="tw-button accent" type="button">
                <Plus size={17} weight="bold" />
                {zh ? "发布悬赏" : "Post bounty"}
              </button>
              <button className="tw-button secondary" type="button">
                <ShieldCheck size={17} weight="bold" />
                {zh ? "托管规则" : "Escrow rails"}
              </button>
            </div>
          </div>
          <div className="cube-list">
            {bounties.slice(0, 3).map((bounty) => (
              <BountyRow
                bounty={bounty}
                key={bounty.id}
                onSelect={() => setSelectedId(bounty.id)}
                zh={zh}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "bounties",
      label: "Bounties",
      labelZh: "悬赏",
      tone: "plain",
      content: (
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="cube-list-item">
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
          <div className="cube-list">
            {filtered.map((bounty) => (
              <BountyRow
                bounty={bounty}
                key={bounty.id}
                onSelect={() => setSelectedId(bounty.id)}
                zh={zh}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "submissions",
      label: "Submissions",
      labelZh: "提交",
      tone: "accent",
      content: (
        <div>
          <p className="cube-kicker">{zh ? "匿名提交动态" : "Blind submission feed"}</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none">Submissions</h2>
          <div className="cube-list mt-6" data-testid="bounty-activity">
            {activities.map((activity) => (
              <article className="cube-list-item" key={activity.id}>
                <p className="font-mono text-xs text-muted">{activity.kind}</p>
                <p className="mt-2 font-semibold">{activity.text}</p>
              </article>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "mine",
      label: "Mine",
      labelZh: "我的",
      tone: "dark",
      content: (
        <div className="cube-face-grid three">
          <Summary title="Posted" value="2" detail="Funded contests" />
          <Summary title="Submitted" value="4" detail="Blind entries waiting" />
          <Summary title="Agent tracked" value="9" detail="Opportunities in watchlist" />
        </div>
      ),
    },
    {
      id: "create",
      label: "Create",
      labelZh: "发布",
      tone: "plain",
      content: (
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <form className="cube-list-item" onSubmit={(event) => event.preventDefault()}>
            <h2 className="text-3xl font-semibold">{zh ? "发布悬赏" : "Create funded bounty"}</h2>
            <Field label="Title">
              <input
                className="tw-input"
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
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
          <div className="cube-list-item">
            <p className="cube-kicker">{zh ? "AI 风险定价" : "AI risk pricing"}</p>
            <h3 className="mt-4 text-4xl font-semibold capitalize">
              {risk.tier} risk fee
            </h3>
            <p className="mt-3 text-3xl font-semibold">{risk.rateBps / 100}%</p>
            <p className="mt-4 text-sm leading-6 text-muted-strong">{risk.reasons[0]}</p>
          </div>
        </div>
      ),
    },
    {
      id: "detail",
      label: "Detail",
      labelZh: "详情",
      tone: "accent",
      content: selected ? (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="cube-list-item">
            <p className="font-mono text-xs text-accent-soft">{railLabel(selected.paymentRail)}</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight">
              {zh ? selected.titleZh : selected.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-strong">
              {zh ? selected.summaryZh : selected.summary}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Summary title="Reward" value={`$${(selected.bountyCents / 100).toLocaleString()}`} detail="Escrowed" />
              <Summary title="Fee" value={`${selected.feeRateBps / 100}%`} detail={selected.feeTier} />
              <Summary title="Submits" value={String(selected.submissions)} detail="Blind" />
              <Summary title="Status" value={selected.status} detail="Audit ready" />
            </div>
          </div>
          <div className="cube-list-item">
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
            <button className="tw-button accent mt-4 w-full" onClick={submitBlindWork} type="button">
              Send blind submission
            </button>
            <button className="tw-button mt-3 w-full" onClick={chooseWinner} type="button">
              <Trophy size={17} weight="bold" />
              Select winner
            </button>
          </div>
        </div>
      ) : null,
    },
  ];

  return (
    <main>
      <FluidCubeStage
        faces={faces}
        initialFace="trending"
        title="Bounty Board"
        titleZh="悬赏公告板"
      />
    </main>
  );
}

function BountyRow({
  bounty,
  onSelect,
  zh,
}: {
  bounty: MarketplaceBounty;
  onSelect: () => void;
  zh: boolean;
}) {
  return (
    <button className="cube-list-item text-left transition hover:-translate-y-0.5" onClick={onSelect} type="button">
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
    <div className="cube-metric">
      <span>{title}</span>
      <strong>{value}</strong>
      <p className="mt-2 text-xs text-muted">{detail}</p>
    </div>
  );
}

function railLabel(rail: PaymentRail) {
  return rail === "stripe-sandbox" ? "Stripe sandbox" : "Base USDC pilot";
}
