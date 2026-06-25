import { BountiesExperience } from "@/app/bounties/bounties-experience";
import { getMarketplaceSnapshot } from "@/lib/mvp-store";

export default function BountiesPage() {
  return <BountiesExperience snapshot={getMarketplaceSnapshot()} />;
}
