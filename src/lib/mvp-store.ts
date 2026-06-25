import {
  type Bounty,
  type JudgingMode,
  createBounty,
  ingestExternalOpportunity,
  priceBountyRisk,
} from "@/domain/taskwanted";

export type MarketplaceBounty = Bounty & {
  titleZh: string;
  summary: string;
  summaryZh: string;
  feeRateBps: number;
  feeTier: string;
  feeReasons: string[];
  submissions: number;
};

export type ExternalSource = {
  id: string;
  platform: "upwork" | "freelancer" | "custom";
  mode: "oauth" | "local-watcher";
  name: string;
  status: "connected" | "needs-review" | "local-only";
  cadence: string;
};

export type ExternalOpportunity = ReturnType<typeof ingestExternalOpportunity> & {
  fitScore: number;
  level: "discovery" | "fit_cost_plan" | "delivery_framework";
};

export type AdminSignal = {
  label: string;
  status: "armed" | "watching" | "queued";
  detail: string;
};

export type MarketplaceSnapshot = {
  bounties: MarketplaceBounty[];
  externalSources: ExternalSource[];
  opportunities: ExternalOpportunity[];
  adminSignals: AdminSignal[];
  agentCreditPacks: Array<{
    name: string;
    credits: number;
    priceUsd: number;
    bestFor: string;
  }>;
};

type CreateBountyInput = {
  title: string;
  titleZh: string;
  bountyCents: number;
  judgingMode: JudgingMode;
  summary: string;
  summaryZh: string;
};

type WatcherPayload = {
  sourceId: string;
  platform: "upwork" | "freelancer" | "custom";
  url: string;
  title: string;
  capturedAt: string;
  sessionCookie?: string;
};

let snapshot = seedMarketplace();

export function resetMarketplaceStore(): void {
  snapshot = seedMarketplace();
}

export function getMarketplaceSnapshot(): MarketplaceSnapshot {
  return {
    ...snapshot,
    bounties: [...snapshot.bounties],
    externalSources: [...snapshot.externalSources],
    opportunities: [...snapshot.opportunities],
    adminSignals: [...snapshot.adminSignals],
    agentCreditPacks: [...snapshot.agentCreditPacks],
  };
}

export function createMarketplaceBounty(
  input: CreateBountyInput,
): MarketplaceBounty {
  const risk = priceBountyRisk({
    bountyCents: input.bountyCents,
    judgingMode: input.judgingMode,
    requiresPlatformDisputeSupport: input.judgingMode === "subjective",
    externalSourceCount: 0,
  });
  const bounty = toMarketplaceBounty(input, risk);

  snapshot = {
    ...snapshot,
    bounties: [bounty, ...snapshot.bounties],
  };

  return bounty;
}

export function ingestWatcherOpportunity(
  input: WatcherPayload,
): ExternalOpportunity {
  if (input.sessionCookie) {
    throw new Error("Local watcher payloads must not include session cookies.");
  }

  const opportunity: ExternalOpportunity = {
    ...ingestExternalOpportunity({
      sourceId: input.sourceId,
      sourceKind: "local-watcher",
      platform: input.platform,
      url: input.url,
      title: input.title,
      capturedAt: input.capturedAt,
    }),
    fitScore: 82,
    level: "discovery",
  };

  snapshot = {
    ...snapshot,
    opportunities: [opportunity, ...snapshot.opportunities],
  };

  return opportunity;
}

