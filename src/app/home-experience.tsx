"use client";

import FluidCubeScroll from "@/components/pixel-perfect/fluid-cube-scroll";
import type { MarketplaceSnapshot } from "@/lib/mvp-store";

type HomeExperienceProps = {
  snapshot: MarketplaceSnapshot;
};

export function HomeExperience({ snapshot }: HomeExperienceProps) {
  return (
    <main data-bounty-count={snapshot.bounties.length}>
      <FluidCubeScroll />
    </main>
  );
}
