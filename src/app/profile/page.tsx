"use client";

import {
  BellRinging,
  Coins,
  IdentificationCard,
  PlugsConnected,
  Target,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { FluidCubeStage, type FluidCubeFace } from "@/components/fluid-cube-stage";

const faces: FluidCubeFace[] = [
  {
    id: "profile-identity",
    label: "Identity",
    labelZh: "身份",
    tone: "hero",
    content: (
      <div className="cube-face-grid two">
        <div>
          <p className="cube-kicker">Signed-in user center</p>
          <h1 className="cube-title">Profile center</h1>
          <p className="cube-copy">
            Manage your avatar, wallet, hunter role, bounty activity, agent runs, and payouts.
          </p>
        </div>
        <div className="cube-list">
          <ProfileLine icon={<IdentificationCard size={22} />} label="Display name" value="TaskWanted Hunter" />
          <ProfileLine icon={<Target size={22} />} label="Wallet" value="0xA17...9C4E" />
          <ProfileLine icon={<Coins size={22} />} label="Agent credits" value="5,000" />
        </div>
      </div>
    ),
  },
  {
    id: "profile-tasks",
    label: "Tasks",
    labelZh: "任务",
    tone: "plain",
    content: (
      <div className="cube-face-grid three">
        <ProfileCard title="My posted bounties" value="2" body="Funded contests waiting for blind entries." />
        <ProfileCard title="My submissions" value="4" body="Entries pending judgment or payout." />
        <ProfileCard title="Agent tracked opportunities" value="9" body="Autonomous watcher and board targets." />
      </div>
    ),
  },
  {
    id: "profile-payouts",
    label: "Payouts",
    labelZh: "收益",
    tone: "accent",
    content: (
      <div className="cube-face-grid two">
        <div>
          <p className="cube-kicker">Payout records</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none">Payout records</h2>
          <p className="cube-copy">
            Stripe sandbox events, Base USDC pilot records, refunds, and failed payout states live here.
          </p>
        </div>
        <div className="cube-list">
          <ProfileCard title="Released" value="$420" body="Agent attributed bounty income." />
          <ProfileCard title="Pending" value="$180" body="Winner selection queued for release." />
        </div>
      </div>
    ),
  },
  {
    id: "profile-sources",
    label: "Sources",
    labelZh: "来源",
    tone: "dark",
    content: (
      <div className="cube-face-grid two">
        <div>
          <p className="cube-kicker">Source access</p>
          <h2 className="mt-4 text-5xl font-semibold leading-none">Local watcher status</h2>
          <p className="cube-copy">
            Revoke external sources, inspect parser failures, and confirm no session cookies are stored.
          </p>
        </div>
        <div className="cube-list">
          <ProfileLine icon={<PlugsConnected size={22} />} label="Upwork OAuth" value="Connected" />
          <ProfileLine icon={<BellRinging size={22} />} label="Custom watcher" value="Local only" />
        </div>
      </div>
    ),
  },
];

export default function Page() {
  return (
    <main>
      <FluidCubeStage faces={faces} initialFace="profile-identity" title="Profile center" />
    </main>
  );
}

function ProfileLine({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="cube-list-item">
      <div className="text-accent-soft">{icon}</div>
      <p className="mt-3 font-mono text-xs text-muted">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </article>
  );
}

function ProfileCard({ title, value, body }: { title: string; value: string; body: string }) {
  return (
    <article className="cube-list-item">
      <p className="font-mono text-xs text-muted">{title}</p>
      <h2 className="mt-3 text-4xl font-semibold">{value}</h2>
      <p className="mt-3 text-sm leading-6 text-muted-strong">{body}</p>
    </article>
  );
}
