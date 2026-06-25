import { beforeEach, describe, expect, it } from "vitest";
import {
  createMarketplaceBounty,
  getMarketplaceSnapshot,
  ingestWatcherOpportunity,
  resetMarketplaceStore,
} from "@/lib/mvp-store";

describe("MVP store", () => {
  beforeEach(() => {
    resetMarketplaceStore();
  });

  it("starts with seeded bounties, external sources, and admin signals", () => {
    const snapshot = getMarketplaceSnapshot();

    expect(snapshot.bounties.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.externalSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ platform: "upwork", mode: "oauth" }),
        expect.objectContaining({ platform: "freelancer", mode: "oauth" }),
        expect.objectContaining({ platform: "custom", mode: "local-watcher" }),
      ]),
    );
    expect(snapshot.adminSignals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "Kill switch", status: "armed" }),
      ]),
    );
  });

  it("creates a bounty with AI risk pricing and bilingual fields", () => {
    const bounty = createMarketplaceBounty({
      title: "Build a lead list",
      titleZh: "整理潜在线索表",
      bountyCents: 120_000,
      judgingMode: "manual",
      summary: "Find qualified SaaS founders.",
      summaryZh: "寻找合格的 SaaS 创始人。",
    });

    expect(bounty.feeRateBps).toBe(100);
    expect(bounty.titleZh).toBe("整理潜在线索表");
    expect(getMarketplaceSnapshot().bounties[0]).toMatchObject({
      id: bounty.id,
      feeRateBps: 100,
    });
  });

  it("ingests local watcher opportunities while rejecting session material", () => {
    expect(() =>
      ingestWatcherOpportunity({
        sourceId: "src_custom",
        platform: "custom",
        url: "https://private-board.test/jobs/7",
        title: "Draft a competitor map",
        capturedAt: "2026-06-25T09:00:00.000Z",
        sessionCookie: "do-not-store",
      }),
    ).toThrow("Local watcher payloads must not include session cookies.");

    const opportunity = ingestWatcherOpportunity({
      sourceId: "src_custom",
      platform: "custom",
      url: "https://private-board.test/jobs/7",
      title: "Draft a competitor map",
      capturedAt: "2026-06-25T09:00:00.000Z",
    });

    expect(opportunity).toMatchObject({
      platform: "custom",
      status: "new",
      secretsStored: false,
    });
    expect(getMarketplaceSnapshot().opportunities[0].id).toBe(opportunity.id);
  });
});
