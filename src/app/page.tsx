import { HomeExperience } from "@/app/home-experience";
import { getMarketplaceSnapshot } from "@/lib/mvp-store";

export default function Home() {
  return <HomeExperience snapshot={getMarketplaceSnapshot()} />;
}
