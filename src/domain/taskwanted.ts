export type JudgingMode = "objective" | "manual" | "subjective";
export type RiskTier = "low" | "medium" | "high";
export type SubmissionVisibility = "blind" | "public";
export type PrizeStructure = "single-winner" | "multi-prize" | "qualified-payout";
export type PaymentRail = "stripe-sandbox" | "usdc-base-pilot";
export type BountyStatus = "funded" | "winner_selected" | "disputed" | "released";

export type AgentPermission =
  | "opportunity_discovery"
  | "fit_cost_plan"
  | "prepare_delivery_framework"
  | "external_submit";

export type AgentTool =
  | "opportunity_discovery"
  | "fit_cost_plan"
  | "delivery_framework";

type AuditEntry = {
  action: string;
  actorId: string;
  at: string;
};

export type Bounty = {
  id: string;
  publisherId: string;
  title: string;
  bountyCents: number;
  submissionVisibility: SubmissionVisibility;
  prizeStructure: PrizeStructure;
  paymentRail: PaymentRail;
  status: BountyStatus;
  winnerSubmissionId?: string;
  auditLog: AuditEntry[];
};

export function priceBountyRisk(input: {
  bountyCents: number;
  judgingMode: JudgingMode;
  requiresPlatformDisputeSupport: boolean;
  externalSourceCount: number;
}): { tier: RiskTier; rateBps: 10 | 100 | 300; reasons: string[] } {
  if (
    input.judgingMode === "subjective" ||
    input.requiresPlatformDisputeSupport ||
    input.externalSourceCount >= 3
  ) {
    return {
      tier: "high",
      rateBps: 300,
      reasons: [
        "Subjective judging, platform dispute support, or multiple external sources raises review risk.",
      ],
    };
  }

  if (input.judgingMode === "manual" || input.externalSourceCount > 0) {
    return {
      tier: "medium",
      rateBps: 100,
      reasons: [
        "Manual judging or external source monitoring requires added review support.",
      ],
    };
  }

  return {
    tier: "low",
    rateBps: 10,
    reasons: ["Objective judging supports the lowest marketplace fee."],
  };
}

export function createBounty(input: {
  title: string;
  bountyCents: number;
  submissionVisibility: SubmissionVisibility;
  prizeStructure: PrizeStructure;
  paymentRail: PaymentRail;
  publisherId?: string;
}): Bounty {
  const publisherId = input.publisherId ?? "publisher_1";

  return {
    id: slugId("bounty", input.title),
    publisherId,
    title: input.title,
    bountyCents: input.bountyCents,
    submissionVisibility: input.submissionVisibility,
    prizeStructure: input.prizeStructure,
    paymentRail: input.paymentRail,
    status: "funded",
    auditLog: [
      {
        action: "bounty_created",
        actorId: publisherId,
        at: "2026-06-25T00:00:00.000Z",
      },
    ],
  };
}

export function selectWinner(
  bounty: Bounty,
  input: { submissionId: string; publisherId: string },
): Bounty {
  if (input.publisherId !== bounty.publisherId) {
    throw new Error("Only the publisher can select a winner.");
  }

  if (bounty.prizeStructure === "single-winner" && bounty.winnerSubmissionId) {
    throw new Error("A single-winner bounty already has a selected winner.");
  }

  return {
    ...bounty,
    status: "winner_selected",
    winnerSubmissionId: input.submissionId,
    auditLog: [
      ...bounty.auditLog,
      {
        action: "winner_selected",
        actorId: input.publisherId,
        at: "2026-06-25T00:01:00.000Z",
      },
    ],
  };
}

const permissionRank: Record<AgentPermission, number> = {
  opportunity_discovery: 1,
  fit_cost_plan: 2,
  prepare_delivery_framework: 3,
  external_submit: 4,
};

export function validateAgentPermission(input: {
  requested: AgentPermission;
  publisherAllowed: AgentPermission;
  platformCeiling: AgentPermission;
}): { allowed: true } | { allowed: false; reason: string } {
  if (
    input.requested === "external_submit" ||
    permissionRank[input.requested] > permissionRank[input.publisherAllowed] ||
    permissionRank[input.requested] > permissionRank[input.platformCeiling]
  ) {
    return {
      allowed: false,
      reason:
        "MVP agents cannot apply, bid, accept, submit, bypass CAPTCHA, or access payment controls.",
    };
  }

  return { allowed: true };
}

const agentToolRates: Record<AgentTool, number> = {
  opportunity_discovery: 50,
  fit_cost_plan: 120,
  delivery_framework: 220,
};

export function spendAgentCredits(input: {
  balance: number;
  tool: AgentTool;
  units: number;
}): {
  balance: number;
  charged: number;
  ledgerEntry: { direction: "debit"; amount: number; reason: string };
} {
  const charged = agentToolRates[input.tool] * input.units;

  if (input.balance < charged) {
    throw new Error("Insufficient agent credits.");
  }

  return {
    balance: input.balance - charged,
    charged,
    ledgerEntry: {
      direction: "debit",
      amount: charged,
      reason: `agent:${input.tool}`,
    },
  };
}

export function ingestExternalOpportunity(input: {
  sourceId: string;
  sourceKind: "oauth" | "local-watcher";
  platform: "upwork" | "freelancer" | "custom";
  url: string;
  title: string;
  capturedAt: string;
  rawSessionCookie?: string;
}): {
  id: string;
  sourceId: string;
  sourceKind: "oauth" | "local-watcher";
  platform: "upwork" | "freelancer" | "custom";
  url: string;
  title: string;
  status: "new";
  capturedAt: string;
  secretsStored: false;
} {
  const url = new URL(input.url);
  const host = url.hostname.replace(/\./g, "-");
  const path = url.pathname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return {
    id: `opp_${host}_${path}`,
    sourceId: input.sourceId,
    sourceKind: input.sourceKind,
    platform: input.platform,
    url: input.url,
    title: input.title,
    status: "new",
    capturedAt: input.capturedAt,
    secretsStored: false,
  };
}

function slugId(prefix: string, value: string): string {
  return `${prefix}_${slugify(value)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
