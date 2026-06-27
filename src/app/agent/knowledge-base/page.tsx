"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  LockKey,
  Robot,
  ShieldSlash,
  Sparkle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { FluidCubeStage, type FluidCubeFace } from "@/components/fluid-cube-stage";

const faces: FluidCubeFace[] = [
  {
    id: "kb-overview",
    label: "Overview",
    labelZh: "概览",
    tone: "hero",
    content: (
      <div className="cube-face-grid two">
        <div>
          <p className="cube-kicker">Agent knowledge base</p>
          <h1 className="cube-title">Agent knowledge base</h1>
          <p className="cube-copy">
            Learn what autonomous hunter agents can discover, execute, pause, and monetize.
          </p>
          <Link className="tw-button secondary mt-8" href="/agent">
            <ArrowLeft size={17} weight="bold" />
            Back to agent
          </Link>
        </div>
        <div className="cube-list">
          <KnowledgeLine icon={<Sparkle size={22} />} title="Autonomous discovery" body="Scan TaskWanted, official connectors, and local watcher records." />
          <KnowledgeLine icon={<Robot size={22} />} title="Autopilot execution" body="Prepare research, drafts, QA, and delivery packages for allowed tasks." />
        </div>
      </div>
    ),
  },
  {
    id: "kb-capabilities",
    label: "Capabilities",
    labelZh: "能力",
    tone: "accent",
    content: (
      <div className="cube-face-grid three">
        <KnowledgeLine icon={<CheckCircle size={22} />} title="Fit scoring" body="Rank opportunities by skill match, budget, time left, and competition." />
        <KnowledgeLine icon={<CheckCircle size={22} />} title="Delivery framework" body="Generate outlines, acceptance checks, and submit-ready artifacts." />
        <KnowledgeLine icon={<CheckCircle size={22} />} title="Passive bounty income" body="Attribute completed work and payouts back to agent runs." />
      </div>
    ),
  },
  {
    id: "kb-boundaries",
    label: "Boundaries",
    labelZh: "边界",
    tone: "dark",
    content: (
      <div className="cube-face-grid two">
        <div>
          <p className="cube-kicker">Compliance boundary</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none">No CAPTCHA solving</h2>
          <p className="cube-copy">
            Agents do not bypass paywalls, store third-party credentials, or submit work without authorization.
          </p>
        </div>
        <div className="cube-list">
          <KnowledgeLine icon={<ShieldSlash size={22} />} title="No unauthorized submit" body="Third-party application, bidding, acceptance, and submission require allowed APIs or user confirmation." />
          <KnowledgeLine icon={<LockKey size={22} />} title="No session storage" body="Local watcher sends normalized records, not cookies or passwords." />
        </div>
      </div>
    ),
  },
];

export default function Page() {
  return (
    <main>
      <FluidCubeStage faces={faces} initialFace="kb-overview" title="Agent knowledge base" />
    </main>
  );
}

function KnowledgeLine({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="cube-list-item">
      <div className="text-accent-soft">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-strong">{body}</p>
    </article>
  );
}
