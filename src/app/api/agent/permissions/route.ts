import { validateAgentPermission } from "@/domain/taskwanted";

export async function POST(request: Request) {
  const body = await request.json();
  const result = validateAgentPermission({
    requested: body.requested ?? "opportunity_discovery",
    publisherAllowed: body.publisherAllowed ?? "opportunity_discovery",
    platformCeiling: body.platformCeiling ?? "prepare_delivery_framework",
  });

  return Response.json(result, { status: result.allowed ? 200 : 403 });
}
