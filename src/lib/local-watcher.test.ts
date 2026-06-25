import { describe, expect, it } from "vitest";
import { buildWatcherPayload, parseOpportunityFromHtml } from "@/lib/local-watcher";

describe("local watcher helpers", () => {
  it("extracts an opportunity title from user-approved page HTML", () => {
    expect(
      parseOpportunityFromHtml({
        url: "https://private-board.test/jobs/77",
        html: "<html><head><title>AI QA bounty | Board</title></head><body></body></html>",
      }),
    ).toEqual({
      url: "https://private-board.test/jobs/77",
      title: "AI QA bounty",
    });
  });

  it("builds an API payload without session material", () => {
    expect(
      buildWatcherPayload({
        sourceId: "src_custom",
        platform: "custom",
        url: "https://private-board.test/jobs/77",
        title: "AI QA bounty",
        capturedAt: "2026-06-25T10:00:00.000Z",
      }),
    ).toEqual({
      sourceId: "src_custom",
      platform: "custom",
      url: "https://private-board.test/jobs/77",
      title: "AI QA bounty",
      capturedAt: "2026-06-25T10:00:00.000Z",
    });
  });
});