function seedMarketplace(): MarketplaceSnapshot {
  return {
    bounties: [
      toMarketplaceBounty(
        {
          title: "Map AI agent workflow tools",
          titleZh: "整理 AI Agent 工作流工具图谱",
          bountyCents: 75_000,
          judgingMode: "manual",
          summary:
            "Collect 40 active tools with pricing, API notes, and proof links.",
          summaryZh: "整理 40 个活跃工具，包含价格、API 信息和证明链接。",
        },
        priceBountyRisk({
          bountyCents: 75_000,
          judgingMode: "manual",
          requiresPlatformDisputeSupport: false,
          externalSourceCount: 1,
        }),
      ),
      toMarketplaceBounty(
        {
          title: "QA a bilingual landing flow",
          titleZh: "测试双语落地页流程",
          bountyCents: 35_000,
          judgingMode: "objective",
          summary:
            "Find reproducible issues across desktop and mobile viewports.",
          summaryZh: "在桌面和移动端找出可复现的问题。",
        },
        priceBountyRisk({
          bountyCents: 35_000,
          judgingMode: "objective",
          requiresPlatformDisputeSupport: false,
          externalSourceCount: 0,
        }),
      ),
      toMarketplaceBounty(
        {
          title: "Prepare a competitor content brief",
          titleZh: "准备竞品内容简报",
          bountyCents: 18_000,
          judgingMode: "subjective",
          summary:
            "Turn five competitor posts into a sourced launch content outline.",
          summaryZh: "将五篇竞品内容整理为带来源的发布内容大纲。",
        },
        priceBountyRisk({
          bountyCents: 18_000,
          judgingMode: "subjective",
          requiresPlatformDisputeSupport: true,
          externalSourceCount: 2,
        }),
      ),
    ],
    externalSources: [
      {
        id: "src_upwork",
        platform: "upwork",
        mode: "oauth",
        name: "Upwork OAuth",
        status: "connected",
        cadence: "Every 30 minutes",
      },
      {
        id: "src_freelancer",
        platform: "freelancer",
        mode: "oauth",
        name: "Freelancer.com API",
        status: "needs-review",
        cadence: "Every 60 minutes",
      },
      {
        id: "src_custom",
        platform: "custom",
        mode: "local-watcher",
        name: "Custom local watcher",
        status: "local-only",
        cadence: "User device cron",
      },
    ],
    opportunities: [
      {
        ...ingestExternalOpportunity({
          sourceId: "src_upwork",
          sourceKind: "oauth",
          platform: "upwork",
          url: "https://www.upwork.com/jobs/ai-research-map",
          title: "AI research map for a seed-stage SaaS",
          capturedAt: "2026-06-25T08:00:00.000Z",
        }),
        fitScore: 91,
        level: "fit_cost_plan",
      },
      {
        ...ingestExternalOpportunity({
          sourceId: "src_custom",
          sourceKind: "local-watcher",
          platform: "custom",
          url: "https://example-board.test/private/bounties/agent-audit",
          title: "Audit agent prompts for unsafe tool use",
          capturedAt: "2026-06-25T08:20:00.000Z",
        }),
        fitScore: 78,
        level: "delivery_framework",
      },
    ],
    adminSignals: [
      {
        label: "Kill switch",
        status: "armed",
        detail: "Disable USDC pilot or external watcher ingestion immediately.",
      },
      {
        label: "Blind submissions",
        status: "watching",
        detail: "Publisher-visible only until winner selection or dispute.",
      },
      {
        label: "Agent boundary",
        status: "queued",
        detail: "No apply, bid, accept, submit, CAPTCHA, or payment actions.",
      },
    ],
    agentCreditPacks: [
      {
        name: "Scout",
        credits: 1_000,
        priceUsd: 9,
        bestFor: "Opportunity discovery",
      },
      {
        name: "Operator",
        credits: 5_000,
        priceUsd: 39,
        bestFor: "Fit, cost, and plan evaluation",
      },
      {
        name: "Closer",
        credits: 15_000,
        priceUsd: 99,
        bestFor: "Delivery framework preparation",
      },
    ],
  };
}

function toMarketplaceBounty(
  input: CreateBountyInput,
  risk: ReturnType<typeof priceBountyRisk>,
): MarketplaceBounty {
  return {
    ...createBounty({
      title: input.title,
      bountyCents: input.bountyCents,
      submissionVisibility: "blind",
      prizeStructure: "single-winner",
      paymentRail: "stripe-sandbox",
    }),
    titleZh: input.titleZh,
    summary: input.summary,
    summaryZh: input.summaryZh,
    feeRateBps: risk.rateBps,
    feeTier: risk.tier,
    feeReasons: risk.reasons,
    submissions: input.judgingMode === "subjective" ? 11 : 7,
  };
}
