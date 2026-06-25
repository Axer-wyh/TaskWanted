export type WatcherPlatform = "upwork" | "freelancer" | "custom";

export type ParsedOpportunity = {
  url: string;
  title: string;
};

export type WatcherPayload = ParsedOpportunity & {
  sourceId: string;
  platform: WatcherPlatform;
  capturedAt: string;
};

export function parseOpportunityFromHtml(input: {
  url: string;
  html: string;
}): ParsedOpportunity {
  const title = extractTitle(input.html);

  return {
    url: input.url,
    title,
  };
}

export function buildWatcherPayload(input: WatcherPayload): WatcherPayload {
  return {
    sourceId: input.sourceId,
    platform: input.platform,
    url: input.url,
    title: input.title,
    capturedAt: input.capturedAt,
  };
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch?.[1]?.replace(/\s+/g, " ").trim();

  if (!rawTitle) {
    return "Untitled external opportunity";
  }

  return rawTitle.split("|")[0]?.trim() || rawTitle;
}
