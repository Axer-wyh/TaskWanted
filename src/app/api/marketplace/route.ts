import {
  createMarketplaceBounty,
  getMarketplaceSnapshot,
} from "@/lib/mvp-store";

export async function GET() {
  return Response.json(getMarketplaceSnapshot());
}

export async function POST(request: Request) {
  const body = await request.json();
  const bounty = createMarketplaceBounty({
    title: String(body.title ?? ""),
    titleZh: String(body.titleZh ?? ""),
    bountyCents: Number(body.bountyCents ?? 0),
    judgingMode: body.judgingMode ?? "manual",
    summary: String(body.summary ?? ""),
    summaryZh: String(body.summaryZh ?? ""),
  });

  return Response.json({ bounty }, { status: 201 });
}
