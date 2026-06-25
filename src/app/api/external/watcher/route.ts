import { ingestWatcherOpportunity } from "@/lib/mvp-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const opportunity = ingestWatcherOpportunity({
      sourceId: String(body.sourceId ?? ""),
      platform: body.platform ?? "custom",
      url: String(body.url ?? ""),
      title: String(body.title ?? ""),
      capturedAt: String(body.capturedAt ?? new Date().toISOString()),
      sessionCookie: body.sessionCookie,
    });

    return Response.json({ opportunity }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Invalid watcher payload." },
      { status: 400 },
    );
  }
}
