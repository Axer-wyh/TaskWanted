import { describe, expect, it } from "vitest";
import {
  createBounty,
  ingestExternalOpportunity,
  priceBountyRisk,
  selectWinner,
  spendAgentCredits,
  validateAgentPermission,
} from "@/domain/taskwanted";

describe("TaskWanted domain rules", () => {
  it("prices publisher fees with explainable AI risk tiers", () => {
    expect(
      priceBountyRisk({
        bountyCents: 250_000,
        judgingMode: "objective",
        requiresPlatformDisputeSupport: false,
        externalSourceCount: 0,
      }),
    ).toEqual({
      tier: "low",
      rateBps: 10,
      reasons: ["Objective judging supports the lowest marketplace fee."],
    });

    expect(
      priceBountyRisk({
        bountyCents: 80_000,
        judgingMode: "manual",
        requiresPlatformDisputeSupport: false,
        externalSourceCount: 2,
      }).rateBps,
    ).toBe(100);

    expect(
      priceBountyRisk({
        bountyCents: 400_000,
        judgingMode: "subjective",
        requiresPlatformDisputeSupport: true,
        externalSourceCount: 3,
      }),
    ).toMatchObject({
      tier: "high",
      rateBps: 300,
    });
  });

  it("runs an open blind bounty through single-winner selection", () => {
    const bounty = createBounty({
      title: "Collect 50 AI ops leads",
      bountyCents: 50_000,
      submissionVisibility: "blind",
      prizeStructure: "single-winner",
      paymentRail: "stripe-sandbox",
    });

    const selected = selectWinner(bounty, {
      submissionId: "sub_2",
      publisherId: bounty.publisherId,
    });

    expect(selected.status).toBe("winner_selected");
    expect(selected.winnerSubmissionId).toBe("sub_2");
    expect(selected.auditLog.at(-1)).toMatchObject({
      action: "winner_selected",
      actorId: bounty.publisherId,
    });
  });

  it("blocks duplicate winners and non-publisher winner selection", () => {
    const bounty = createBounty({
      title: "QA a landing page",
      bountyCents: 20_000,
      submissionVisibility: "blind",
      prizeStructure: "single-winner",
      paymentRail: "usdc-base-pilot",
    });

    expect(() =>
      selectWinner(bounty, {
        submissionId: "sub_1",
        publisherId: "hunter_1",
      }),
    ).toThrow("Only the publisher can select a winner.");

    const selected = selectWinner(bounty, {
      submissionId: "sub_1",
      publisherId: bounty.publisherId,
    });

    expect(() =>
      selectWinner(selected, {
        submissionId: "sub_2",
        publisherId: bounty.publisherId,
      }),
    ).toThrow("A single-winner bounty already has a selected winner.");
  });

  it("keeps platform agent permissions under platform ceilings", () => {
    expect(
      validateAgentPermission({
        requested: "prepare_delivery_framework",
        publisherAllowed: "prepare_delivery_framework",
        platformCeiling: "prepare_delivery_framework",
      }),
    ).toEqual({ allowed: true });

    expect(
      validateAgentPermission({
        requested: "external_submit",
        publisherAllowed: "prepare_delivery_framework",
        platformCeiling: "prepare_delivery_framework",
      }),
    ).toEqual({
      allowed: false,
      reason:
        "MVP agents cannot apply, bid, accept, submit, bypass CAPTCHA, or access payment controls.",
    });
  });

  it("charges hunter-paid credits for agent work", () => {
    expect(
      spendAgentCredits({
        balance: 1_000,
        tool: "opportunity_discovery",
        units: 3,
      }),
    ).toEqual({
      balance: 850,
      charged: 150,
      ledgerEntry: {
        direction: "debit",
        amount: 150,
        reason: "agent:opportunity_discovery",
      },
    });

    expect(() =>
      spendAgentCredits({
        balance: 30,
        tool: "delivery_framework",
        units: 1,
      }),
    ).toThrow("Insufficient agent credits.");
  });

  it("normalizes external opportunities without storing session secrets", () => {
    expect(
      ingestExternalOpportunity({
        sourceId: "src_local_1",
        sourceKind: "local-watcher",
        platform: "custom",
        url: "https://example-bounty-board.test/tasks/42",
        title: "Find pricing data for AI tools",
        capturedAt: "2026-06-25T08:00:00.000Z",
        rawSessionCookie: "secret",
      }),
    ).toEqual({
      id: "opp_example-bounty-board-test_tasks_42",
      sourceId: "src_local_1",
      sourceKind: "local-watcher",
      platform: "custom",
      url: "https://example-bounty-board.test/tasks/42",
      title: "Find pricing data for AI tools",
      status: "new",
      capturedAt: "2026-06-25T08:00:00.000Z",
      secretsStored: false,
    });
  });
});
