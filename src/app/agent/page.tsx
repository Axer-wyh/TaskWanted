import { AgentExperience } from "@/app/agent/agent-experience";
import { getMarketplaceSnapshot } from "@/lib/mvp-store";

export default function AgentPage() {
  return <AgentExperience snapshot={getMarketplaceSnapshot()} />;
}
